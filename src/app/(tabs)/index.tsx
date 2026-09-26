import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, TouchableOpacity, Dimensions, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, FontAwesome5, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 1, name: 'All', iconFamily: 'MaterialCommunityIcons', iconName: 'image-filter-hdr' },
  { id: 2, name: 'Trekking', iconFamily: 'FontAwesome5', iconName: 'walking' },
  { id: 3, name: 'Waterfalls', iconFamily: 'Ionicons', iconName: 'water' },
  { id: 4, name: 'Forts', iconFamily: 'MaterialCommunityIcons', iconName: 'castle' },
  { id: 5, name: 'Caves', iconFamily: 'MaterialCommunityIcons', iconName: 'tunnel' },
  { id: 6, name: 'Viewpoints', iconFamily: 'MaterialCommunityIcons', iconName: 'binoculars' },
  { id: 7, name: 'Nearby', iconFamily: 'Ionicons', iconName: 'location-sharp' },
];

const RECOMMENDED = [
  { id: 1, title: 'Pandavleni Caves', location: 'Nashik, Maharashtra', image: require('../../../assets/images/home_assets/card_pandavleni.jpg'), difficulty: 'Easy', duration: '2-3 hrs', distance: '0.6 km', elevation: '90 m' },
  { id: 2, title: 'Anjaneri Fort', location: 'Nashik, Maharashtra', image: require('../../../assets/images/home_assets/card_anjaneri.jpg'), difficulty: 'Moderate', duration: '3-5 hrs', distance: '3.2 km', elevation: '350 m' }, 
  { id: 3, title: 'Dugarwadi Waterfall', location: 'Nashik, Maharashtra', image: require('../../../assets/images/home_assets/card_dugarwadi.jpg'), difficulty: 'Easy', duration: '1-2 hrs', distance: '2.8 km', elevation: '220 m' }
];

