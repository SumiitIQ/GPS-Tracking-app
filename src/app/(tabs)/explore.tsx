import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// We use relative positioning scaling based on the reference dimensions 456x1024
const scaleY = (val: number) => (val / 1024) * height;

export default function Explore() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* FULL SCREEN BACKGROUND (Using the extracted screenshot) */}
      <ImageBackground 
        source={require('../../../assets/images/explore_assets/explore_bg.jpg')}
        style={styles.backgroundImg}
        resizeMode="cover"
      >
        
        {/* TOP SEARCH BAR */}
        <BlurView intensity={70} tint="dark" style={[styles.searchBar, { top: Math.max(insets.top + 20, 50) }]}>
          <Ionicons name="search" size={20} color="#fff" style={styles.searchIcon} />
          <Text style={styles.searchText}>Search treks, places, waterfalls...</Text>
          <View style={styles.searchDivider} />
          <Ionicons name="options-outline" size={20} color="#79d773" />
        </BlurView>

        {/* DISCOVER BANNER */}
        <View style={[styles.discoverBannerWrapper, { top: Math.max(insets.top + 90, 120) }]}>
          <BlurView intensity={70} tint="dark" style={styles.discoverBanner}>
            <MaterialCommunityIcons name="image-filter-hdr" size={14} color="#79d773" />
            <Text style={styles.discoverText}>DISCOVER EPIC ADVENTURES (244)</Text>
          </BlurView>
          <View style={styles.discoverChevron}>
            <Ionicons name="chevron-down" size={14} color="#79d773" />
          </View>
        </View>

        {/* LEFT COMPASS */}
        <BlurView intensity={60} tint="dark" style={styles.leftCompass}>
          <Text style={styles.compassN}>N</Text>
          <View style={styles.compassNeedleContainer}>
            <Ionicons name="navigate" size={16} color="#79d773" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </BlurView>

        {/* RIGHT CONTROL RAIL */}
        <BlurView intensity={60} tint="dark" style={styles.rightRail}>
          <TouchableOpacity style={styles.railItem}>
            <View style={styles.compassNeedleContainerSmall}>
              <Ionicons name="navigate" size={14} color="#79d773" style={{ transform: [{ rotate: '-45deg' }] }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="layers" size={22} color="#63b3ed" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Text style={styles.rail3DText}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <MaterialCommunityIcons name="target" size={22} color="#63b3ed" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="navigate" size={22} color="#90cdf4" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </BlurView>

        {/* BOTTOM UI OVERLAYS */}
        {/* GPX & THUMBNAILS (Positioned relative to bottom) */}
        <View style={styles.midBottomRow}>
          {/* GPX Card */}
          <BlurView intensity={80} tint="dark" style={styles.gpxCard}>
            <View style={styles.gpxIconWrapper}>
              <Ionicons name="airplane" size={20} color="#79d773" style={{ transform: [{ rotate: '-45deg' }] }} />
            </View>
            <View style={styles.gpxTextWrapper}>
              <Text style={styles.gpxTitle}>Import GPX Route</Text>
              <Text style={styles.gpxSub}>Navigate your own path</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#a0aec0" />
          </BlurView>

          {/* Thumbnails */}
          <BlurView intensity={80} tint="dark" style={styles.thumbnailsCard}>
            <Image source={require('../../../assets/images/explore_assets/thumb_1.jpg')} style={styles.thumbImage} />
            <Image source={require('../../../assets/images/explore_assets/thumb_2.jpg')} style={styles.thumbImage} />
            <View style={styles.thumbImageWrapper}>
              <Image source={require('../../../assets/images/explore_assets/thumb_3.jpg')} style={styles.thumbImage} />
              <View style={styles.thumbOverlay}>
                <Text style={styles.thumbOverlayText}>+240</Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* CATEGORY PANEL */}
        <BlurView intensity={80} tint="dark" style={styles.categoryPanel}>
          <View style={styles.categoryHandle} />
          <View style={styles.categoryRow}>
            
            {/* Category: All */}
            <View style={styles.catItem}>
              <View style={[styles.catIconBox, styles.catIconBoxActive]}>
                <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#79d773" />
              </View>
              <Text style={styles.catTextActive}>All</Text>
            </View>

            {/* Category: Mountains */}
            <View style={styles.catItem}>
              <View style={styles.catIconBox}>
                <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#63b3ed" />
              </View>
              <Text style={styles.catText}>Mountains</Text>
            </View>

            {/* Category: Waterfalls */}
            <View style={styles.catItem}>
              <View style={styles.catIconBox}>
                <Ionicons name="water" size={24} color="#63b3ed" />
              </View>
              <Text style={styles.catText}>Waterfalls</Text>
            </View>

            {/* Category: Caves */}
            <View style={styles.catItem}>
              <View style={styles.catIconBox}>
                <MaterialCommunityIcons name="tunnel" size={24} color="#b794f4" />
              </View>
              <Text style={styles.catText}>Caves</Text>
            </View>

            {/* Category: Forts */}
            <View style={styles.catItem}>
              <View style={styles.catIconBox}>
                <MaterialCommunityIcons name="castle" size={24} color="#fc8181" />
              </View>
              <Text style={styles.catText}>Forts</Text>
            </View>

            {/* Category: Nearby */}
            <View style={styles.catItem}>
              <View style={styles.catIconBox}>
                <Ionicons name="location-sharp" size={24} color="#79d773" />
              </View>
              <Text style={styles.catText}>Nearby</Text>
            </View>

          </View>
        </BlurView>

        {/* BOTTOM NAVIGATION */}
        <BlurView intensity={80} tint="dark" style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={22} color="#a0a0a0" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="compass-outline" size={22} color="#79d773" />
            <Text style={[styles.navText, { color: '#79d773' }]}>Explore</Text>
            <View style={styles.navActiveUnderline} />
          </TouchableOpacity>
          
          <View style={styles.navCenterItem}>
            <TouchableOpacity style={styles.fabBtn}>
              <MaterialCommunityIcons name="image-filter-hdr" size={28} color="#fff" />
              <View style={styles.fabGlow} />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="map-outline" size={22} color="#a0a0a0" />
            <Text style={styles.navText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome5 name="walking" size={22} color="#a0a0a0" />
            <Text style={styles.navText}>Activity</Text>
          </TouchableOpacity>
        </BlurView>

      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImg: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  searchBar: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(121, 215, 115, 0.3)',
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 12,
  },
  discoverBannerWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  discoverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(121, 215, 115, 0.2)',
  },
  discoverText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  discoverChevron: {
    marginTop: -4,
  },
  leftCompass: {
    position: 'absolute',
    top: scaleY(180),
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  compassN: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: 4,
  },
  compassNeedleContainer: {
    marginTop: 6,
  },
  compassNeedleContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  rightRail: {
    position: 'absolute',
    top: scaleY(280),
    right: 15,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  railItem: {
    marginVertical: 10,
    alignItems: 'center',
  },
  rail3DText: {
    color: '#63b3ed',
    fontSize: 16,
    fontWeight: 'bold',
  },
  midBottomRow: {
    position: 'absolute',
    bottom: 220,
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 64,
  },
  gpxCard: {
    flex: 0.55,
    height: '100%',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(121, 215, 115, 0.4)',
    overflow: 'hidden',
    marginRight: 10,
  },
  gpxIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(121, 215, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gpxTextWrapper: {
    flex: 1,
  },
  gpxTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gpxSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
  },
  thumbnailsCard: {
    flex: 0.45,
    height: '100%',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  thumbImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  thumbImageWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 10,
    overflow: 'hidden',
  },
  thumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbOverlayText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  categoryPanel: {
    position: 'absolute',
    bottom: 105,
    left: 15,
    right: 15,
    height: 105,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    alignItems: 'center',
  },
  categoryHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 8,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 8,
  },
  catItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  catIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  catIconBoxActive: {
    borderColor: '#79d773',
    backgroundColor: 'rgba(121, 215, 115, 0.1)',
    shadowColor: '#79d773',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  catText: {
    color: '#a0aec0',
    fontSize: 9,
  },
  catTextActive: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    height: 76,
    borderRadius: 38,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
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
  navActiveUnderline: {
    width: 24,
    height: 2,
    backgroundColor: '#79d773',
    borderRadius: 1,
    marginTop: 4,
  },
  navCenterItem: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1b5e20',
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
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  }
});
