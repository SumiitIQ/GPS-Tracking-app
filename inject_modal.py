import re

with open('src/app/(tabs)/activity.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

modal_ui = '''
      {/* Submit for Approval Modal */}
      <Modal visible={submitModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Submit Route for Verification</Text>
            <Text style={styles.modalDesc}>Send this GPX track to the Admin to be verified and added as a public Trek route.</Text>
            
            <Text style={styles.inputLabel}>Trek Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Pandavleni Caves"
              placeholderTextColor="#9ca3af"
              value={trekName}
              onChangeText={setTrekName}
            />

            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.difficultyRow}>
              {['Easy', 'Medium', 'Hard'].map((diff) => (
                <TouchableOpacity 
                  key={diff}
                  style={[styles.diffBtn, difficulty === diff && styles.diffBtnActive]}
                  onPress={() => setDifficulty(diff)}
                >
                  <Text style={[styles.diffBtnText, difficulty === diff && styles.diffBtnTextActive]}>{diff}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setSubmitModalVisible(false)} disabled={isSubmitting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmit} onPress={submitRouteForApproval} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSubmitText}>Submit Route</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
'''

content = content.replace('    </View>\n  );\n}\n', modal_ui + '  );\n}\n')

styles_to_add = '''
  pendingBadge: { padding: 12, backgroundColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#f59e0b' },
  pendingText: { color: '#fcd34d', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1f2937', borderRadius: 16, padding: 24 },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 8 },
  modalDesc: { color: '#9ca3af', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputLabel: { color: '#d1d5db', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  textInput: { backgroundColor: '#111827', color: '#fff', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#374151', marginBottom: 20 },
  difficultyRow: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  diffBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#374151', alignItems: 'center' },
  diffBtnActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  diffBtnText: { color: '#9ca3af', fontWeight: '600' },
  diffBtnTextActive: { color: '#fff', fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: 'transparent' },
  modalCancelText: { color: '#9ca3af', fontWeight: '700' },
  modalSubmit: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', backgroundColor: '#10b981' },
  modalSubmitText: { color: '#fff', fontWeight: '700' }
'''

content = content.replace('  emptyText: { color: \'#9ca3af\', textAlign: \'center\', lineHeight: 22 }', '  emptyText: { color: \'#9ca3af\', textAlign: \'center\', lineHeight: 22 },' + styles_to_add)

with open('src/app/(tabs)/activity.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Modal UI and styles updated.")