export default function Home() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(1);
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* HERO SECTION */}
        <View style={styles.heroContainer}>
          <ImageBackground 
            source={require('../../../assets/images/hero_bg.jpg')} 
            style={styles.heroBg}
            imageStyle={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
          >
            {/* GRADIENT OVERLAY */}
            <LinearGradient
              colors={['rgba(252,253,252,0)', '#fcfdfc']}
              style={styles.heroGradient}
            />

            <View style={[styles.headerArea, { paddingTop: insets.top + 10 }]}>
              {/* TOP NAV */}
              <View style={styles.topNav}>
                <View style={styles.profileRow}>
                  <Image source={require('../../../assets/images/home_assets/profile.jpg')} style={styles.profilePic} />
                  <View style={styles.profileText}>
                    <Text style={styles.greeting}>Good Morning ☀️</Text>
                    <Text style={styles.name}>Nikhil!</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={12} color="#90EE90" />
                      <Text style={styles.location}>Nashik, Maharashtra <Ionicons name="chevron-down" size={12} color="#fff" /></Text>
                    </View>
                  </View>
                </View>

                <View style={styles.rightNav}>
                  <BlurView intensity={30} tint="dark" style={styles.bellBtn}>
                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                    <View style={styles.bellDot} />
                  </BlurView>
                  <BlurView intensity={30} tint="dark" style={styles.weatherBtn}>
                    <Ionicons name="partly-sunny" size={20} color="#FFD700" />
                    <View style={styles.weatherTextCont}>
                      <Text style={styles.weatherTemp}>27°C</Text>
                      <Text style={styles.weatherDesc}>Clear Sky</Text>
                    </View>
                  </BlurView>
                </View>
              </View>

              {/* SEARCH BAR */}
              <View style={styles.searchContainer}>
                <BlurView intensity={80} tint="light" style={styles.searchBlur}>
                  <Ionicons name="search" size={20} color="#333" style={styles.searchIcon} />
                  <TextInput 
                    placeholder="Search treks, places, waterfalls..." 
                    placeholderTextColor="#666" 
                    style={styles.searchInput}
                  />
                  <View style={styles.filterBtn}>
                    <Ionicons name="options-outline" size={20} color="#333" />
                  </View>
                </BlurView>
              </View>

              {/* HERO TEXT */}
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTagline}>TREKS • NATURE • DISCOVER</Text>
                <Text style={styles.heroTitleMain}>Mountains</Text>
                <Text style={styles.heroTitleSub}>Are Calling</Text>
                <Text style={styles.heroDesc}>
                  Discover hidden trails, breathtaking views and unforgettable experiences around you.
                </Text>
                <TouchableOpacity style={styles.exploreBtn}>
                  <View style={styles.exploreIconBg}>
                    <FontAwesome5 name="location-arrow" size={14} color="#000" />
                  </View>
                  <Text style={styles.exploreBtnText}>Explore Treks  <Ionicons name="chevron-forward" size={16} color="#fff" /></Text>
                </TouchableOpacity>
              </View>

            </View>
          </ImageBackground>
        </View>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {CATEGORIES.map(cat => {
            const isActive = activeTab === cat.id;
            return (
              <TouchableOpacity key={cat.id} onPress={() => setActiveTab(cat.id)} style={[styles.catBox, isActive && styles.catBoxActive]}>
                <View style={styles.catIconCont}>
                  {cat.iconFamily === 'Ionicons' ? <Ionicons name={cat.iconName as any} size={24} color={isActive ? "#4CAF50" : "#666"} /> :
                   cat.iconFamily === 'FontAwesome5' ? <FontAwesome5 name={cat.iconName as any} size={24} color={isActive ? "#4CAF50" : "#666"} /> :
                   <MaterialCommunityIcons name={cat.iconName as any} size={24} color={isActive ? "#4CAF50" : "#666"} />}
                </View>
                <Text style={[styles.catText, isActive && styles.catTextActive]}>{cat.name}</Text>
                {isActive && <View style={styles.activeDot} />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* RECOMMENDED SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}><View style={styles.titleLine}/> Recommended for you</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See all <Ionicons name="arrow-forward" size={14} /></Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recScroll}>
          {RECOMMENDED.map(item => (
            <View key={item.id} style={styles.recCard}>
              <ImageBackground source={item.image} style={styles.recImage} imageStyle={{borderRadius: 16}}>
                <TouchableOpacity style={styles.heartBtn}>
                  <Ionicons name="heart-outline" size={18} color="#fff" />
                </TouchableOpacity>
                <View style={[styles.badge, { backgroundColor: item.difficulty === 'Easy' ? '#e0f5e9' : '#e0f0ff' }]}>
                  <Ionicons name={item.difficulty === 'Easy' ? 'leaf' : 'trending-up'} size={12} color={item.difficulty === 'Easy' ? '#2e7d32' : '#0277bd'} />
                  <Text style={[styles.badgeText, { color: item.difficulty === 'Easy' ? '#2e7d32' : '#0277bd' }]}>{item.difficulty} • {item.duration}</Text>
                </View>
              </ImageBackground>
              <View style={styles.recInfo}>
                <Text style={styles.recTitle}>{item.title}</Text>
                <Text style={styles.recLoc}><Ionicons name="location" size={12} color="#666" /> {item.location}</Text>
                <View style={styles.recStats}>
                  <View style={styles.statCol}>
                    <MaterialCommunityIcons name="map-marker-distance" size={16} color="#333" />
                    <View style={{marginLeft: 4}}>
                      <Text style={styles.statVal}>{item.distance}</Text>
                      <Text style={styles.statLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.statCol}>
                    <MaterialCommunityIcons name="elevation-rise" size={16} color="#333" />
                    <View style={{marginLeft: 4}}>
                      <Text style={styles.statVal}>{item.elevation}</Text>
                      <Text style={styles.statLabel}>Elevation</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.goBtn}>
                    <Ionicons name="chevron-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* CONTINUE TREK */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}><View style={styles.titleLine}/> Continue Your Trek <Ionicons name="chevron-forward" size={16} color="#333" /></Text>
        </View>
        
        <View style={styles.continueCardWrapper}>
          <ImageBackground source={require('../../../assets/images/home_assets/continue_bg.jpg')} style={styles.continueCardBg} imageStyle={{borderRadius: 20}}>
            <BlurView intensity={70} tint="dark" style={styles.continueBlur}>
              <View style={styles.continueLeft}>
                <Image source={require('../../../assets/images/home_assets/continue_thumb.jpg')} style={styles.continueThumb} />
                <View style={styles.continueInfo}>
                  <Text style={styles.continueTitle}>Pandavleni Caves</Text>
                  <Text style={styles.continueSub}>0.2 km completed</Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: '33%' }]} />
                  </View>
                </View>
                <Text style={styles.progressText}>33%</Text>
              </View>
              <View style={styles.continueRightMap}>
                <View style={styles.mockMapPath}>
                    <Ionicons name="location" size={16} color="#4CAF50" style={{position:'absolute', top: -10, left: -10}} />
                    <Ionicons name="navigate-circle" size={20} color="#fff" style={{position:'absolute', bottom: -10, right: -10}} />
                </View>
              </View>
            </BlurView>
          </ImageBackground>
        </View>

        {/* YOUR PROGRESS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}><View style={styles.titleLine}/> Your Progress</Text>
          <TouchableOpacity style={styles.dropdownBtn}>
            <Text style={styles.dropdownText}>This Week <Ionicons name="chevron-down" size={14} /></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressGrid}>
          <View style={styles.progCard}>
            <View style={styles.progIconWrap}>
              <FontAwesome5 name="shoe-prints" size={16} color="#4CAF50" />
            </View>
            <View style={styles.progTextWrap}>
              <Text style={styles.progVal}>0.6 km</Text>
              <Text style={styles.progLabel}>Total Distance</Text>
            </View>
          </View>
          <View style={styles.progCard}>
            <View style={styles.progIconWrap}>
              <MaterialCommunityIcons name="image-filter-hdr" size={18} color="#2196F3" />
            </View>
            <View style={styles.progTextWrap}>
              <Text style={styles.progVal}>90 m</Text>
              <Text style={styles.progLabel}>Elevation Gain</Text>
            </View>
          </View>
          <View style={styles.progCard}>
            <View style={styles.progIconWrap}>
              <Ionicons name="star" size={18} color="#9C27B0" />
            </View>
            <View style={styles.progTextWrap}>
              <Text style={styles.progVal}>1</Text>
              <Text style={styles.progLabel}>Treks Completed</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fcfdfc' },
  heroContainer: { width: '100%', height: 440 },
  heroBg: { width: '100%', height: '100%' },
  heroGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 150 },
  headerArea: { paddingHorizontal: 20 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  profilePic: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  greeting: { color: '#eee', fontSize: 12 },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  location: { color: '#ccc', fontSize: 12, marginLeft: 4 },
  rightNav: { flexDirection: 'row', gap: 8 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  bellDot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#4CAF50' },
  weatherBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, overflow: 'hidden' },
  weatherTextCont: { marginLeft: 8 },
  weatherTemp: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  weatherDesc: { color: '#ccc', fontSize: 10 },
  searchContainer: { marginBottom: 30 },
  searchBlur: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 25, paddingHorizontal: 16, height: 50, overflow: 'hidden' },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', color: '#333', fontSize: 14 },
  filterBtn: { padding: 6, backgroundColor: '#fff', borderRadius: 15 },
  heroTextContainer: { marginTop: 10 },
  heroTagline: { color: '#fff', fontSize: 10, letterSpacing: 1.5, fontWeight: 'bold', marginBottom: 8 },
  heroTitleMain: { color: '#fff', fontSize: 42, fontWeight: '900', lineHeight: 48 },
  heroTitleSub: { color: '#90EE90', fontSize: 42, fontWeight: '900', lineHeight: 48, marginBottom: 12 },
  heroDesc: { color: '#eee', fontSize: 13, lineHeight: 20, width: '75%', marginBottom: 20 },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 25, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  exploreIconBg: { backgroundColor: '#90EE90', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  exploreBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  
  catScroll: { paddingHorizontal: 20, marginTop: -20, paddingBottom: 20 },
  catBox: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, minWidth: 70 },
  catBoxActive: { backgroundColor: '#f0fdf4' },
  catIconCont: { marginBottom: 8 },
  catText: { fontSize: 12, color: '#666', fontWeight: '500' },
  catTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#4CAF50', marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', flexDirection: 'row', alignItems: 'center' },
  titleLine: { width: 4, height: 16, backgroundColor: '#4CAF50', borderRadius: 2, marginRight: 8 },
  seeAll: { fontSize: 14, color: '#333', fontWeight: '500' },
  
  recScroll: { paddingHorizontal: 20, paddingBottom: 20 },
  recCard: { backgroundColor: '#fff', borderRadius: 20, width: 240, marginRight: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  recImage: { width: '100%', height: 140, justifyContent: 'space-between', padding: 12 },
  heartBtn: { alignSelf: 'flex-end', width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
  recInfo: { padding: 16 },
  recTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  recLoc: { fontSize: 12, color: '#666', marginBottom: 16 },
  recStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statCol: { flexDirection: 'row', alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: 'bold', color: '#111' },
  statLabel: { fontSize: 10, color: '#666' },
  goBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1976D2', justifyContent: 'center', alignItems: 'center' },

  continueCardWrapper: { paddingHorizontal: 20, marginBottom: 25 },
  continueCardBg: { width: '100%', height: 110, overflow: 'hidden', borderRadius: 20 },
  continueBlur: { flex: 1, flexDirection: 'row', padding: 15, justifyContent: 'space-between' },
  continueLeft: { flexDirection: 'row', flex: 1 },
  continueThumb: { width: 60, height: 80, borderRadius: 12, marginRight: 12 },
  continueInfo: { flex: 1, justifyContent: 'center' },
  continueTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  continueSub: { color: '#ccc', fontSize: 12, marginBottom: 12 },
  progressTrack: { width: '80%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: '#4CAF50', borderRadius: 3 },
  progressText: { color: '#fff', fontSize: 12, alignSelf: 'flex-end', marginBottom: 20, marginLeft: -20 },
  continueRightMap: { width: 80, height: '100%', justifyContent: 'center', alignItems: 'center' },
  mockMapPath: { width: 50, height: 30, borderBottomWidth: 2, borderRightWidth: 2, borderColor: '#fff', borderStyle: 'dashed', borderRadius: 10 },

  dropdownBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 15 },
  dropdownText: { fontSize: 12, color: '#333', marginRight: 4 },

  progressGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  progCard: { backgroundColor: '#fff', width: (width - 60) / 3, padding: 12, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, alignItems: 'center' },
  progIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f5f7fa', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  progVal: { fontSize: 16, fontWeight: 'bold', color: '#111', textAlign: 'center' },
  progLabel: { fontSize: 10, color: '#666', textAlign: 'center', marginTop: 4 },
  progTextWrap: { alignItems: 'center' }
});
