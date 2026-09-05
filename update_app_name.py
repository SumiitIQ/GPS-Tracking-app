import json

with open('app.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['expo']['name'] = 'Nakshta'

with open('app.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('app.json name updated successfully.')
