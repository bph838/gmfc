"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

function findProjectRoot(startDir) {
  let dir = startDir;
  while (!fs.existsSync(path.join(dir, "package.json"))) {
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error(`Could not find package.json above ${startDir}`);
    }
    dir = parent;
  }
  return dir;
}

const ROOT = findProjectRoot(__dirname);

const DB_IMAGES = path.resolve(ROOT, "src/database/media/gallery_data.json");

const DB_VIDEOS = path.resolve(ROOT, "src/database/media/video_data.json");

const OUTPUT_MEDIA = path.resolve(
  ROOT,
  ".build/gallery/gallery_ordered.json",
);

test("Verify the gallery contains the images and videos", () => {

    const images = JSON.parse(fs.readFileSync(DB_IMAGES, "utf8"));
    const videos = JSON.parse(fs.readFileSync(DB_VIDEOS, "utf8"));
    const rawSize = images.length + videos.length;

    const media = JSON.parse(fs.readFileSync(OUTPUT_MEDIA, "utf8"));



  assert.equal(
      rawSize,
      media.length,
      `expected ${rawSize} media items from gallery_ordered.json, but .build/gallery/gallery_ordered.json has ${media.length}`,
    );

});
