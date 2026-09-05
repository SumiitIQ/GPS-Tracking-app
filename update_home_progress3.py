import re

with open('src/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Using regex since direct replace didn't work (might be spacing issues)
pattern = r'<MetricTile label="TOTAL DIST" value="120" unit="km" style=\{styles\.flexHalf\} \/>\s*<MetricTile label="ELEVATION GAIN" value="4,500" unit="m" style=\{styles\.flexHalf\} \/>'
new_content = r'<MetricTile label="TOTAL DIST" value={totalDistance.toFixed(1)} unit="km" style={styles.flexHalf} />\n              <MetricTile label="ELEVATION GAIN" value={Math.round(totalElevation).toString()} unit="m" style={styles.flexHalf} />'

content = re.sub(pattern, new_content, content)

with open('src/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done regex replace.')
