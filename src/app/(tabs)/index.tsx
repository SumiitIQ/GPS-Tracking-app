import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 1, name: 'All', iconFamily: 'MaterialCommunityIcons', iconName: 'image-filter-hdr', active: true },
  { id: 2, name: 'Trekking', iconFamily: 'FontAwesome5', iconName: 'walking', active: false },
  { id: 3, name: 'Waterfalls', iconFamily: 'Ionicons', iconName: 'water', active: false },
  { id: 4, name: 'Forts', iconFamily: 'MaterialCommunityIcons', iconName: 'castle', active: false },
  { id: 5, name: 'Caves', iconFamily: 'MaterialCommunityIcons', iconName: 'tunnel', active: false },
  { id: 6, name: 'Viewpoints', iconFamily: 'MaterialCommunityIcons', iconName: 'binoculars', active: false },
  { id: 7, name: 'Nearby', iconFamily: 'Ionicons', iconName: 'location-sharp', active: false },
];

export default function Home() {
  const insets = useSafeAreaInsets();
  
  const renderIcon = (item: any) => {
    const color = item.active ? '#1b5e20' : '#4a5568';
    if (item.iconFamily === 'Ionicons') return <Ionicons name={item.iconName as any} size={22} color={color} />;
    if (item.iconFamily === 'FontAwesome5') return <FontAwesome5 name={item.iconName as any} size={20} color={color} />;
    if (item.iconFamily === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={item.iconName as any} size={24} color={color} />;
    return null;
  };

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 120 }} bounces={false} showsVerticalScrollIndicator={false}>
        
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <ImageBackground 
            source={require('../../../assets/images/home_assets/hero_bg.jpg')}
            style={[styles.heroBg, { paddingTop: insets.top + 10 }]}
            resizeMode="cover"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Image source={require('../../../assets/images/home_assets/profile.jpg')} style={styles.profilePic} />
                <View style={styles.headerText}>
                  <View style={styles.greetingRow}>
                    <Text style={styles.greeting}>Good Morning</Text>
                    <Ionicons name="sunny" size={14} color="#fbc02d" style={{ marginLeft: 4 }} />
                  </View>
                  <Text style={styles.username}>Nikhil!</Text>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={12} color="#79d773" />
                    <Text style={styles.locationText}>Nashik, Maharashtra</Text>
                    <Ionicons name="chevron-down" size={12} color="#fff" />
                  </View>
                </View>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconButton}>
                  <BlurView intensity={40} tint="dark" style={styles.blurCircle}>
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                    <View style={styles.notificationDot} />
                  </BlurView>
                </TouchableOpacity>
                <BlurView intensity={40} tint="dark" style={styles.weatherBadge}>
                  <Ionicons name="partly-sunny" size={18} color="#fbc02d" />
                  <View style={styles.weatherTextContainer}>
                    <Text style={styles.tempText}>27°C</Text>
                    <Text style={styles.weatherText}>Clear Sky</Text>
                  </View>
                </BlurView>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
              <BlurView intensity={60} tint="light" style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#333" style={styles.searchIcon} />
                <Text style={styles.searchPlaceholder}>Search treks, places, waterfalls...</Text>
                <View style={styles.filterButton}>
                  <Ionicons name="options-outline" size={18} color="#000" />
                </View>
              </BlurView>
            </View>

            {/* Hero Content */}
            <View style={styles.heroContent}>
              <Text style={styles.heroTagline}>TREKS • NATURE • DISCOVER</Text>
              <Text style={styles.heroTitle}>Mountains</Text>
              <Text style={styles.heroTitleHighlight}>Are Calling</Text>
              <Text style={styles.heroSub}>Discover hidden trails, breathtaking views and unforgettable experiences around you.</Text>
              
              <TouchableOpacity style={styles.exploreBtn}>
                <BlurView intensity={40} tint="dark" style={styles.exploreBtnInner}>
                  <View style={styles.exploreIconCircle}>
                    <Ionicons name="navigate" size={14} color="#fff" style={{ transform: [{ rotate: '45deg' }], marginLeft: -2, marginTop: -2 }} />
                  </View>
                  <Text style={styles.exploreBtnText}>Explore Treks</Text>
                  <Ionicons name="chevron-forward" size={16} color="#fff" />
                </BlurView>
              </TouchableOpacity>
            </View>

            {/* Script Text */}
            <View style={styles.scriptContainer}>
              <Text style={styles.scriptText}>Explore</Text>
              <Text style={styles.scriptText}>Hike</Text>
              <Text style={styles.scriptText}>Breathe</Text>
              <Text style={styles.scriptText}>Repeat</Text>
            </View>
            
            {/* Peak Tag */}
            <BlurView intensity={40} tint="dark" style={styles.peakTag}>
              <Ionicons name="triangle" size={14} color="#fff" />
              <View style={styles.peakTagTextContainer}>
                <Text style={styles.peakElevation}>1,220 m</Text>
                <View style={styles.peakNameRow}>
                  <Text style={styles.peakName}>Kalsubai Peak</Text>
                  <Ionicons name="chevron-forward" size={10} color="#fff" />
                </View>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* Categories (Overlapping the hero) */}
        <View style={styles.categoriesWrapper}>
          <BlurView intensity={80} tint="light" style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {CATEGORIES.map(cat => (
                <View key={cat.id} style={styles.categoryItem}>
                  <View style={[styles.categoryIconCircle, cat.active && styles.categoryIconCircleActive]}>
                    {renderIcon(cat)}
                  </View>
                  <Text style={[styles.categoryText, cat.active && styles.categoryTextActive]}>{cat.name}</Text>
                  {cat.active && <View style={styles.activeUnderline} />}
                </View>
              ))}
            </ScrollView>
          </BlurView>
        </View>

        {/* RECOMMENDED FOR YOU */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleLeft}>
              <View style={styles.greenBar} />
              <Text style={styles.sectionTitle}>Recommended for you</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>See all</Text>
              <Ionicons name="arrow-forward" size={14} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardsScroll}>
            {/* Card 1 */}
            <View style={styles.card}>
              <ImageBackground source={require('../../../assets/images/home_assets/card_pandavleni.jpg')} style={styles.cardImg} imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <View style={styles.cardFav}>
                  <Ionicons name="heart-outline" size={18} color="#fff" />
                </View>
                <BlurView intensity={60} tint="dark" style={styles.cardBadge}>
                  <Ionicons name="triangle" size={10} color="#79d773" />
                  <Text style={styles.cardBadgeText}>Easy • 2-3 hrs</Text>
                </BlurView>
              </ImageBackground>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Pandavleni Caves</Text>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#4a5568" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>0.6 km</Text>
                      <Text style={styles.statLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>90 m</Text>
                      <Text style={styles.statLabel}>Elevation</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.cardActionBtn}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Card 2 */}
            <View style={styles.card}>
              <ImageBackground source={require('../../../assets/images/home_assets/card_anjaneri.jpg')} style={styles.cardImg} imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <View style={styles.cardFav}>
                  <Ionicons name="heart-outline" size={18} color="#fff" />
                </View>
                <BlurView intensity={60} tint="light" style={styles.cardBadgeLight}>
                  <Ionicons name="cube" size={10} color="#4299e1" />
                  <Text style={[styles.cardBadgeText, {color: '#1a365d'}]}>Moderate • 3-5 hrs</Text>
                </BlurView>
              </ImageBackground>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Anjaneri Fort</Text>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#4a5568" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>3.2 km</Text>
                      <Text style={styles.statLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>350 m</Text>
                      <Text style={styles.statLabel}>Elevation</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: '#3182ce' }]}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            {/* Card 3 */}
            <View style={styles.card}>
              <ImageBackground source={require('../../../assets/images/home_assets/card_dugarwadi.jpg')} style={styles.cardImg} imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
                <View style={styles.cardFav}>
                  <Ionicons name="heart-outline" size={18} color="#fff" />
                </View>
                <BlurView intensity={60} tint="light" style={styles.cardBadgeLight}>
                  <Ionicons name="triangle" size={10} color="#38a169" />
                  <Text style={[styles.cardBadgeText, {color: '#1a365d'}]}>Easy • 1-2 hrs</Text>
                </BlurView>
              </ImageBackground>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Dugarwadi Waterfall</Text>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#4a5568" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>2.8 km</Text>
                      <Text style={styles.statLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStat}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#333" />
                    <View>
                      <Text style={styles.statVal}>220 m</Text>
                      <Text style={styles.statLabel}>Elevation</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.cardActionBtn, { backgroundColor: '#38a169' }]}>
                    <Ionicons name="chevron-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* CONTINUE YOUR TREK */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleLeft}>
              <View style={styles.greenBar} />
              <Text style={styles.sectionTitle}>Continue Your Trek</Text>
              <Ionicons name="chevron-forward" size={16} color="#333" style={{ marginLeft: 4 }} />
            </View>
          </View>
          <View style={styles.continueCardContainer}>
            <ImageBackground source={require('../../../assets/images/home_assets/continue_bg.jpg')} style={styles.continueCardBg} imageStyle={{ borderRadius: 24 }}>
              {/* To ensure exact match with the required interactive UI without duplicating burned text, we'll construct the UI carefully */}
              <BlurView intensity={20} tint="dark" style={styles.continueCardInner}>
                <View style={styles.continueContentLeft}>
                  <Image source={require('../../../assets/images/home_assets/continue_thumb.jpg')} style={styles.continueThumb} />
                  <View style={styles.continueTextContent}>
                    <Text style={styles.continueTitle}>Pandavleni Caves</Text>
                    <Text style={styles.continueSub}>0.2 km completed</Text>
                    <View style={styles.progressRow}>
                      <View style={styles.progressBar}>
                        <View style={styles.progressFill} />
                      </View>
                      <Text style={styles.progressPct}>33%</Text>
                    </View>
                  </View>
                </View>
                {/* The map/dotted line is part of the background, so we just let it show through on the right */}
                <View style={styles.continueMapSpacer} />
              </BlurView>
            </ImageBackground>
          </View>
        </View>

        {/* YOUR PROGRESS */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleLeft}>
              <View style={styles.greenBar} />
              <Text style={styles.sectionTitle}>Your Progress</Text>
            </View>
            <TouchableOpacity style={styles.seeAllBtn}>
              <Text style={styles.seeAll}>This Week</Text>
              <Ionicons name="chevron-down" size={14} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={styles.progressGrid}>
            <View style={styles.progressBox}>
              <View style={[styles.progressIconCircle, { backgroundColor: '#e6f4ea' }]}>
                <MaterialCommunityIcons name="shoe-sneaker" size={16} color="#2e7d32" />
              </View>
              <View style={styles.progressBoxText}>
                <Text style={styles.progressVal}>0.6 km</Text>
                <Text style={styles.progressLabel}>Total Distance</Text>
              </View>
              <View style={[styles.miniGraph, { borderBottomColor: '#2e7d32' }]} />
            </View>
            <View style={styles.progressBox}>
              <View style={[styles.progressIconCircle, { backgroundColor: '#e3f2fd' }]}>
                <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#1976d2" />
              </View>
              <View style={styles.progressBoxText}>
                <Text style={styles.progressVal}>90 m</Text>
                <Text style={styles.progressLabel}>Elevation Gain</Text>
              </View>
              <View style={[styles.miniGraph, { borderBottomColor: '#1976d2' }]} />
            </View>
            <View style={styles.progressBox}>
              <View style={[styles.progressIconCircle, { backgroundColor: '#f3e5f5' }]}>
                <Ionicons name="star" size={16} color="#7b1fa2" />
              </View>
              <View style={styles.progressBoxText}>
                <Text style={styles.progressVal}>1</Text>
                <Text style={styles.progressLabel}>Treks Completed</Text>
              </View>
              <View style={[styles.miniGraph, { borderBottomColor: '#7b1fa2' }]} />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* FLOATING BOTTOM NAV */}
      <View style={styles.floatingNavContainer}>
        <ImageBackground source={require('../../../assets/images/home_assets/bottom_bg.jpg')} style={styles.bottomNavBg} imageStyle={{ borderRadius: 40 }}>
          <BlurView intensity={70} tint="dark" style={styles.bottomNavInner}>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="home" size={24} color="#79d773" />
              <Text style={[styles.navText, { color: '#79d773' }]}>Home</Text>
              <View style={styles.navActiveDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="compass-outline" size={24} color="#a0a0a0" />
              <Text style={styles.navText}>Explore</Text>
            </TouchableOpacity>
            
            <View style={styles.navCenterItem}>
              <TouchableOpacity style={styles.fabBtn}>
                <MaterialCommunityIcons name="image-filter-hdr" size={28} color="#fff" />
                <View style={styles.fabGlow} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="map-outline" size={24} color="#a0a0a0" />
              <Text style={styles.navText}>Map</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.navItem}>
              <Ionicons name="person-outline" size={24} color="#a0a0a0" />
              <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>
          </BlurView>
        </ImageBackground>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: 400,
    position: 'relative',
  },
  heroBg: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  headerText: {
    justifyContent: 'center',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    color: '#fff',
    fontSize: 10,
    marginHorizontal: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 10,
  },
  blurCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 6,
    height: 6,
    backgroundColor: '#79d773',
    borderRadius: 3,
  },
  weatherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  weatherTextContainer: {
    marginLeft: 6,
  },
  tempText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  weatherText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
  },
  searchWrapper: {
    marginBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  filterButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: '70%',
  },
  heroTagline: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
  },
  heroTitleHighlight: {
    color: '#79d773',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 8,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  exploreBtn: {
    alignSelf: 'flex-start',
  },
  exploreBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(121, 215, 115, 0.4)',
  },
  exploreIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#79d773',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  exploreBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  rightFloatContainer: {
    position: 'absolute',
    right: 20,
    top: 150,
    alignItems: 'flex-end',
  },
  scriptText: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'serif',
    fontStyle: 'italic',
    lineHeight: 28,
    opacity: 0.9,
  },
  peakTag: {
    position: 'absolute',
    bottom: 80,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  peakTagTextContainer: {
    marginLeft: 8,
  },
  peakElevation: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  peakNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  peakName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginRight: 2,
  },
  categoriesWrapper: {
    marginTop: -35,
    paddingHorizontal: 15,
    zIndex: 10,
  },
  categoriesContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  categoriesScroll: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryIconCircleActive: {
    backgroundColor: '#e6f4ea',
  },
  categoryText: {
    fontSize: 11,
    color: '#4a5568',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#1b5e20',
    fontWeight: 'bold',
  },
  activeUnderline: {
    width: 20,
    height: 2,
    backgroundColor: '#1b5e20',
    marginTop: 4,
    borderRadius: 1,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenBar: {
    width: 4,
    height: 16,
    backgroundColor: '#2e7d32',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a202c',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 12,
    color: '#4a5568',
    marginRight: 4,
  },
  cardsScroll: {
    paddingRight: 20,
  },
  card: {
    width: 170,
    height: 230,
    backgroundColor: '#fff',
    borderRadius: 24,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardImg: {
    width: '100%',
    height: 120,
    justifyContent: 'space-between',
    padding: 10,
  },
  cardFav: {
    alignSelf: 'flex-end',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBadgeLight: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardContent: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLocationText: {
    fontSize: 10,
    color: '#718096',
    marginLeft: 4,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a202c',
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 9,
    color: '#718096',
    marginLeft: 4,
  },
  cardActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueCardContainer: {
    width: '100%',
    height: 110,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  continueCardBg: {
    width: '100%',
    height: '100%',
  },
  continueCardInner: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 24,
    overflow: 'hidden',
  },
  continueContentLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  continueThumb: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 12,
  },
  continueTextContent: {
    flex: 1,
  },
  continueTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  continueSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginRight: 10,
  },
  progressFill: {
    width: '33%',
    height: '100%',
    backgroundColor: '#79d773',
    borderRadius: 3,
  },
  progressPct: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  continueMapSpacer: {
    width: 140, // Keeps right side transparent so background shows through
  },
  progressGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBox: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    position: 'relative',
  },
  progressIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBoxText: {
    alignItems: 'center',
  },
  progressVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 2,
  },
  progressLabel: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 10,
  },
  miniGraph: {
    width: '80%',
    height: 15,
    borderBottomWidth: 2,
    position: 'absolute',
    bottom: 12,
    opacity: 0.5,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    // Very simplified graph look
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomNavBg: {
    width: '100%',
    height: '100%',
  },
  bottomNavInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 40,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
    color: '#a0a0a0',
  },
  navActiveDot: {
    width: 16,
    height: 2,
    backgroundColor: '#79d773',
    borderRadius: 1,
    marginTop: 4,
  },
  navCenterItem: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1b5e20', // deep forest green
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  fabGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    shadowColor: '#79d773',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  }
});
