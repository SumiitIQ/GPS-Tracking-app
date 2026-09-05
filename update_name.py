import json
import re

# 1. Update app.json
with open('app.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['expo']['name'] = 'Nakshtra'
data['expo']['slug'] = 'nakshtra'
data['expo']['scheme'] = 'nakshtra'

if 'ios' in data['expo']:
    data['expo']['ios']['infoPlist']['NSLocationWhenInUseUsageDescription'] = 'Nakshtra uses GPS to show your exact location on the map.'
    data['expo']['ios']['infoPlist']['NSLocationAlwaysAndWhenInUseUsageDescription'] = 'Nakshtra uses GPS in the background to track your route even when the app is minimized.'

if 'android' in data['expo'] and 'plugins' in data['expo']:
    # Replace in plugins
    pass  # Usually handled at the bottom

# It's easier to just string replace app.json for the descriptions
with open('app.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"PrecisionTrack"', '"Nakshtra"')
content = content.replace('PrecisionTrack uses GPS', 'Nakshtra uses GPS')
content = content.replace('"precisiontrackmobile"', '"nakshtra"')

with open('app.json', 'w', encoding='utf-8') as f:
    f.write(content)


# 2. Update AuthScreen.tsx
with open('src/screens/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    auth_content = f.read()

auth_content = auth_content.replace('>PrecisionTrack<', '>Nakshtra<')
with open('src/screens/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(auth_content)


# 3. Update MapScreen.tsx
with open('src/screens/MapScreen.tsx', 'r', encoding='utf-8') as f:
    map_content = f.read()

map_content = map_content.replace('PrecisionTrack needs GPS access', 'Nakshtra needs GPS access')
with open('src/screens/MapScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(map_content)

print('Replaced name in all files.')
