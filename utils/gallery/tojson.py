import sys
import argparse
import os
import json
from datetime import datetime
from PIL import Image


parser = argparse.ArgumentParser(description="Tojson")
parser.add_argument("image_dir", help="The image directory to parse")
args = parser.parse_args()


if not os.path.isdir(args.image_dir):
    print(
        f"Error: '{args.image_dir}' is not a valid directory should but ./gallery-gmfc/...",
        file=sys.stderr,
    )
    sys.exit(1)


# Directory containing images
image_dir = args.image_dir
print(f"Processing images directory: {image_dir}")
image_dir_with_folder = image_dir.replace("./gallery-gmfc/", "/" "")

# Thumbnail directory
thumb_dir = os.path.join(image_dir, "thumbnails")
os.makedirs(thumb_dir, exist_ok=True)

# Output JSON file
output_file = "images.json"

# Supported image extensions
image_extensions = (".jpg", ".jpeg", ".png", ".gif", ".webp")

# Max sizes
MAX_IMAGE_SIZE = 2048
MAX_THUMB_WIDTH = 360

# Collect image info
images = []

for root, dirs, files in os.walk(image_dir):
    # Skip thumbnail folder itself
    if os.path.abspath(root) == os.path.abspath(thumb_dir):
        continue

    for file in files:
        if file.lower().endswith(image_extensions):
            file_path = os.path.join(root, file)

            # Get modification time
            mtime = os.path.getmtime(file_path)
            date_str = datetime.fromtimestamp(mtime).strftime("%Y-%m-%d %H:%M:%S")

            try:
                with Image.open(file_path) as img:
                    width, height = img.size

                    # 🔹 Resize original if larger than 2048px
                    if width > MAX_IMAGE_SIZE or height > MAX_IMAGE_SIZE:
                        img.thumbnail((MAX_IMAGE_SIZE, MAX_IMAGE_SIZE), Image.LANCZOS)
                        img.save(file_path)
                        width, height = img.size  # update dimensions

            except Exception as e:
                print(f"Error reading {file}: {e}")
                continue

            # Add info to JSON list
            images.append(
                {
                    "name": image_dir_with_folder + file,
                    "date": date_str,
                    "width": width,
                    "height": height,
                }
            )

            # Create thumbnail
            thumb_path = os.path.join(thumb_dir, file)
            if os.path.isfile(thumb_path):
                continue

            try:
                with Image.open(file_path) as img:
                    img.thumbnail((MAX_THUMB_WIDTH, MAX_THUMB_WIDTH), Image.LANCZOS)
                    img.save(thumb_path)
                    print(f"Thumbnail created: {thumb_path}")

            except Exception as e:
                print(f"Error creating thumbnail for {file}: {e}")

# Save JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(images, f, indent=4)

print(f"Saved {len(images)} images to {output_file}")
