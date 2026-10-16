import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoundTrekItem {
  id: string;
  name: string;
  location: string;
  loopDistance: string;
  estimatedTime: string;
  elevationGain: string;
  difficulty: 'Easy' | 'Moderate' | 'Difficult';
  description: string;
  startPoint: string;
  coords: number[][];
}

const ROUND_TREKS: RoundTrekItem[] = [
  {
    id: 'pandavleni-circuit',
    name: 'Pandavleni Caves Full Circuit Loop',
    location: 'Nashik, Maharashtra',
    loopDistance: '2.4 km Loop',
    estimatedTime: '1 hr 45 min',
    elevationGain: '140 m',
    difficulty: 'Easy',
    startPoint: 'Dadasaheb Phalke Smarak Gate (Returns to same spot)',
    description: 'A circular loop trail ascending via stone staircase to Cave #1 through #24, circling the scenic tableland summit plateau, and descending along the peaceful southern woodland path back to the entrance parking lot.',
    coords: [
      [73.7482, 19.9634],
      [73.7495, 19.9644],
      [73.7514, 19.9661],
      [73.7535, 19.9675],
      [73.7540, 19.9655],
      [73.7515, 19.9638],
      [73.7482, 19.9634] // Closed loop back to start
    ]
  },
  {
    id: 'anjaneri-fort-loop',
    name: 'Anjaneri Hilltop Plateau Ring Trail',
    location: 'Trimbakeshwar, Nashik',
    loopDistance: '7.8 km Loop',
    estimatedTime: '4 hrs 15 min',
    elevationGain: '420 m',
    difficulty: 'Moderate',
    startPoint: 'Anjaneri Base Parking (Returns to same spot)',
    description: 'Birthplace of Lord Hanuman. The route goes up through the ancient stone gorge, makes a complete 360-degree perimeter ring around the massive high-altitude plateau lake, and returns along the scenic western ridge.',
    coords: [
      [73.5780, 19.9210],
      [73.5820, 19.9245],
      [73.5875, 19.9280],
      [73.5930, 19.9265],
      [73.5890, 19.9220],
      [73.5830, 19.9195],
      [73.5780, 19.9210] // Closed loop
    ]
  },
  {
    id: 'harihar-circuit',
    name: 'Harihar Rock-Cut Steps Round Circuit',
    location: 'Igatpuri / Trimbak',
    loopDistance: '5.2 km Loop',
    estimatedTime: '3 hrs 30 min',
    elevationGain: '380 m',
    difficulty: 'Difficult',
    startPoint: 'Harshewadi Village Temple (Returns to same spot)',
    description: 'Famous 80-degree near-vertical rock cut steps ascent leading to the pinnacle, with a thrilling loop circuit around the Scottish ridge and gentle plateau descent back to the village square.',
    coords: [
      [73.5010, 19.9020],
      [73.5045, 19.9065],
      [73.5080, 19.9100],
      [73.5095, 19.9075],
      [73.5060, 19.9035],
      [73.5010, 19.9020] // Closed loop
    ]
  }
];

const DIFFICULTY_COLORS = {
  Easy: '#22C55E',
  Moderate: '#F59E0B',
  Difficult: '#EF4444'
};

