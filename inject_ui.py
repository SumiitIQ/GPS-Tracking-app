import re

with open('src/app/(tabs)/activity.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

action_row_replacement = '''
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={[styles.btn, { flex: 1, marginRight: 10, backgroundColor: '#2563eb' }]}
                    onPress={() => router.push({ pathname: '/(tabs)/navigate', params: { routeUrl: item.gpx_url, title: item.title } })}
                  >
                    <Text style={styles.btnText}>View / Navigate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.btn, { backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }]}
                    onPress={() => handleShareGPX(item.gpx_url, item.title)}
                  >
                    <Text style={styles.btnText}>Share</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Admin Submit Button */}
                <View style={{ marginTop: 10 }}>
                  {item.description && item.description.startsWith('[PENDING_APPROVAL]') ? (
                    <View style={styles.pendingBadge}>
                      <Text style={styles.pendingText}>Pending Admin Approval ?</Text>
                    </View>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.btn, { backgroundColor: '#10b981' }]}
                      onPress={() => openSubmitModal(item.id)}
                    >
                      <Text style={styles.btnText}>Submit for Verification</Text>
                    </TouchableOpacity>
                  )}
                </View>
'''

# We want to replace the whole actionRow up to the end of the actionRow view closing tag.
# We'll just replace the original actionRow block.
pattern = r'<View style=\{styles\.actionRow\}>.*?</View>\s*</View>'
new_block = action_row_replacement + '              </View>'
content = re.sub(pattern, new_block, content, flags=re.DOTALL)

with open('src/app/(tabs)/activity.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("RenderItem updated.")
