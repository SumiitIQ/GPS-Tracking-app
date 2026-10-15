from PIL import Image
import os

img_path = r'C:/Users/USER/.gemini/antigravity/brain/97c9f6a6-7d76-4206-bd17-e10e1eeafdaf/.user_uploaded/media_1790415297119.jpg'
out_dir = r'assets/images/navigate_assets'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)

# Save full background
img.save(f'{out_dir}/navigate_bg.jpg')

# Crop thumbnails (rough estimates for 456x1024)
img.crop((215, 260, 295, 320)).save(f'{out_dir}/thumb_mountain.jpg')
img.crop((290, 380, 375, 435)).save(f'{out_dir}/thumb_cave.jpg')
img.crop((115, 510, 200, 565)).save(f'{out_dir}/thumb_sunset.jpg')

print('Navigate assets created.')
