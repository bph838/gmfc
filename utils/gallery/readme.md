#Gallery extraction

This will look through the files in /gallery-gmfc/[INSERT DIR]/ and resize them to a max size of 2048 and save a thumbnail to a thumbnail dir

 py -m pip install pillow    

 to run

 py tojson.py ./gallery-gmfc/[NAME OF DIR]/
 eg
 py tojson.py ./gallery-gmfc/010126/
 

to fix the cache time in AWS console

aws s3 cp s3://gmfc-images-gallery/210626/ s3://gmfc-images-gallery/210626/ \
  --recursive \
  --metadata-directive REPLACE \
  --cache-control "max-age=31536000, public"
