from PIL import Image
import os

img_path = r'C:/Users/USER/.gemini/antigravity/brain/97c9f6a6-7d76-4206-bd17-e10e1eeafdaf/.user_uploaded/media_1790415194146.jpg'
out_dir = r'assets/images/record_assets'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)

# Save full background
img.save(f'{out_dir}/record_bg.jpg')

# The graph is tricky to render with standard components. I'll crop the elevation graph from the screenshot just in case.
# Graph area approx: x: 180 to 380, y: 730 to 790 (on 456x1024)
img.crop((180, 725, 385, 785)).save(f'{out_dir}/elevation_graph.jpg')

print('Record assets created.')
