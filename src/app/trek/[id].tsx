import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Alert, Share, ImageBackground } from 'react-native';
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
    
    if (id === 'pandavleni') {
      setTrek({
        id: 'pandavleni', name: 'Pandavleni Caves Mountain', region: 'Nashik, Maharashtra',
        description: 'Pandavleni Caves are a group of 24 caves carved between the 1st century BCE and the 3rd century CE, located on the Trivashmi Hills in Nashik, Maharashtra. It is a short, steep hike with stone steps leading to ancient Buddhist caves and a beautiful view of the city.',
        image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Pandavleni_Caves%2C_Nashik.jpg/1200px-Pandavleni_Caves%2C_Nashik.jpg'
      });
      setRoutes([{ id: 'route-pandavleni-1', title: 'Pandavleni Ascent Route', description: 'Main route up the steps to the caves and top of the mountain.', distance: 2500, elevation_gain: 150, gpx_url: 'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx', difficulty_self_rating: 'Easy' }]);
      setLoading(false); return;
    }
    
    if (id === 'kalsubai') {
      setTrek({
        id: 'kalsubai', name: 'Kalsubai Peak', region: 'Igatpuri, Maharashtra',
        description: 'Kalsubai is the highest peak in Maharashtra at 1,646 meters. The trek offers a mix of easy hiking and thrilling iron ladder climbs, culminating in breathtaking panoramic views of the Sahyadri mountain ranges.',
        image_url: 'https://images.unsplash.com/photo-1622308644420-b20141f17cb6?auto=format&fit=crop&w=800'
      });
      setRoutes([{ id: 'route-kalsubai-1', title: 'Bari Village Route', description: 'The most popular route to the highest peak in Maharashtra.', distance: 6600, elevation_gain: 800, gpx_url: 'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx', difficulty_self_rating: 'Hard' }]); // using same dummy gpx for now
      setLoading(false); return;
    }

    if (id === 'rajmachi') {
      setTrek({
        id: 'rajmachi', name: 'Rajmachi Fort', region: 'Lonavala, Maharashtra',
        description: 'Rajmachi is a historic fort consisting of two twin fortresses: Shrivardhan and Manaranjan. It offers a scenic trail through dense forests, making it one of the most popular trekking destinations during the monsoon.',
        image_url: 'https://images.unsplash.com/photo-1605389658252-0947702f254e?auto=format&fit=crop&w=800'
      });
      setRoutes([{ id: 'route-rajmachi-1', title: 'Lonavala Route', description: 'Long scenic walk to the base village of Udhewadi.', distance: 16000, elevation_gain: 450, gpx_url: 'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx', difficulty_self_rating: 'Medium' }]); // using same dummy gpx
      setLoading(false); return;
    }

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
      
      {trek.image_url ? (
        <ImageBackground source={{ uri: trek.image_url }} style={styles.heroImage}>
          <View style={styles.heroOverlay}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
        <Text style={styles.title}>{trek.name}</Text>
        <Text style={styles.region}>{trek.region || 'Unknown Region'}</Text>
        <Text style={styles.desc}>{trek.description || 'No description available for this trek.'}</Text>
      </View>
      
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#0a0d14',
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
    paddingHorizontal: 20,
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
