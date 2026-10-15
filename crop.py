from PIL import Image
import os

img_path = r'C:/Users/USER/.gemini/antigravity/brain/97c9f6a6-7d76-4206-bd17-e10e1eeafdaf/.user_uploaded/media_1790414502746.jpg'
out_dir = r'assets/images/home_assets'
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path)

# 1. Profile Pic (Top left)
# Roughly x: 18, y: 15, w: 40, h: 40
img.crop((18, 15, 58, 55)).save(f'{out_dir}/profile.jpg')

# 2. Hero Background
# Full width, top to just above category pills (y=400)
img.crop((0, 0, 512, 430)).save(f'{out_dir}/hero_bg.jpg')

# 3. Cards (y ~ 490 to 580)
img.crop((18, 480, 168, 570)).save(f'{out_dir}/card_pandavleni.jpg')
img.crop((178, 480, 328, 570)).save(f'{out_dir}/card_anjaneri.jpg')
img.crop((338, 480, 488, 570)).save(f'{out_dir}/card_dugarwadi.jpg')

# 4. Continue Trek map
img.crop((20, 660, 492, 765)).save(f'{out_dir}/continue_bg.jpg')
img.crop((30, 695, 80, 745)).save(f'{out_dir}/continue_thumb.jpg')

# 5. Bottom Background
img.crop((0, 900, 512, 1024)).save(f'{out_dir}/bottom_bg.jpg')

print('Images cropped successfully.')
