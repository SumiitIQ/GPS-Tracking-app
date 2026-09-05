import re

with open('src/app/trek/[id].tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace dummy gpx for Kalsubai and Rajmachi with an empty string so they can't be navigated
content = content.replace(
    "'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx', difficulty_self_rating: 'Hard' }]); // using same dummy gpx for now",
    "'', difficulty_self_rating: 'Hard' }]); // Removed fake route"
)

content = content.replace(
    "'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx', difficulty_self_rating: 'Medium' }]); // using same dummy gpx",
    "'', difficulty_self_rating: 'Medium' }]); // Removed fake route"
)

# Update the "Navigate Route" button to check if gpx_url is empty
btn_pattern = r'<TouchableOpacity[^>]*onPress=\{.*?router\.push[^>]*\}>.*?Navigate Route.*?<\/TouchableOpacity>'
new_btn = '''
                  <TouchableOpacity 
                    style={[styles.btnAction, !route.gpx_url && { opacity: 0.5 }]}
                    onPress={() => {
                      if (!route.gpx_url) {
                        Alert.alert('Route Unavailable', 'The actual GPX path data for this trek has not been uploaded yet.');
                      } else {
                        router.push({ pathname: '/(tabs)/navigate', params: { routeUrl: route.gpx_url, title: route.title } });
                      }
                    }}
                    activeOpacity={route.gpx_url ? 0.8 : 1}
                  >
                    <MaterialIcons name="navigation" size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Typography variant="labelCaps" style={{ color: '#fff' }}>
                      {route.gpx_url ? "Navigate Route" : "No GPX Data"}
                    </Typography>
                  </TouchableOpacity>
'''
content = re.sub(btn_pattern, new_btn, content, flags=re.DOTALL)

with open('src/app/trek/[id].tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated trek details routing logic')
