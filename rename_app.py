import json

with open('app.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"Nakshtra"', '"Nirdesh"')
content = content.replace('Nakshtra uses GPS', 'Nirdesh uses GPS')
content = content.replace('"nakshtra"', '"nirdesh"')

with open('app.json', 'w', encoding='utf-8') as f:
    f.write(content)

with open('src/screens/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    auth = f.read()

auth = auth.replace('>Nakshtra<', '>Nirdesh<')

with open('src/screens/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(auth)

with open('src/screens/MapScreen.tsx', 'r', encoding='utf-8') as f:
    map_content = f.read()

map_content = map_content.replace('Nakshtra needs GPS', 'Nirdesh needs GPS')

with open('src/screens/MapScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(map_content)

print('App renamed to Nirdesh successfully')
