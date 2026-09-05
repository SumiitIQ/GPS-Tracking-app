import json

with open('app.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['expo']['icon'] = './assets/images/neon-app-icon.png'
if 'ios' in data['expo']:
    data['expo']['ios']['icon'] = './assets/images/neon-app-icon.png'

with open('app.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('app.json updated successfully.')
