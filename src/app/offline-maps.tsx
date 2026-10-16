import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Alert, Modal
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getDownloadedMaps,
  removeDownloadedMap,
  downloadTrekForOffline,
  PRESET_OFFLINE_TREKS,
  OfflineMapItem
} from '../lib/offlineMaps';

export default function OfflineManagerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [downloaded, setDownloaded] = useState<OfflineMapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadMaps = async () => {
    setLoading(true);
    const maps = await getDownloadedMaps();
    setDownloaded(maps);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadMaps();
    }, [])
  );

  const handleStartOfflineNavigation = (item: OfflineMapItem) => {
    // Navigate using the downloaded offline map & route
    router.push({
      pathname: '/(tabs)/navigate',
      params: {
        routeUrl: item.gpxLocalUri,
        title: `${item.name} (Offline)`
      }
    });
  };

  const handleDownloadPreset = async (preset: typeof PRESET_OFFLINE_TREKS[0]) => {
    setDownloadingId(preset.id);
    try {
      await downloadTrekForOffline(
        { id: preset.id, name: preset.name, region: preset.region },
        { title: preset.routeTitle, distance: parseFloat(preset.distanceText) * 1000, elevation_gain: preset.elevationGain, gpx_url: preset.gpxUrl }
      );
      await loadMaps();
      Alert.alert('Downloaded! 🗺️', `${preset.name} is now available offline.`);
    } catch (e) {
      Alert.alert('Error', 'Failed to download offline map.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = (item: OfflineMapItem) => {
    Alert.alert(
      'Remove Offline Map',
      `Delete ${item.name} from offline storage?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removeDownloadedMap(item.id);
            await loadMaps();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offline Manager</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Downloaded Maps & Routes</Text>
        <Text style={styles.subDesc}>
          Access high-precision terrain routes even without cellular connectivity or internet.
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2D7D78" size="large" />
        </View>
      ) : downloaded.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="map-marker-off-outline" size={54} color="#D1C9BD" />
          <Text style={styles.emptyTitle}>No offline maps saved</Text>
          <Text style={styles.emptySub}>
            Download popular treks to navigate in remote wilderness areas without signal.
          </Text>
          <TouchableOpacity
            style={styles.downloadPrimaryBtn}
            onPress={() => setDownloadModalVisible(true)}
          >
            <Ionicons name="cloud-download-outline" size={18} color="#fff" />
            <Text style={styles.downloadPrimaryBtnText}>Download a Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={downloaded}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.mapCard}>
              <View style={styles.mapCardHeader}>
                <View style={styles.iconBox}>
                  <MaterialCommunityIcons name="map-check" size={24} color="#2D7D78" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.mapName}>{item.name}</Text>
                  <Text style={styles.mapRegion}>{item.region}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#22C55E" />
                      <Text style={styles.statusText}>{item.sizeText}</Text>
                    </View>
                    <Text style={styles.distanceText}>• {item.distanceText}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.openMapBtn}
                  onPress={() => handleStartOfflineNavigation(item)}
                >
                  <Ionicons name="navigate" size={16} color="#fff" />
                  <Text style={styles.openMapBtnText}>Start Offline Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FOOTER BUTTON */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.downloadMoreBtn}
          onPress={() => setDownloadModalVisible(true)}
        >
          <Ionicons name="add" size={20} color="#2D7D78" />
          <Text style={styles.downloadMoreBtnText}>Download More Maps</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL TO CHOOSE MAPS TO DOWNLOAD */}
      <Modal
        visible={downloadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDownloadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Offline Treks</Text>
              <TouchableOpacity onPress={() => setDownloadModalVisible(false)}>
                <Ionicons name="close" size={22} color="#1C1C1E" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>
              Select a trek to download elevation profile & offline GPS trail.
            </Text>

            {PRESET_OFFLINE_TREKS.map((preset: typeof PRESET_OFFLINE_TREKS[number]) => {
              const isAlready = downloaded.some(d => d.id === preset.id);
              const isDownloading = downloadingId === preset.id;

              return (
                <View key={preset.id} style={styles.presetItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.presetName}>{preset.name}</Text>
                    <Text style={styles.presetRegion}>{preset.region} • {preset.distanceText}</Text>
                  </View>
                  {isAlready ? (
                    <View style={styles.alreadyDownloaded}>
                      <Ionicons name="checkmark-done" size={16} color="#22C55E" />
                      <Text style={styles.alreadyDownloadedText}>Ready</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.downloadItemBtn}
                      disabled={isDownloading}
                      onPress={() => handleDownloadPreset(preset)}
                    >
                      {isDownloading ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <>
                          <Ionicons name="cloud-download-outline" size={15} color="#fff" />
                          <Text style={styles.downloadItemBtnText}>Download</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  subHeader: { paddingHorizontal: 20, marginBottom: 16, marginTop: 4 },
  subTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  subDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 16, marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  downloadPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D7D78',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  downloadPrimaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100, gap: 12 },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EDF6F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  mapRegion: { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },
  distanceText: { fontSize: 11, color: '#9CA3AF' },
  trashBtn: { padding: 8 },
  cardActions: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F2ED' },
  openMapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D7D78',
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
  },
  openMapBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: '#F5F2ED',
  },
  downloadMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2D7D78',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  downloadMoreBtnText: { color: '#2D7D78', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  modalSub: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2ED',
  },
  presetName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  presetRegion: { fontSize: 12, color: '#9CA3AF' },
  downloadItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2D7D78',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  downloadItemBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  alreadyDownloaded: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  alreadyDownloadedText: { color: '#16A34A', fontSize: 13, fontWeight: '600' },
});
