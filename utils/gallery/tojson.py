import os
import json
from datetime import datetime
from PIL import Image

# Directory containing images
image_dir = r".\\"

# Thumbnail directory
thumb_dir = os.path.join(image_dir, "thumbnails")
os.makedirs(thumb_dir, exist_ok=True)

# Output JSON file
output_file = "images.json"

# Supported image extensions
image_extensions = (".jpg", ".jpeg", ".png", ".gif", ".webp")

# Max thumbnail width
MAX_WIDTH = 300

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

            # Get image dimensions
            try:
                with Image.open(file_path) as img:
                    width, height = img.size
            except Exception as e:
                print(f"Error reading {file}: {e}")
                width, height = None, None

            # Add info to JSON list
            images.append(
                {"name": file, "date": date_str, "width": width, "height": height}
            )

            # Create thumbnail
            thumb_path = os.path.join(thumb_dir, file)
            if os.path.isfile(thumb_path):
                # Already exists, skip
                continue

            try:
                with Image.open(file_path) as img:
                    # Calculate new size
                    if width > MAX_WIDTH:
                        ratio = MAX_WIDTH / float(width)
                        new_height = int(height * ratio)
                        img = img.resize((MAX_WIDTH, new_height), Image.LANCZOS)
                    # Save thumbnail
                    img.save(thumb_path)
                    print(f"Thumbnail created: {thumb_path}")
            except Exception as e:
                print(f"Error creating thumbnail for {file}: {e}")

# Save JSON
with open(output_file, "w", encoding="utf-8") as f:
    json.dump(images, f, indent=4)

print(f"Saved {len(images)} images to {output_file}")
