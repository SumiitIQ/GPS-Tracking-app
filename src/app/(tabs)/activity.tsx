import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Share, Modal, TextInput, Alert, Image
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type FilterTab = 'saved' | 'pending' | 'history';

export default function ActivityTab() {
  const { user, signOut } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('saved');
  const router = useRouter();
  const insets = useSafeAreaInsets();

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
    if (!trekName.trim()) { Alert.alert('Error', 'Please enter a trek name.'); return; }
    setIsSubmitting(true);
    const pendingText = '[PENDING_APPROVAL] ' + trekName + ' - ' + difficulty;
    const { data, error } = await supabase
      .from('routes').update({ description: pendingText, difficulty_self_rating: difficulty })
      .eq('id', selectedRouteId).select();
    setIsSubmitting(false);
    if (error || !data || data.length === 0) {
      Alert.alert('Error', 'Failed to submit!');
    } else {
      Alert.alert('Success', 'Route submitted for Admin review!');
      setSubmitModalVisible(false);
      fetchMyRoutes();
    }
  };

  useFocusEffect(useCallback(() => {
    if (user?.id) fetchMyRoutes();
  }, [user?.id]));

  const fetchMyRoutes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('routes').select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });
    setLoading(false);
    if (!error && data) setRoutes(data);
  };

  const handleShare = async (route: any) => {
    try {
      await Share.share({ message: `Check out my trek: ${route.name || 'Unnamed Route'} (${((route.distance_m || 0) / 1000).toFixed(1)} km)` });
    } catch {}
  };

  const filterTabs = [
    { key: 'saved' as FilterTab, label: 'Saved' },
    { key: 'pending' as FilterTab, label: 'Pending Sync' },
    { key: 'history' as FilterTab, label: 'History' },
  ];

  const filteredRoutes = activeFilter === 'saved' ? routes
    : activeFilter === 'pending' ? routes.filter(r => r.description?.includes('[PENDING_APPROVAL]'))
    : routes.slice(0, 5);

  const renderRoute = ({ item }: { item: any }) => {
    const km = ((item.distance_m || 0) / 1000).toFixed(1);
    const isPending = item.description?.includes('[PENDING_APPROVAL]');

    return (
      <View style={styles.routeCard}>
        <View style={styles.routeCardLeft}>
          <View style={styles.routeThumb}>
            <MaterialCommunityIcons name="map-marker-path" size={22} color="#2D7D78" />
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName} numberOfLines={1}>{item.name || 'Unnamed Route'}</Text>
            <Text style={styles.routeMeta}>{km} km</Text>
            {isPending && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pending Sync</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.routeActions}>
          <TouchableOpacity style={styles.syncBtn} onPress={() => openSubmitModal(item.id)}>
            <Text style={styles.syncBtnText}>Sync</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text style={[styles.filterTabText, activeFilter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#2D7D78" style={{ marginTop: 40 }} />
      ) : filteredRoutes.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#D1C9BD" />
          <Text style={styles.emptyTitle}>No saved routes yet</Text>
          <Text style={styles.emptySubtitle}>Start recording your first trek!</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.exploreBtnText}>Explore Treks</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRoute}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* SUBMIT MODAL */}
      <Modal visible={submitModalVisible} transparent animationType="slide" onRequestClose={() => setSubmitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Submit Route</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Trek name"
              placeholderTextColor="#9CA3AF"
              value={trekName}
              onChangeText={setTrekName}
            />
            <View style={styles.diffRow}>
              {['Easy','Medium','Hard'].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffChip, difficulty === d && styles.diffChipActive]}
                  onPress={() => setDifficulty(d)}
                >
                  <Text style={[styles.diffChipText, difficulty === d && styles.diffChipTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSubmitModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={submitRouteForApproval} disabled={isSubmitting}>
                {isSubmitting ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1C1C1E' },
  filterRow: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E5E0D8',
  },
  filterTabActive: { backgroundColor: '#2D7D78', borderColor: '#2D7D78' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterTabTextActive: { color: '#FFFFFF' },
  list: { paddingHorizontal: 20, paddingBottom: 120, gap: 12 },
  routeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  routeCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  routeThumb: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: '#EDF6F5',
    alignItems: 'center', justifyContent: 'center',
  },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  routeMeta: { fontSize: 13, color: '#9CA3AF' },
  pendingBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: '#FEF3C7', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  pendingText: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  routeActions: { marginLeft: 8 },
  syncBtn: {
    backgroundColor: '#EDF6F5', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  syncBtnText: { fontSize: 13, fontWeight: '600', color: '#2D7D78' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginBottom: 24 },
  exploreBtn: { backgroundColor: '#2D7D78', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 20 },
  modalInput: {
    backgroundColor: '#F5F2ED', borderRadius: 12, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15, color: '#1C1C1E', marginBottom: 16,
  },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  diffChip: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    backgroundColor: '#F5F2ED', alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E0D8',
  },
  diffChipActive: { backgroundColor: '#2D7D78', borderColor: '#2D7D78' },
  diffChipText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  diffChipTextActive: { color: '#FFFFFF' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E0D8', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  submitBtn: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#2D7D78', alignItems: 'center' },
  submitBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
});
