import re

with open('src/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the specific string replacement that failed earlier because it didn't match perfectly
old_progress = '''            <View style={styles.progressGrid}>
              <MetricTile label="TOTAL DIST" value="120" unit="km" style={styles.flexHalf} />
              <MetricTile label="ELEVATION GAIN" value="4,500" unit="m" style={styles.flexHalf} />
            </View>'''

new_progress = '''            <View style={styles.progressGrid}>
              <MetricTile label="TOTAL DIST" value={totalDistance.toFixed(1)} unit="km" style={styles.flexHalf} />
              <MetricTile label="ELEVATION GAIN" value={Math.round(totalElevation).toString()} unit="m" style={styles.flexHalf} />
            </View>'''

content = content.replace(old_progress, new_progress)

with open('src/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Progress in Home Screen 2')
