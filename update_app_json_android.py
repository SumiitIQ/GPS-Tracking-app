import json

with open('app.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

if 'android' in data['expo']:
    if 'adaptiveIcon' in data['expo']['android']:
        data['expo']['android']['adaptiveIcon']['foregroundImage'] = './assets/images/neon-app-icon.png'
    if 'notification' in data['expo']['android']:
        data['expo']['android']['notification']['icon'] = './assets/images/neon-app-icon.png'

with open('app.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('app.json android icons updated successfully.')
