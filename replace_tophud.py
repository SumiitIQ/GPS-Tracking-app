import re

with open('src/screens/MapScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for the topHud view
pattern = r'<View style=\{styles\.topHud\} pointerEvents="box-none">.*?</View>'
replacement = '''<View style={styles.topHud} pointerEvents="box-none">
          {/* GPS chip */}
          <View style={styles.gpsChip}>
            <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
            <Text style={styles.gpsText}>
              {!gpsReady ? 'ArcGIS Acquiring GPS...' : ArcGIS 3D ±m}
            </Text>
          </View>
          {/* Follow toggle */}
          <TouchableOpacity
            style={[styles.hudBtn, followMode && styles.hudBtnActive]}
            onPress={toggleFollow}
          >
            <MaterialIcons name={followMode ? "my-location" : "location-searching"} size={22} color={followMode ? "#fff" : "#9ca3af"} />
          </TouchableOpacity>
        </View>'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/screens/MapScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Replaced topHud successfully.")