export default function RoundTrekScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredTreks = selectedDifficulty === 'All'
    ? ROUND_TREKS
    : ROUND_TREKS.filter(t => t.difficulty === selectedDifficulty);

  const handleStartLoopRoute = (trek: RoundTrekItem) => {
    // Generate a temporary GPX in cache or direct navigate
    Alert.alert(
      'Start Round Trek',
      `Launch 3D Navigation for "${trek.name}"?\nThis is a complete loop trail that returns to your starting point.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Loop Navigation',
          onPress: () => {
            router.push({
              pathname: '/(tabs)/explore',
              params: {
                loopCoordinates: JSON.stringify(trek.coords),
                trekName: trek.name
              }
            });
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
        <Text style={styles.headerTitle}>Round Treks (Loops)</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* EXPLANATION BANNER */}
        <View style={styles.infoBanner}>
          <View style={styles.infoIconBox}>
            <MaterialCommunityIcons name="sync" size={24} color="#2D7D78" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>What is a Round Trek?</Text>
            <Text style={styles.infoText}>
              A Round Trek (Loop Trail) is a route that starts and finishes at the exact same location without having to retrace your steps. You park your vehicle once, hike a complete scenic circuit, and arrive back right where you started!
            </Text>
          </View>
        </View>

        {/* DIFFICULTY FILTER TABS */}
        <View style={styles.filterRow}>
          {['All', 'Easy', 'Moderate', 'Difficult'].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.filterChip, selectedDifficulty === d && styles.filterChipActive]}
              onPress={() => setSelectedDifficulty(d)}
            >
              <Text style={[styles.filterChipText, selectedDifficulty === d && styles.filterChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TREK LIST */}
        <View style={styles.trekList}>
          {filteredTreks.map(trek => {
            const diffColor = DIFFICULTY_COLORS[trek.difficulty];

            return (
              <View key={trek.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{trek.name}</Text>
                    <View style={styles.locRow}>
                      <Ionicons name="location-outline" size={13} color="#6B7280" />
                      <Text style={styles.cardLoc}>{trek.location}</Text>
                    </View>
                  </View>
                  <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
                    <Text style={[styles.diffBadgeText, { color: diffColor }]}>{trek.difficulty}</Text>
                  </View>
                </View>

                {/* STATS STRIP */}
                <View style={styles.statsStrip}>
                  <View style={styles.statBox}>
                    <Ionicons name="repeat" size={16} color="#2D7D78" />
                    <Text style={styles.statVal}>{trek.loopDistance}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <Ionicons name="time-outline" size={16} color="#2D7D78" />
                    <Text style={styles.statVal}>{trek.estimatedTime}</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statBox}>
                    <MaterialCommunityIcons name="elevation-rise" size={16} color="#2D7D78" />
                    <Text style={styles.statVal}>{trek.elevationGain}</Text>
                  </View>
                </View>

                {/* START POINT INFO */}
                <View style={styles.startPointRow}>
                  <Ionicons name="radio-button-on" size={14} color="#22C55E" />
                  <Text style={styles.startPointText}>
                    <Text style={{ fontWeight: '700' }}>Start & End: </Text>
                    {trek.startPoint}
                  </Text>
                </View>

                {/* DESCRIPTION */}
                <Text style={styles.descText}>{trek.description}</Text>

                {/* ACTION BUTTON */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleStartLoopRoute(trek)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="map-marker-path" size={18} color="#fff" />
                  <Text style={styles.actionBtnText}>Explore Round Circuit</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>
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
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  scroll: { padding: 20, paddingBottom: 60 },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#EDF6F5',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#D4E8E6',
    marginBottom: 20,
  },
  infoIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#2D7D78', marginBottom: 4 },
  infoText: { fontSize: 13, color: '#4B5563', lineHeight: 19 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#E5E0D8',
  },
  filterChipActive: { backgroundColor: '#2D7D78', borderColor: '#2D7D78' },
  filterChipText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterChipTextActive: { color: '#FFFFFF' },
  trekList: { gap: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 3 },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardLoc: { fontSize: 12, color: '#6B7280' },
  diffBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  diffBadgeText: { fontSize: 11, fontWeight: '700' },
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F5F2ED',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  statVal: { fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  statDivider: { width: 1, height: 18, backgroundColor: '#E5E0D8' },
  startPointRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F0FDF4', padding: 8, borderRadius: 8, marginBottom: 10,
  },
  startPointText: { fontSize: 12, color: '#166534', flex: 1 },
  descText: { fontSize: 13, color: '#6B7280', lineHeight: 19, marginBottom: 16 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#2D7D78', borderRadius: 12, paddingVertical: 12, gap: 8,
  },
  actionBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
