import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, TouchableOpacity, TextInput, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Theme } from '../../theme/Theme';
import { Typography } from '../../components/ui/Typography';
import { MetricTile } from '../../components/ui/MetricTile';

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounce = setTimeout(() => {
        searchTreks();
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchTreks = async () => {
    setIsSearching(true);
    const { data, error } = await supabase
      .from('treks')
      .select('id, name, region')
      .ilike('name', `%${searchQuery}%`)
      .limit(5);
    
    if (data && !error) {
      setSearchResults(data);
    }
    setIsSearching(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View>
            <Typography variant="headlineLgMobile" color={Theme.colors.primary}>Good morning</Typography>
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={Theme.colors.onSurfaceVariant} />
              <Typography variant="bodyMd" color={Theme.colors.onSurfaceVariant}>Ready to explore?</Typography>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <MaterialIcons name="notifications" size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Theme.colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for treks..."
            placeholderTextColor={Theme.colors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginRight: 10 }} />}
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.searchResultsContainer}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  router.push(`/trek/${item.id}`);
                }}
              >
                <MaterialIcons name="terrain" size={20} color={Theme.colors.primary} />
                <View style={{ marginLeft: 12 }}>
                  <Typography variant="bodyMd" color={Theme.colors.primary}>{item.name}</Typography>
                  {item.region && <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>{item.region}</Typography>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Hero: Recommended Route */}
        <View style={styles.section}>
          <Typography variant="labelCaps" color={Theme.colors.outline} style={styles.sectionHeader}>Recommended for you</Typography>
          <TouchableOpacity activeOpacity={0.9} style={styles.heroCard} onPress={() => router.push('/trek/pandavleni')}>
            <ImageBackground 
              source={{ uri: 'https://s7ap1.scene7.com/is/image/incredibleindia/2-pandavleni-caves-nashik-maharashtra-attr-hero?qlt=82' }} 
              style={styles.heroImage}
            >
              {/* Gradient Overlay */}
              <View style={styles.gradientOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.heroHeaderRow}>
                  <View>
                    <Typography variant="headlineMd" color={Theme.colors.onPrimary} style={{ marginBottom: 4 }}>Pandavleni Caves</Typography>
                    <View style={styles.difficultyBadge}>
                      <Typography variant="labelCaps" color={Theme.colors.secondaryContainer}>Difficulty: Easy</Typography>
                    </View>
                  </View>
                  <View style={styles.startBtn}>
                    <Typography variant="labelCaps" color={Theme.colors.onSecondary}>VIEW ROUTE</Typography>
                  </View>
                </View>
                {/* Metric Tiles for Route */}
                <View style={styles.heroMetrics}>
                  <View style={styles.heroMetricItem}>
                    <Typography variant="labelCaps" color={Theme.colors.outlineVariant}>DISTANCE</Typography>
                    <Typography variant="metricSm" color={Theme.colors.onPrimary}>2.5 km</Typography>
                  </View>
                  <View style={styles.heroMetricItem}>
                    <Typography variant="labelCaps" color={Theme.colors.outlineVariant}>ELEVATION</Typography>
                    <Typography variant="metricSm" color={Theme.colors.onPrimary}>150 m</Typography>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Your Progress */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Typography variant="labelCaps" color={Theme.colors.outline}>YOUR PROGRESS</Typography>
            <MaterialIcons name="arrow-forward" size={16} color={Theme.colors.primary} />
          </View>
          <View style={styles.progressGrid}>
            <MetricTile label="TOTAL DIST" value="120" unit="km" style={styles.flexHalf} />
            <MetricTile label="ELEVATION GAIN" value="4,500" unit="m" style={styles.flexHalf} />
          </View>
        </View>

        {/* Nearby Treks */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Typography variant="labelCaps" color={Theme.colors.outline}>MAHARASHTRA TREKS</Typography>
            <MaterialIcons name="more-horiz" size={16} color={Theme.colors.primary} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            <TouchableOpacity activeOpacity={0.9} style={styles.trekCard} onPress={() => router.push('/trek/kalsubai')}>
              <ImageBackground source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Kalasubai_from_base.jpg/800px-Kalasubai_from_base.jpg' }} style={styles.trekImg} />
              <View style={styles.trekCardContent}>
                <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Kalsubai Peak</Typography>
                <View style={styles.trekCardRow}>
                  <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>6.6 km</Typography>
                  <View style={styles.trekBadge}><Typography variant="labelCaps" color={Theme.colors.onSurface}>HARD</Typography></View>
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} style={styles.trekCard} onPress={() => router.push('/trek/rajmachi')}>
              <ImageBackground source={{ uri: 'https://vl-prod-static.b-cdn.net/system/images/000/763/347/088b1b3c346e32db0f2ed781af304e2e/original/Rajmachi-Trek-22.jpeg' }} style={styles.trekImg} />
              <View style={styles.trekCardContent}>
                <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Rajmachi Fort</Typography>
                <View style={styles.trekCardRow}>
                  <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>16 km</Typography>
                  <View style={styles.trekBadge}><Typography variant="labelCaps" color={Theme.colors.onSurface}>MEDIUM</Typography></View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Typography variant="labelCaps" color={Theme.colors.outline} style={styles.sectionHeader}>RECENT ACTIVITY</Typography>
          <View style={styles.activityItem}>
            <View style={styles.activityMap}>
               <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGg4SNPzkgRkOQS_-js5LqSLlMwGO8HC22_GZ0rk-JMEhWCsPqoYN-mjnvhCmsOgBtfTZEfJMtg91hydA7xJDWeXNRnEarp5fBRYx-4EPqPCqnRxL6XR10vONVsANV9WU_AsjxA_IBkGqjRvmAh3JViaosXz2Qjs93RTfCXkLMwkXRBmVN0KHs8mGPEchjXbt7mKTEqUnqBa9paw722rcaYrdIJ0491ZYOtaQeBsJy6R-XtIGpJYGQ3Q' }} style={{ flex: 1, opacity: 0.6 }} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>Morning Hike - Neer Garh</Typography>
              <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>12.4 km • 3h 15m</Typography>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityMap}>
               <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBxU7jqUOmqgyJlb4cLjlvzaoaEZsM6UuodQqSK1Nli7ZWT5F1VuNPDmxBS6BlwMWVlab1Vg5JleRIVZn5htH6P33t8k7tDjjIkUK4qv9QeGrdF6vTm4o1MQSS32iJHUHByHAyccCPONaP5PDYZbOnu0QEbsoKKB0bTKI7OAL9zRTNf6tQre3TdrEcJBKfvsSOM_zsgl7co1zpiwV7DpANX550HNArOiDLo1JoMNRfvn_kWJNa5OkUs7g' }} style={{ flex: 1, opacity: 0.6 }} />
            </View>
            <View style={styles.activityContent}>
              <Typography variant="bodyMd" style={{ fontWeight: 'bold' }}>George Everest Peak</Typography>
              <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant}>5.2 km • 1.5h</Typography>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.outline} />
          </View>
        </View>

        <View style={{ height: 100 }} /> {/* Bottom Tab spacing */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: Theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Theme.spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.base,
    marginTop: Theme.spacing.base,
  },
  notificationBtn: {
    padding: Theme.spacing.base,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    height: 48,
  },
  searchIcon: {
    marginRight: Theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Theme.colors.primary,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  searchResultsContainer: {
    marginTop: Theme.spacing.xs,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 198, 202, 0.1)',
  },
  section: {
    marginTop: Theme.spacing.lg,
  },
  sectionHeader: {
    marginBottom: Theme.spacing.xs,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  heroCard: {
    width: '100%',
    height: 320,
    borderRadius: Theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    backgroundColor: Theme.colors.surfaceContainerLow,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  heroContent: {
    padding: Theme.spacing.sm,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    backgroundColor: 'rgba(205, 72, 0, 0.2)', // secondaryContainer with opacity
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.base,
    borderRadius: Theme.radius.full,
    borderWidth: 1,
    borderColor: 'rgba(163, 56, 0, 0.3)', // secondary with opacity
    alignSelf: 'flex-start',
  },
  startBtn: {
    backgroundColor: Theme.colors.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.DEFAULT,
  },
  heroMetrics: {
    flexDirection: 'row',
    marginTop: Theme.spacing.sm,
    backgroundColor: 'rgba(0, 1, 1, 0.4)', // primary/40
    borderColor: 'rgba(197, 198, 202, 0.2)',
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.xs,
    gap: Theme.spacing.xs,
  },
  heroMetricItem: {
    flex: 1,
  },
  progressGrid: {
    flexDirection: 'row',
    gap: Theme.spacing.xs,
  },
  flexHalf: {
    flex: 1,
  },
  hScroll: {
    gap: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xs,
  },
  trekCard: {
    width: 240,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    borderRadius: Theme.radius.lg,
    overflow: 'hidden',
  },
  trekImg: {
    height: 96,
  },
  trekCardContent: {
    padding: Theme.spacing.xs,
    gap: Theme.spacing.base,
  },
  trekCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trekBadge: {
    backgroundColor: Theme.colors.surfaceVariant,
    paddingHorizontal: Theme.spacing.base,
    borderRadius: Theme.radius.DEFAULT,
  },
  activityItem: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    padding: Theme.spacing.xs,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: 'rgba(197, 198, 202, 0.3)',
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  activityMap: {
    width: 64,
    height: 64,
    borderRadius: Theme.radius.DEFAULT,
    backgroundColor: Theme.colors.surfaceVariant,
    overflow: 'hidden',
  },
  activityContent: {
    flex: 1,
  },
});
