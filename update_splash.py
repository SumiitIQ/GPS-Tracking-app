import json

with open('app.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for plugin in data['expo']['plugins']:
    if isinstance(plugin, list) and plugin[0] == 'expo-splash-screen':
        plugin[1]['image'] = './assets/images/neon-app-icon.png'

with open('app.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('app.json splash updated successfully.')
