import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, StatusBar, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

const POPULAR_TREKS = [
  {
    id: 'pandavleni',
    name: 'Pandavleni Caves',
    location: 'Nashik, Maharashtra',
    difficulty: 'Easy',
    days: 1,
    km: '0.6 km',
    image: require('../../../assets/images/home_assets/card_pandavleni.jpg'),
  },
  {
    id: 'rajmachi',
    name: 'Anjaneri Fort',
    location: 'Nashik, Maharashtra',
    difficulty: 'Moderate',
    days: 1,
    km: '3.2 km',
    image: require('../../../assets/images/home_assets/card_anjaneri.jpg'),
  },
  {
    id: 'kalsubai',
    name: 'Dugarwadi Waterfall',
    location: 'Nashik, Maharashtra',
    difficulty: 'Easy',
    days: 1,
    km: '2.8 km',
    image: require('../../../assets/images/home_assets/card_dugarwadi.jpg'),
  },
];

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22C55E',
  Moderate: '#F59E0B',
  Difficult: '#EF4444',
};

export default function HomeTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handlePickAndNavigate = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        router.push({ pathname: '/(tabs)/explore', params: { importGpxUri: result.assets[0].uri } });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const quickActions = [
    { icon: 'map-outline', label: 'Round Trek', onPress: () => router.push('/round-trek') },
    { icon: 'cloud-upload-outline', label: 'Import GPX', onPress: handlePickAndNavigate },
    { icon: 'cloud-download-outline', label: 'Offline Maps', onPress: () => router.push('/offline-maps') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good evening, Nikhil 👋</Text>
            <Text style={styles.headline}>Plan your{`\n`}next trek</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.avatarText}>N</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search treks, routes or places..."
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* POPULAR TREKS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Explore Popular Treks</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trekScroll}>
          {POPULAR_TREKS.map(trek => (
            <TouchableOpacity
              key={trek.id}
              style={styles.trekCard}
              activeOpacity={0.8}
              onPress={() => router.push(`/trek/${trek.id}`)}
            >
              <Image source={trek.image} style={styles.trekCardImage} />
              <View style={styles.trekCardBody}>
                <View style={styles.trekDiffRow}>
                  <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[trek.difficulty] + '20' }]}>
                    <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[trek.difficulty] }]}>{trek.difficulty}</Text>
                  </View>
                </View>
                <Text style={styles.trekName} numberOfLines={2}>{trek.name}</Text>
                <View style={styles.trekMeta}>
                  <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                  <Text style={styles.trekLocation} numberOfLines={1}>{trek.location}</Text>
                </View>
                <View style={styles.trekStats}>
                  <Text style={styles.trekStat}>{trek.km}</Text>
                  <View style={styles.dot} />
                  <Text style={styles.trekStat}>{trek.days} day</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* QUICK ACTIONS */}
        <Text style={[styles.sectionTitle, { paddingHorizontal: 20, marginTop: 28, marginBottom: 14 }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <TouchableOpacity key={i} style={styles.actionCard} onPress={action.onPress} activeOpacity={0.8}>
              <View style={styles.actionIconBox}>
                <Ionicons name={action.icon as any} size={24} color="#2D7D78" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* RECENT ACTIVITY PLACEHOLDER */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        <View style={styles.emptyCard}>
          <MaterialCommunityIcons name="map-marker-path" size={36} color="#D1C9BD" />
          <Text style={styles.emptyText}>No saved routes yet</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.push('/(tabs)/explore')}>
            <Text style={styles.emptyBtnText}>Explore Treks</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  scroll: { paddingBottom: 120 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  greeting: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  headline: { fontSize: 28, fontWeight: '700', color: '#1C1C1E', lineHeight: 34 },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#2D7D78',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1C1C1E' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  seeAll: { fontSize: 13, color: '#2D7D78', fontWeight: '500' },

  trekScroll: { paddingHorizontal: 20, gap: 14, paddingRight: 32 },
  trekCard: {
    width: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  trekCardImage: { width: '100%', height: 110 },
  trekCardBody: { padding: 12 },
  trekDiffRow: { marginBottom: 6 },
  diffBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  diffText: { fontSize: 11, fontWeight: '600' },
  trekName: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', marginBottom: 4, lineHeight: 20 },
  trekMeta: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  trekLocation: { fontSize: 12, color: '#9CA3AF', flex: 1 },
  trekStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trekStat: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB' },

  actionsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 8,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconBox: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EDF6F5',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },

  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 8,
  },
  emptyText: { fontSize: 14, color: '#9CA3AF', marginTop: 10, marginBottom: 16 },
  emptyBtn: { backgroundColor: '#2D7D78', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 20 },
  emptyBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
