import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { exec } from 'child_process';
import sharp from 'sharp';
import exifr from 'exifr';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']);
const BUCKET = 'gmfc-images-gallery';
const MAX_THUMB_WIDTH = 360;
const CACHE_CONTROL = 'max-age=31536000, public';
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.tiff': 'image/tiff',
};


const s3 = new S3Client({ region: 'eu-west-2' });


function getDateDir() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  return `${dd}${mm}${yy}`;
}

function formatDate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

async function getImageDate(filePath, buffer) {
  try {
    const exifDate = await exifr.parse(buffer, ['DateTimeOriginal', 'CreateDate', 'ModifyDate']);
    const dateTaken = exifDate?.DateTimeOriginal || exifDate?.CreateDate || exifDate?.ModifyDate;
    if (dateTaken) return dateTaken;
  } catch {
    // fall through to file mtime
  }
  return fs.statSync(filePath).mtime;
}

async function uploadToS3(key, buffer, contentType) {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: CACHE_CONTROL,
    }),
  );
}

async function processForAWS(resolvedDir, images) {
  const dateDir = getDateDir();
  const jsonEntries = [];

  for (const relPath of images) {
    const filePath = path.join(resolvedDir, relPath);
    const fileName = path.basename(relPath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';

    const originalBuffer = fs.readFileSync(filePath);
    const metadata = await sharp(originalBuffer).rotate().metadata();
    const { width, height } = metadata;
    const dateTaken = await getImageDate(filePath, originalBuffer);

    const thumbnailBuffer = await sharp(originalBuffer)
      .rotate()
      .resize({ width: MAX_THUMB_WIDTH, withoutEnlargement: true })
      .toBuffer();

    const originalKey = `${dateDir}/${fileName}`;
    const thumbnailKey = `${dateDir}/thumbnails/${fileName}`;

    await uploadToS3(originalKey, originalBuffer, contentType);
    await uploadToS3(thumbnailKey, thumbnailBuffer, contentType);

    console.log(`Uploaded ${originalKey} and ${thumbnailKey}`);

    jsonEntries.push({
      name: `/${originalKey}`,
      date: formatDate(new Date(dateTaken)),
      width,
      height,
    });
  }

  const outputFile = path.join(resolvedDir, 'images.json');
  fs.writeFileSync(outputFile, JSON.stringify(jsonEntries, null, 4));
  console.log(`Saved ${jsonEntries.length} images to ${outputFile}`);

  exec(`start "" "${outputFile}"`);
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter directory path: ', (dirPath) => {
  rl.close();

  const resolved = path.resolve(dirPath);

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    console.error(`Not a valid directory: ${resolved}`);
    process.exitCode = 1;
    return;
  }

  const entries = fs.readdirSync(resolved, { recursive: true });
  const images = entries.filter(
    (entry) =>
      IMAGE_EXTENSIONS.has(path.extname(entry).toLowerCase()) &&
      !entry.split(path.sep).includes('thumbnails'),
  );

  console.log(images);

  processForAWS(resolved, images).catch((err) => {
    console.error('Upload failed:', err);
    process.exitCode = 1;
  });
});
