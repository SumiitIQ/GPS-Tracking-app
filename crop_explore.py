from PIL import Image
import os

img_path = r'C:/Users/USER/.gemini/antigravity/brain/97c9f6a6-7d76-4206-bd17-e10e1eeafdaf/.user_uploaded/media_1790415112099.jpg'
out_dir = r'assets/images/explore_assets'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)

# Save full background
img.save(f'{out_dir}/explore_bg.jpg')

# Crop thumbnails (rough estimates for a 456x1024 image)
# Strip is around y=680 to 750, x=220 to 440
# Thumb 1
img.crop((235, 685, 305, 745)).save(f'{out_dir}/thumb_1.jpg')
# Thumb 2
img.crop((310, 685, 365, 745)).save(f'{out_dir}/thumb_2.jpg')
# Thumb 3
img.crop((370, 685, 435, 745)).save(f'{out_dir}/thumb_3.jpg')

print('Explore assets created.')
