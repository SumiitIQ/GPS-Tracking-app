import re

with open('src/screens/AuthScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Animated.View style={[{ transform: [{ scale: pulseAnim }], marginBottom: 16 }]}>
              <AppLogo width={100} height={100} />
            </Animated.View>
            <Text style={styles.appName}>PrecisionTrack</Text>'''

pattern = r'          \{\/\* Logo Section \*\/.*?<Text style=\{styles\.appName\}>PrecisionTrack<\/Text>'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/screens/AuthScreen.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
