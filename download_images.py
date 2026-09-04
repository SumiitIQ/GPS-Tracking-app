import urllib.request
import os

# Download from Placehold.co which is very reliable for placeholders
urls = {
    'pandavleni.jpg': 'https://placehold.co/800x600/3b82f6/white/jpeg?text=Pandavleni+Caves',
    'kalsubai.jpg': 'https://placehold.co/800x600/10b981/white/jpeg?text=Kalsubai+Peak',
    'rajmachi.jpg': 'https://placehold.co/800x600/f59e0b/white/jpeg?text=Rajmachi+Fort'
}

for filename, url in urls.items():
    path = os.path.join('assets', 'images', filename)
    print(f'Downloading {filename}...')
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response, open(path, 'wb') as out_file:
        out_file.write(response.read())

print('Done!')
