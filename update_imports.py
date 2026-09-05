import re

with open('src/app/(tabs)/activity.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('Share } from', 'Share, Modal, TextInput, Alert } from')

with open('src/app/(tabs)/activity.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Imports updated.")
