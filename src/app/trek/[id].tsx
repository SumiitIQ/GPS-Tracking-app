import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, Platform, Share, ImageBackground, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { downloadTrekForOffline, isMapDownloaded } from '../../lib/offlineMaps';
import { getTrekById } from '../../constants/maharashtraTreks';

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22C55E', Medium: '#F59E0B', Hard: '#EF4444',
  Moderate: '#F59E0B', Difficult: '#EF4444', Unrated: '#9CA3AF',
};

export default function TrekDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [trek, setTrek] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'directions' | 'photos'>('overview');
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchTrekAndRoutes();
    if (typeof id === 'string') {
      isMapDownloaded(id).then(setIsDownloaded);
    }
  }, [id]);

  const handleDownloadOffline = async () => {
    if (!trek) return;
    setDownloading(true);
    try {
      await downloadTrekForOffline(
        { id: trek.id || (id as string), name: trek.name, region: trek.region },
        routes[0]
      );
      setIsDownloaded(true);
      Alert.alert(
        'Downloaded for Offline! 🗺️',
        `${trek.name} route and terrain data are now saved locally. You can use it anywhere without network!`,
        [
          { text: 'View Offline Maps', onPress: () => router.push('/offline-maps') },
          { text: 'OK' }
        ]
      );
    } catch (e) {
      Alert.alert('Download Error', 'Could not save map for offline use.');
    } finally {
      setDownloading(false);
    }
  };

  const fetchTrekAndRoutes = async () => {
    setLoading(true);

    // 1. Check verified authentic Maharashtra trek database
    if (typeof id === 'string') {
      const realTrek = getTrekById(id);
      if (realTrek) {
        setTrek({
          id: realTrek.id,
          name: realTrek.name,
          region: `${realTrek.region} (${realTrek.district})`,
          description: `${realTrek.description}\n\nHistorical Note: ${realTrek.historicalSignificance}\nBase Village: ${realTrek.baseVillage}`,
          image_url: realTrek.imageUrl,
          days: '1',
          km: realTrek.distance,
          elevation: realTrek.elevation,
          difficulty: realTrek.difficulty,
        });

        setRoutes([{
          id: `route-${realTrek.id}`,
          title: realTrek.routeTitle,
          description: `Official authentic GPS trail to summit starting from ${realTrek.baseVillage}. Elevation Gain: ${realTrek.elevation}.`,
          distance: realTrek.distanceMeters,
          elevation_gain: realTrek.elevationMeters,
          gpx_url: realTrek.gpxUrl,
          difficulty_self_rating: realTrek.difficulty,
          profiles: { display_name: 'Verified Maharashtra Forest Trail' },
        }]);

        setLoading(false);
        return;
      }
    }




    try {
      const [trekRes, routesRes] = await Promise.all([
        supabase.from('treks').select('*').eq('id', id).single(),
        supabase.from('routes').select('*, profiles(display_name, experience_level)').eq('trek_id', id).order('distance', { ascending: true }),
      ]);
      if (trekRes.data) setTrek(trekRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDist = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;

  const handleShareGPX = async (gpx_url: string, title: string) => {
    try {
      await Share.share({ message: `Check out this trek: ${title}!\n\nDownload GPX: ${gpx_url}`, url: gpx_url });
    } catch (e) { console.error(e); }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#2D7D78" size="large" />
      </View>
    );
  }

  if (!trek) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#D1C9BD" />
        <Text style={styles.notFoundText}>Trek not found</Text>
        <TouchableOpacity style={styles.backBtnAlt} onPress={() => router.back()}>
          <Text style={styles.backBtnAltText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const diffColor = DIFFICULTY_COLORS[trek.difficulty] || '#9CA3AF';

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* HERO IMAGE */}
      <View style={styles.heroWrapper}>
        <ImageBackground
          source={trek.image ? trek.image : { uri: trek.image_url }}
          style={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
                <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn}>
                <Ionicons name="bookmark-outline" size={20} color="#1C1C1E" />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* TITLE ROW */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.trekName}>{trek.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.location}>{trek.region || 'India'}</Text>
            </View>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
            <Text style={[styles.diffBadgeText, { color: diffColor }]}>{trek.difficulty || 'Easy'}</Text>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="calendar-outline" size={20} color="#2D7D78" />
            <Text style={styles.statValue}>{trek.days || '1'}</Text>
            <Text style={styles.statLabel}>days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={20} color="#2D7D78" />
            <Text style={styles.statValue}>{trek.km || formatDist(routes[0]?.distance || 0)}</Text>
            <Text style={styles.statLabel}>distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="elevation-rise" size={20} color="#2D7D78" />
            <Text style={styles.statValue}>{trek.elevation || `${routes[0]?.elevation_gain || 0} m`}</Text>
            <Text style={styles.statLabel}>elevation</Text>
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabRow}>
          {(['overview', 'map', 'directions', 'photos'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.tabBtnTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* OVERVIEW CONTENT */}
        {activeTab === 'overview' && (
          <View style={styles.overviewContent}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{trek.description || 'No description available for this trek.'}</Text>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Community Routes</Text>
            <Text style={styles.routeCount}>{routes.length} route{routes.length !== 1 ? 's' : ''} available</Text>

            {routes.map(route => (
              <View key={route.id} style={styles.routeCard}>
                <View style={styles.routeCardHeader}>
                  <Text style={styles.routeCardTitle}>{route.title}</Text>
                  <View style={[styles.routeBadge, { backgroundColor: (DIFFICULTY_COLORS[route.difficulty_self_rating] || '#9CA3AF') + '20' }]}>
                    <Text style={[styles.routeBadgeText, { color: DIFFICULTY_COLORS[route.difficulty_self_rating] || '#9CA3AF' }]}>
                      {route.difficulty_self_rating || 'Unrated'}
                    </Text>
                  </View>
                </View>

                <View style={styles.routeStats}>
                  <View style={styles.routeStatItem}>
                    <Text style={styles.routeStatLabel}>DISTANCE</Text>
                    <Text style={styles.routeStatValue}>{formatDist(route.distance)}</Text>
                  </View>
                  <View style={styles.routeStatItem}>
                    <Text style={styles.routeStatLabel}>ELEVATION</Text>
                    <Text style={styles.routeStatValue}>{Math.round(route.elevation_gain)}m</Text>
                  </View>
                  {route.profiles?.display_name && (
                    <View style={styles.routeStatItem}>
                      <Text style={styles.routeStatLabel}>SUBMITTED BY</Text>
                      <Text style={styles.routeStatValue}>{route.profiles.display_name}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.routeActions}>
                  <TouchableOpacity
                    style={styles.navigateBtn}
                    onPress={() => router.push({ pathname: '/(tabs)/navigate', params: { routeUrl: route.gpx_url, title: route.title } })}
                  >
                    <Ionicons name="navigate" size={16} color="#fff" />
                    <Text style={styles.navigateBtnText}>Navigate</Text>
                  </TouchableOpacity>
                  {route.gpx_url ? (
                    <TouchableOpacity style={styles.shareBtn} onPress={() => handleShareGPX(route.gpx_url, route.title)}>
                      <Ionicons name="share-outline" size={16} color="#2D7D78" />
                      <Text style={styles.shareBtnText}>Share GPX</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))}

            {routes.length === 0 && (
              <View style={styles.emptyRoutes}>
                <MaterialCommunityIcons name="map-plus" size={36} color="#D1C9BD" />
                <Text style={styles.emptyRoutesText}>No routes recorded yet.</Text>
                <TouchableOpacity style={styles.recordBtn} onPress={() => router.push('/(tabs)/record')}>
                  <Text style={styles.recordBtnText}>Start Tracking</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab !== 'overview' && (
          <View style={styles.comingSoon}>
            <MaterialCommunityIcons name="hammer-wrench" size={36} color="#D1C9BD" />
            <Text style={styles.comingSoonText}>Coming soon</Text>
          </View>
        )}
      </ScrollView>

      {/* BOTTOM CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.downloadBtn, isDownloaded && styles.downloadBtnReady]}
          onPress={handleDownloadOffline}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : isDownloaded ? (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={styles.downloadBtnText}>Downloaded (Ready Offline)</Text>
            </>
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={18} color="#fff" />
              <Text style={styles.downloadBtnText}>Download for Offline</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  loadingContainer: { flex: 1, backgroundColor: '#F5F2ED', justifyContent: 'center', alignItems: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  backBtnAlt: { backgroundColor: '#2D7D78', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginTop: 12 },
  backBtnAltText: { color: '#fff', fontWeight: '600' },

  heroWrapper: { height: 280 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  circleBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { flex: 1 },
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4,
    gap: 12,
  },
  trekName: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { fontSize: 13, color: '#6B7280' },
  diffBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 4 },
  diffBadgeText: { fontSize: 12, fontWeight: '600' },

  statsCard: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    marginHorizontal: 20, marginTop: 16, borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  statLabel: { fontSize: 11, color: '#9CA3AF' },
  statDivider: { width: 1, backgroundColor: '#E5E0D8' },

  tabRow: {
    flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 8,
    marginBottom: 4,
  },
  tabBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E5E0D8',
  },
  tabBtnActive: { backgroundColor: '#2D7D78', borderColor: '#2D7D78' },
  tabBtnText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabBtnTextActive: { color: '#FFFFFF' },

  overviewContent: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  routeCount: { fontSize: 13, color: '#9CA3AF', marginBottom: 14 },

  routeCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  routeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  routeCardTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', flex: 1, marginRight: 8 },
  routeBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  routeBadgeText: { fontSize: 11, fontWeight: '600' },

  routeStats: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  routeStatItem: {},
  routeStatLabel: { fontSize: 10, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
  routeStatValue: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },

  routeActions: { flexDirection: 'row', gap: 10 },
  navigateBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2D7D78', borderRadius: 10, paddingVertical: 12, gap: 6,
  },
  navigateBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#EDF6F5', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, gap: 6,
  },
  shareBtnText: { color: '#2D7D78', fontWeight: '600', fontSize: 14 },

  emptyRoutes: { alignItems: 'center', paddingVertical: 32, gap: 10 },
  emptyRoutesText: { fontSize: 14, color: '#9CA3AF' },
  recordBtn: { backgroundColor: '#2D7D78', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20, marginTop: 4 },
  recordBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  comingSoon: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  comingSoonText: { fontSize: 14, color: '#9CA3AF' },

  bottomCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 20, paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E5E0D8',
  },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2D7D78', borderRadius: 14, paddingVertical: 16, gap: 8,
  },
  downloadBtnReady: {
    backgroundColor: '#15803D',
  },
  downloadBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
