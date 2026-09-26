import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Dimensions, StatusBar, ScrollView } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Activity() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* TOP BACKGROUND MOUNTAINS */}
      <Image 
        source={require('../../../assets/images/activity_assets/top_bg.jpg')}
        style={styles.topBgImg}
        resizeMode="cover"
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top + 20, 50) }]} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.profilePicWrapper}>
              <Image source={require('../../../assets/images/activity_assets/profile.jpg')} style={styles.profilePic} />
            </View>
            <View style={styles.headerTextWrap}>
              <Text style={styles.pageTitle}>My Activity</Text>
              <Text style={styles.pageSubTitle}>Track • Explore • Achieve</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.signOutBtn}>
            <Ionicons name="log-out-outline" size={16} color="#fc8181" style={{ marginRight: 6 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* 4 STATS CARDS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#48bb78" />
            <Text style={styles.statValue}>16</Text>
            <Text style={styles.statLabel}>Total Treks</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="map" size={20} color="#63b3ed" />
            <Text style={styles.statValue}>128.4 <Text style={styles.statUnit}>km</Text></Text>
            <Text style={styles.statLabel}>Total Distance</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="time" size={20} color="#b794f4" />
            <Text style={styles.statValue}>24.5 <Text style={styles.statUnit}>hrs</Text></Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={20} color="#f6e05e" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Verified Treks</Text>
          </View>
        </View>

        {/* SECTION HEADER */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <View style={styles.greenBar} />
            <View>
              <Text style={styles.sectionTitle}>My Recorded Treks</Text>
              <Text style={styles.sectionSubTitle}>Your adventure history</Text>
            </View>
          </View>
          <View style={styles.sectionHeaderRight}>
            <View style={styles.dropdownBtn}>
              <Text style={styles.dropdownText}>Recent</Text>
              <Ionicons name="chevron-down" size={14} color="#a0aec0" />
            </View>
            <Text style={styles.trackCountText}>16 Tracks</Text>
          </View>
        </View>

        {/* RECORDED TREKS LIST */}
        <View style={styles.cardsList}>
          
          {/* CARD 1 */}
          <BlurView intensity={40} tint="dark" style={styles.recordCard}>
            <View style={styles.cardTopArea}>
              <Image source={require('../../../assets/images/activity_assets/thumb_1.jpg')} style={styles.cardThumb} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Pandavleni Caves</Text>
                  <View style={styles.badgeVerified}>
                    <Ionicons name="checkmark" size={12} color="#48bb78" />
                    <Text style={styles.badgeVerifiedText}>Verified</Text>
                  </View>
                </View>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#48bb78" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="transit-connection-variant" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>10.14 km</Text>
                      <Text style={styles.cardStatLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>90 m</Text>
                      <Text style={styles.cardStatLabel}>Elevation</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <Ionicons name="time-outline" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>2h 34m</Text>
                      <Text style={styles.cardStatLabel}>Duration</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.graphContainer}>
                  <Svg height="30" width="100%" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <Path d="M 0 25 C 40 25 60 5 100 15 C 140 25 160 5 200 25" fill="none" stroke="#48bb78" strokeWidth="2" />
                  </Svg>
                  <Ionicons name="chevron-forward" size={14} color="#a0aec0" style={styles.graphArrow} />
                </View>
              </View>
            </View>
            <View style={styles.cardActionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnBlue, { flex: 0.35 }]}>
                <Ionicons name="navigate" size={14} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text style={styles.actionBtnText}>View / Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDark, { flex: 0.25 }]}>
                <Ionicons name="share-social" size={16} color="#a0aec0" />
                <Text style={styles.actionBtnTextGray}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGreen, { flex: 0.4 }]}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Submit for Verification</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* CARD 2 */}
          <BlurView intensity={40} tint="dark" style={styles.recordCard}>
            <View style={styles.cardTopArea}>
              <Image source={require('../../../assets/images/activity_assets/thumb_2.jpg')} style={styles.cardThumb} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>Pandavleni</Text>
                  <View style={styles.badgePending}>
                    <Ionicons name="hourglass-outline" size={12} color="#ecc94b" />
                    <Text style={styles.badgePendingText}>Pending</Text>
                  </View>
                </View>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#48bb78" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="transit-connection-variant" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>4.10 km</Text>
                      <Text style={styles.cardStatLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>120 m</Text>
                      <Text style={styles.cardStatLabel}>Elevation</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <Ionicons name="time-outline" size={16} color="#63b3ed" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>1h 20m</Text>
                      <Text style={styles.cardStatLabel}>Duration</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.graphContainer}>
                  <Svg height="30" width="100%" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <Path d="M 0 25 C 50 25 80 10 120 20 C 160 30 180 20 200 25" fill="none" stroke="#4299e1" strokeWidth="2" />
                  </Svg>
                  <Ionicons name="chevron-forward" size={14} color="#a0aec0" style={styles.graphArrow} />
                </View>
              </View>
            </View>
            <View style={styles.cardActionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnBlue, { flex: 0.35 }]}>
                <Ionicons name="navigate" size={14} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text style={styles.actionBtnText}>View / Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDark, { flex: 0.25 }]}>
                <Ionicons name="share-social" size={16} color="#a0aec0" />
                <Text style={styles.actionBtnTextGray}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGoldOutline, { flex: 0.4 }]}>
                <Ionicons name="hourglass-outline" size={16} color="#ecc94b" />
                <Text style={styles.actionBtnTextGold}>Pending Admin Approval ?</Text>
                <Ionicons name="chevron-forward" size={14} color="#ecc94b" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* CARD 3 */}
          <BlurView intensity={40} tint="dark" style={styles.recordCard}>
            <View style={styles.cardTopArea}>
              <Image source={require('../../../assets/images/activity_assets/thumb_3.jpg')} style={styles.cardThumb} />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardTitle}>My Expedition</Text>
                  <View style={styles.badgeVerified}>
                    <Ionicons name="checkmark" size={12} color="#48bb78" />
                    <Text style={styles.badgeVerifiedText}>Verified</Text>
                  </View>
                </View>
                <View style={styles.cardLocationRow}>
                  <Ionicons name="location-sharp" size={12} color="#48bb78" />
                  <Text style={styles.cardLocationText}>Nashik, Maharashtra</Text>
                </View>
                <View style={styles.cardStatsRow}>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="transit-connection-variant" size={16} color="#9f7aea" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>15 m</Text>
                      <Text style={styles.cardStatLabel}>Distance</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#9f7aea" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>12 m</Text>
                      <Text style={styles.cardStatLabel}>Elevation</Text>
                    </View>
                  </View>
                  <View style={styles.cardStatItem}>
                    <Ionicons name="time-outline" size={16} color="#9f7aea" />
                    <View style={styles.statTextWrap}>
                      <Text style={styles.cardStatVal}>12m</Text>
                      <Text style={styles.cardStatLabel}>Duration</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.graphContainer}>
                  <Svg height="30" width="100%" viewBox="0 0 200 30" preserveAspectRatio="none">
                    <Path d="M 0 25 C 30 25 50 15 100 25 C 150 35 180 15 200 25" fill="none" stroke="#9f7aea" strokeWidth="2" />
                  </Svg>
                  <Ionicons name="chevron-forward" size={14} color="#a0aec0" style={styles.graphArrow} />
                </View>
              </View>
            </View>
            <View style={styles.cardActionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnBlue, { flex: 0.35 }]}>
                <Ionicons name="navigate" size={14} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
                <Text style={styles.actionBtnText}>View / Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDark, { flex: 0.25 }]}>
                <Ionicons name="share-social" size={16} color="#a0aec0" />
                <Text style={styles.actionBtnTextGray}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGreen, { flex: 0.4 }]}>
                <MaterialCommunityIcons name="shield-check" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Submit for Verification</Text>
              </TouchableOpacity>
            </View>
          </BlurView>

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM NAVIGATION DOCK */}
      <View style={styles.floatingNavContainer}>
        <BlurView intensity={90} tint="dark" style={styles.bottomNavInner}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#a0a0a0" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="compass-outline" size={24} color="#a0a0a0" />
            <Text style={styles.navText}>Explore</Text>
          </TouchableOpacity>
          
          <View style={styles.navCenterItem}>
            <View style={styles.fabBtnOrange}>
              <View style={styles.fabInnerOrange} />
            </View>
            <Text style={[styles.navText, { marginTop: 12 }]}>Record</Text>
          </View>
          
          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#a0a0a0" />
            <Text style={styles.navText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <FontAwesome5 name="running" size={24} color="#48bb78" />
            <Text style={[styles.navText, { color: '#48bb78' }]}>Activity</Text>
            <View style={styles.navActiveDotGreen} />
          </TouchableOpacity>
        </BlurView>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a10',
  },
  topBgImg: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 300,
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#38b2ac',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#38b2ac',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    marginRight: 12,
  },
  profilePic: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  headerTextWrap: {
    justifyContent: 'center',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  pageSubTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'rgba(229, 62, 62, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 62, 62, 0.4)',
  },
  signOutText: {
    color: '#fc8181',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '23%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 'normal',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenBar: {
    width: 4,
    height: 18,
    backgroundColor: '#48bb78',
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionSubTitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  sectionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  dropdownText: {
    color: '#fff',
    fontSize: 11,
    marginRight: 4,
  },
  trackCountText: {
    color: '#63b3ed',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardsList: {
    gap: 16,
  },
  recordCard: {
    backgroundColor: 'rgba(10, 20, 30, 0.4)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.15)',
    padding: 12,
    overflow: 'hidden',
  },
  cardTopArea: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cardThumb: {
    width: 110,
    height: 110,
    borderRadius: 12,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
  },
  badgeVerified: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(72, 187, 120, 0.4)',
    backgroundColor: 'rgba(72, 187, 120, 0.1)',
  },
  badgeVerifiedText: {
    color: '#48bb78',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  badgePending: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(236, 201, 75, 0.4)',
    backgroundColor: 'rgba(236, 201, 75, 0.1)',
  },
  badgePendingText: {
    color: '#ecc94b',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  cardLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLocationText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginLeft: 4,
  },
  cardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statTextWrap: {
    marginLeft: 4,
  },
  cardStatVal: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardStatLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
  },
  graphContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    marginTop: 4,
  },
  graphArrow: {
    position: 'absolute',
    right: 0,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  actionBtnBlue: {
    backgroundColor: '#3182ce',
  },
  actionBtnDark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionBtnGreen: {
    backgroundColor: '#2f855a',
  },
  actionBtnGoldOutline: {
    backgroundColor: 'rgba(236, 201, 75, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(236, 201, 75, 0.4)',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  actionBtnTextGray: {
    color: '#a0aec0',
    fontSize: 11,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  actionBtnTextGold: {
    color: '#ecc94b',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bottomNavInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
  navActiveDotGreen: {
    width: 30,
    height: 2,
    backgroundColor: '#48bb78',
    borderRadius: 1,
    marginTop: 4,
  },
  navCenterItem: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBtnOrange: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(221, 107, 32, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabInnerOrange: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#dd6b20',
  }
});
