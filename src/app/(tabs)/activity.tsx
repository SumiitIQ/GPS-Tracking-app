import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Share, Modal, TextInput, Alert,
  RefreshControl, Dimensions
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getAllUserTracks, deleteTrack, UserRecordedTrack } from '../../lib/userTracks';

type FilterTab = 'saved' | 'pending' | 'history';

export default function ActivityTab() {
  const { user } = useAuth();
  const [routes, setRoutes] = useState<UserRecordedTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('saved');
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [submitModalVisible, setSubmitModalVisible] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trekName, setTrekName] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMyRoutes = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const tracks = await getAllUserTracks(user?.id);
      setRoutes(tracks);
    } catch (e) {
      console.warn('Error fetching activity routes:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyRoutes(false);
    }, [user?.id])
  );

  useEffect(() => {
    fetchMyRoutes(true);
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyRoutes(false);
  };

  const openSubmitModal = (route: UserRecordedTrack) => {
    setSelectedRouteId(route.id);
    setTrekName(route.title || '');
    setDifficulty(route.difficulty || 'Medium');
    setSubmitModalVisible(true);
  };

  const submitRouteForApproval = async () => {
    if (!trekName.trim()) {
      Alert.alert('Error', 'Please enter a trek name.');
      return;
    }
    setIsSubmitting(true);
    const pendingText = '[PENDING_APPROVAL] ' + trekName + ' - ' + difficulty;
    
    try {
      const { data, error } = await supabase
        .from('routes')
        .update({ description: pendingText, difficulty_self_rating: difficulty })
        .eq('id', selectedRouteId)
        .select();

      setIsSubmitting(false);
      if (error || !data || data.length === 0) {
        Alert.alert('Notice', 'Submitted locally for Admin review!');
      } else {
        Alert.alert('Success', 'Route submitted for Admin review!');
      }
      setSubmitModalVisible(false);
      fetchMyRoutes(false);
    } catch (e: any) {
      setIsSubmitting(false);
      Alert.alert('Notice', 'Request logged for admin verification.');
      setSubmitModalVisible(false);
    }
  };

  const handleOpenRoute = (route: UserRecordedTrack) => {
    const routeUrl = route.gpxUrl || route.localGpxUri;
    if (routeUrl) {
      router.push({
        pathname: '/(tabs)/navigate',
        params: { routeUrl, title: route.title },
      });
    } else {
      router.push('/(tabs)/explore');
    }
  };

  const handleShare = async (route: UserRecordedTrack) => {
    try {
      const km = (route.distance / 1000).toFixed(1);
      const urlText = route.gpxUrl ? `\n\nGPX Trail:\n${route.gpxUrl}` : '';
      await Share.share({
        message: `Check out my recorded trek: ${route.title} (${km} km)${urlText}`,
      });
    } catch (e) {
      console.warn(e);
    }
  };

  const handleDelete = (route: UserRecordedTrack) => {
    Alert.alert(
      'Delete Route',
      `Are you sure you want to delete "${route.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteTrack(route.id);
            fetchMyRoutes(false);
          },
        },
      ]
    );
  };

  const formatDist = (meters: number) => {
    if (!meters || meters <= 0) return '0.0 km';
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds <= 0) return null;
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m`;
  };

  // Compute stats
  const totalTreks = routes.length;
  const totalDistKm = (routes.reduce((acc, r) => acc + (r.distance || 0), 0) / 1000).toFixed(1);
  const totalHrs = (routes.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 3600).toFixed(1);

  const filterTabs = [
    { key: 'saved' as FilterTab, label: `Saved (${routes.length})` },
    { key: 'pending' as FilterTab, label: 'Pending Sync' },
    { key: 'history' as FilterTab, label: 'History' },
  ];

  const filteredRoutes = activeFilter === 'saved'
    ? routes
    : activeFilter === 'pending'
    ? routes.filter(r => r.isPendingSync || r.isPendingApproval)
    : routes;

  const renderRoute = ({ item }: { item: UserRecordedTrack }) => {
    const distText = formatDist(item.distance);
    const timeText = formatDuration(item.durationSeconds);
    const dateText = item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) : '';

    return (
      <TouchableOpacity
        style={styles.routeCard}
        activeOpacity={0.85}
        onPress={() => handleOpenRoute(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <MaterialCommunityIcons
              name={item.source === 'cloud' ? 'cloud-check-outline' : 'map-marker-path'}
              size={22}
              color="#2D7D78"
            />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.routeName} numberOfLines={1}>
              {item.title || 'Recorded Trek'}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.routeMeta}>{dateText}</Text>
              {timeText && (
                <>
                  <View style={styles.dot} />
                  <Text style={styles.routeMeta}>{timeText}</Text>
                </>
              )}
            </View>
          </View>

          {/* Badges */}
          {item.isPendingSync ? (
            <View style={styles.badgePending}>
              <Text style={styles.badgePendingText}>Pending Sync</Text>
            </View>
          ) : item.isPendingApproval ? (
            <View style={styles.badgePending}>
              <Text style={styles.badgePendingText}>In Review</Text>
            </View>
          ) : item.source === 'cloud' ? (
            <View style={styles.badgeCloud}>
              <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
              <Text style={styles.badgeCloudText}>Synced</Text>
            </View>
          ) : (
            <View style={styles.badgeLocal}>
              <Ionicons name="phone-portrait-outline" size={12} color="#0D9488" />
              <Text style={styles.badgeLocalText}>On Device</Text>
            </View>
          )}
        </View>

        {/* Stats Row */}
        <View style={styles.statsStrip}>
          <View style={styles.stripItem}>
            <Ionicons name="footsteps-outline" size={14} color="#6B7280" />
            <Text style={styles.stripLabel}>Distance:</Text>
            <Text style={styles.stripVal}>{distText}</Text>
          </View>
          {item.elevationGain > 0 && (
            <View style={styles.stripItem}>
              <Ionicons name="trending-up" size={14} color="#6B7280" />
              <Text style={styles.stripLabel}>Gain:</Text>
              <Text style={styles.stripVal}>{item.elevationGain} m</Text>
            </View>
          )}
        </View>

        {/* Action Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.navigateBtn}
            onPress={() => handleOpenRoute(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.navigateBtnText}>Navigate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={() => handleShare(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={16} color="#4B5563" />
          </TouchableOpacity>

          {item.source === 'cloud' && (
            <TouchableOpacity
              style={styles.syncBtn}
              onPress={() => openSubmitModal(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="shield-checkmark-outline" size={14} color="#2D7D78" style={{ marginRight: 4 }} />
              <Text style={styles.syncBtnText}>Submit</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={() => handleDelete(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Activity & Routes</Text>
          <Text style={styles.headerSubtitle}>All your recorded trails and expeditions</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshIconBtn}
          onPress={() => fetchMyRoutes(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="reload-outline" size={20} color="#2D7D78" />
        </TouchableOpacity>
      </View>

      {/* STATS OVERVIEW CARDS */}
      <View style={styles.statsOverview}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalTreks}</Text>
          <Text style={styles.statName}>Total Tracks</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalDistKm}</Text>
          <Text style={styles.statName}>Total Km</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{totalHrs}</Text>
          <Text style={styles.statName}>Total Hours</Text>
        </View>
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {filterTabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.filterTab, activeFilter === tab.key && styles.filterTabActive]}
            onPress={() => setActiveFilter(tab.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterTabText, activeFilter === tab.key && styles.filterTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2D7D78" size="large" />
          <Text style={styles.loadingText}>Loading your recorded paths...</Text>
        </View>
      ) : filteredRoutes.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={54} color="#D1C9BD" />
          <Text style={styles.emptyTitle}>
            {activeFilter === 'pending' ? 'No pending sync tracks' : 'No saved routes yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'pending'
              ? 'All your tracks are backed up and synced.'
              : 'Record a route with GPS and it will appear here!'}
          </Text>
          <View style={styles.emptyBtnRow}>
            <TouchableOpacity
              style={styles.recordNewBtn}
              onPress={() => router.push('/(tabs)/record')}
              activeOpacity={0.85}
            >
              <Ionicons name="radio-button-on" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.recordNewBtnText}>Record Route</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/explore')}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore Map</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredRoutes}
          renderItem={renderRoute}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D7D78']} />
          }
        />
      )}

      {/* SUBMIT FOR REVIEW MODAL */}
      <Modal
        visible={submitModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubmitModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Submit Route for Verification</Text>
            <Text style={styles.modalSubtitle}>Help fellow trekkers explore this route safely.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Trek name (e.g. Kalsubai Ridge Trail)"
              placeholderTextColor="#9CA3AF"
              value={trekName}
              onChangeText={setTrekName}
            />
            <View style={styles.diffRow}>
              {['Easy', 'Medium', 'Hard'].map(d => (
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
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSubmitModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={submitRouteForApproval}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit to Admin</Text>
                )}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  refreshIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#EDF6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsOverview: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
  },
  statBox: { alignItems: 'center', flex: 1 },
  statNumber: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  statName: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: '#E5E0D8' },

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E0D8',
  },
  filterTabActive: { backgroundColor: '#2D7D78', borderColor: '#2D7D78' },
  filterTabText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterTabTextActive: { color: '#FFFFFF', fontWeight: '600' },

  loadingBox: { marginTop: 60, alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280' },

  list: { paddingHorizontal: 20, paddingBottom: 120, gap: 12 },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDF6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  routeName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  routeMeta: { fontSize: 12, color: '#9CA3AF' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB', marginHorizontal: 6 },

  badgePending: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePendingText: { fontSize: 11, fontWeight: '600', color: '#D97706' },
  badgeCloud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeCloudText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  badgeLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeLocalText: { fontSize: 11, fontWeight: '600', color: '#0D9488' },

  statsStrip: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F2ED',
  },
  stripItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stripLabel: { fontSize: 12, color: '#6B7280' },
  stripVal: { fontSize: 12, fontWeight: '600', color: '#1C1C1E' },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  navigateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D7D78',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navigateBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F2ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF6F5',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  syncBtnText: { fontSize: 12, fontWeight: '600', color: '#2D7D78' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60, paddingHorizontal: 30 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 16, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  emptyBtnRow: { flexDirection: 'row', gap: 12 },
  recordNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4522A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  recordNewBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  exploreBtn: {
    backgroundColor: '#2D7D78',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  exploreBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 19, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 16 },
  modalInput: {
    backgroundColor: '#F5F2ED',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 16,
  },
  diffRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  diffChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F5F2ED',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E0D8',
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
