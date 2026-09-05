import re

with open('src/screens/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { useAuth } from \'../context/AuthContext\';', 'import { useAuth } from \'../context/AuthContext\';\nimport AppLogo from \'../components/AppLogo\';')

with open('src/screens/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
