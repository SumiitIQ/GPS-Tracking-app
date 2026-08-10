import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Share } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileTab() {
  const { user, signOut } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
        <Text style={styles.title}>My Profile</Text>
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
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
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
                  <Text style={styles.btnText}>Share GPX</Text>
                </TouchableOpacity>
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
  emptyText: { color: '#9ca3af', textAlign: 'center', lineHeight: 22 }
});
