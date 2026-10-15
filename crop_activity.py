from PIL import Image
import os

img_path = r'C:/Users/USER/.gemini/antigravity/brain/97c9f6a6-7d76-4206-bd17-e10e1eeafdaf/.user_uploaded/media_1790415379605.jpg'
out_dir = r'assets/images/activity_assets'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)

# Save full background
img.save(f'{out_dir}/activity_bg.jpg')

# Crop thumbnails (rough estimates for 456x1024)
img.crop((15, 45, 80, 110)).save(f'{out_dir}/profile.jpg')
img.crop((20, 295, 170, 425)).save(f'{out_dir}/thumb_1.jpg')
img.crop((20, 500, 170, 630)).save(f'{out_dir}/thumb_2.jpg')
img.crop((20, 705, 170, 835)).save(f'{out_dir}/thumb_3.jpg')

print('Activity assets created.')
