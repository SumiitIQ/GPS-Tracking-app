import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Share, Modal, TextInput, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ActivityTab() {
  const { user, signOut } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trekName, setTrekName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openSubmitModal = (id: string) => {
    setSelectedRouteId(id);
    setTrekName('');
    setDifficulty('Medium');
    setSubmitModalVisible(true);
  };

  const submitRouteForApproval = async () => {
    if (!trekName.trim()) {
      Alert.alert('Error', 'Please enter a trek name.');
      return;
    }
    setIsSubmitting(true);
    // Use description to track pending state to avoid schema errors
    const pendingText = '[PENDING_APPROVAL] ' + trekName + ' - ' + difficulty;
    
    const { error } = await supabase
      .from('routes')
      .update({ description: pendingText, difficulty_self_rating: difficulty })
      .eq('id', selectedRouteId);
      
    setIsSubmitting(false);
    
    if (error) {
      Alert.alert('Error', 'Failed to submit route.');
    } else {
      Alert.alert('Success', 'Route submitted for Admin review!');
      setSubmitModalVisible(false);
      fetchMyRoutes();
    }
  };


  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchMyRoutes();
      }
    }, [user?.id])
  );

  const fetchMyRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('submitter_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setRoutes(data);
    setLoading(false);
  };

  const formatDist = (m: number) => m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${Math.round(m)} m`;

  const handleShareGPX = async (gpx_url: string, title: string) => {
    try {
      await Share.share({
        message: `Check out my recorded trek: ${title}!\n\nDownload my GPX Route here:\n${gpx_url}`,
        url: gpx_url, // For iOS
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>My Activity</Text>
        <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Recorded Treks</Text>
        <Text style={styles.routeCount}>{routes.length} Tracks</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#ef4444" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 130 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.title || 'My Expedition'}</Text>
              <View style={styles.statsRow}>
                <View>
                  <Text style={styles.statLabel}>DISTANCE</Text>
                  <Text style={styles.statValue}>{formatDist(item.distance)}</Text>
                </View>
                <View>
                  <Text style={styles.statLabel}>DATE</Text>
                  <Text style={styles.statValue}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              
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
              </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>You haven't recorded any treks yet.</Text>
            </View>
          )}
        />
      )}

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060912' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 50 : 70,
    paddingHorizontal: 20, paddingBottom: 20,
    backgroundColor: '#0a1020', borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  signOutBtn: { backgroundColor: 'rgba(239,68,68,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  signOutText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 24, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  routeCount: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 16, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statLabel: { color: '#6b7280', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statValue: { color: '#f3f4f6', fontSize: 14, fontWeight: '600', marginTop: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyState: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, marginTop: 20 },
  emptyText: { color: '#9ca3af', textAlign: 'center', lineHeight: 22 },
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

});
