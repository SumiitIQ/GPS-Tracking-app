import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Alert, Share } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

export default function TrekDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [trek, setTrek] = useState<any>(null);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrekAndRoutes();
  }, [id]);

  const fetchTrekAndRoutes = async () => {
    setLoading(true);
    try {
      const [trekRes, routesRes] = await Promise.all([
        supabase.from('treks').select('*').eq('id', id).single(),
        supabase.from('routes').select(`*, profiles(display_name, experience_level)`).eq('trek_id', id).order('distance', { ascending: true })
      ]);
      
      if (trekRes.data) setTrek(trekRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDist = (m: number) => m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${Math.round(m)} m`;

  const handleShareGPX = async (gpx_url: string, title: string) => {
    try {
      await Share.share({
        message: `Check out this trek: ${title}!\n\nDownload the GPX Route here:\n${gpx_url}`,
        url: gpx_url,
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#ef4444" size="large" />
      </View>
    );
  }

  if (!trek) {
    return (
      <View style={styles.center}>
        <Text style={{color: 'white'}}>Trek not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{trek.name}</Text>
        <Text style={styles.region}>{trek.region || 'Unknown Region'}</Text>
      </View>

      <Text style={styles.desc}>{trek.description || 'No description available for this trek.'}</Text>
      
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Community Routes</Text>
        <Text style={styles.routeCount}>{routes.length} Available</Text>
      </View>

      <FlatList
        data={routes}
        keyExtractor={r => r.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeTitle}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: item.difficulty_self_rating === 'Hard' ? '#ef4444' : item.difficulty_self_rating === 'Medium' ? '#f59e0b' : '#10b981' }]}>
                <Text style={styles.badgeText}>{item.difficulty_self_rating || 'Unrated'}</Text>
              </View>
            </View>
            
            <View style={styles.statsRow}>
              <View>
                <Text style={styles.statLabel}>DISTANCE</Text>
                <Text style={styles.statValue}>{formatDist(item.distance)}</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>ELEVATION</Text>
                <Text style={styles.statValue}>{Math.round(item.elevation_gain)}m</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>SUBMITTED BY</Text>
                <Text style={styles.statValue}>{item.profiles?.display_name || 'Anonymous'}</Text>
              </View>
            </View>
            
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.navigateBtn, { flex: 1, marginRight: 10 }]}
                onPress={() => {
                  router.push({ pathname: '/(tabs)/navigate', params: { routeUrl: item.gpx_url, title: item.title } });
                }}
              >
                <Text style={styles.navigateBtnText}>Navigate →</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareBtn}
                onPress={() => handleShareGPX(item.gpx_url, item.title)}
              >
                <Text style={styles.shareBtnText}>Share GPX</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No routes recorded yet. Be the first to track this mountain!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/record')}>
              <Text style={styles.emptyBtnText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#060912' },
  center: { flex: 1, backgroundColor: '#060912', justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 70,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#0a1020',
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  backBtnText: { color: '#fff', fontSize: 20 },
  title: { color: '#fff', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  region: { color: '#9ca3af', fontSize: 14, marginTop: 4, fontWeight: '500' },
  desc: { color: '#d1d5db', fontSize: 15, lineHeight: 22, padding: 20, paddingBottom: 10 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, marginTop: 10, marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  routeCount: { color: '#60a5fa', fontSize: 13, fontWeight: '700' },
  
  routeCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  routeTitle: { color: '#fff', fontSize: 18, fontWeight: '700', flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statLabel: { color: '#6b7280', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  statValue: { color: '#f3f4f6', fontSize: 14, fontWeight: '600', marginTop: 4 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  navigateBtn: { backgroundColor: '#2563eb', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  navigateBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  shareBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  
  emptyState: { padding: 30, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, marginTop: 20 },
  emptyText: { color: '#9ca3af', textAlign: 'center', lineHeight: 22, marginBottom: 16 },
  emptyBtn: { backgroundColor: '#ef4444', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { color: '#fff', fontWeight: '800' }
});
