import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const scaleY = (val: number) => (val / 1024) * height;

export default function Record() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* FULL SCREEN BACKGROUND MAP */}
      <ImageBackground 
        source={require('../../../assets/images/record_assets/record_bg.jpg')}
        style={styles.backgroundImg}
        resizeMode="cover"
      >
        
        {/* TOP CONTROLS */}
        <View style={[styles.topRow, { top: Math.max(insets.top + 20, 50) }]}>
          {/* GPS Header */}
          <BlurView intensity={80} tint="dark" style={styles.gpsHeader}>
            <View style={styles.gpsLeft}>
              <MaterialCommunityIcons name="satellite-variant" size={24} color="#79d773" style={styles.gpsIcon} />
              <View>
                <Text style={styles.gpsTitle}>GPS Tracking...</Text>
                <Text style={styles.gpsSub}>Getting your current location</Text>
              </View>
            </View>
            <View style={styles.gpsRight}>
              <MaterialCommunityIcons name="image-filter-hdr" size={20} color="#79d773" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.accuracyLabel}>Accuracy</Text>
                <Text style={styles.accuracyValue}>3 m</Text>
              </View>
            </View>
          </BlurView>

          {/* Target Button */}
          <TouchableOpacity style={styles.targetBtn}>
            <View style={styles.targetBtnGlow} />
            <BlurView intensity={80} tint="dark" style={styles.targetBtnInner}>
              <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#63b3ed" />
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* MAP ELEMENTS (Positioned absolutely over the map) */}
        
        {/* Left Compass */}
        <BlurView intensity={70} tint="dark" style={styles.compass}>
          <Text style={styles.compassN}>N</Text>
          <View style={styles.compassNeedleContainer}>
            <Ionicons name="navigate" size={20} color="#4299e1" style={{ transform: [{ rotate: '-45deg' }] }} />
          </View>
        </BlurView>

        {/* Waypoint Card */}
        <BlurView intensity={70} tint="dark" style={styles.waypointCard}>
          <View style={styles.waypointIconCircle}>
            <Ionicons name="chevron-double-up" size={16} color="#63b3ed" />
          </View>
          <View>
            <Text style={styles.waypointVal}>1.2 km</Text>
            <Text style={styles.waypointLabel}>Next Waypoint</Text>
          </View>
        </BlurView>

        {/* Peak Label */}
        <BlurView intensity={70} tint="dark" style={styles.peakLabel}>
          <View style={styles.peakIconCircle}>
            <MaterialCommunityIcons name="image-filter-hdr" size={14} color="#79d773" />
          </View>
          <View>
            <Text style={styles.peakTitle}>Kalsubai Peak</Text>
            <Text style={styles.peakVal}>1,646 m</Text>
          </View>
        </BlurView>

        {/* Right Control Rail */}
        <BlurView intensity={70} tint="dark" style={styles.rightRail}>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="layers" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Text style={styles.rail3DText}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <MaterialCommunityIcons name="target" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="navigate" size={22} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </BlurView>

        {/* RECORDING BOTTOM SHEET */}
        <View style={styles.bottomSheetWrapper}>
          <BlurView intensity={90} tint="dark" style={styles.bottomSheet}>
            <View style={styles.dragHandle} />
            
            {/* Sheet Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderLeft}>
                <View style={styles.recordingDotContainer}>
                  <View style={styles.recordingDotGlow} />
                  <View style={styles.recordingDot} />
                </View>
                <View>
                  <Text style={styles.sheetTitle}>Recording</Text>
                  <Text style={styles.sheetSub}>Tracking your trek in real time</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.expandBtn}>
                <MaterialCommunityIcons name="arrow-expand-all" size={16} color="#a0aec0" />
              </TouchableOpacity>
            </View>

            {/* Live Stats */}
            <View style={styles.statsRow}>
              {/* Stat 1: Time */}
              <View style={styles.statCard}>
                <Ionicons name="timer-outline" size={20} color="#79d773" style={styles.statIcon} />
                <Text style={styles.statValue}>00:00:00</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>
              
              {/* Stat 2: Avg Pace */}
              <View style={styles.statCard}>
                <Ionicons name="footsteps" size={20} color="#63b3ed" style={styles.statIcon} />
                <Text style={styles.statValue}>--:--</Text>
                <Text style={styles.statLabel}>Avg pace (/km)</Text>
              </View>
              
              {/* Stat 3: Distance */}
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="image-filter-hdr" size={20} color="#ed8936" style={styles.statIcon} />
                <Text style={styles.statValue}>69.77 km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
            </View>

            {/* Elevation Card */}
            <View style={styles.elevationCard}>
              <View style={styles.elevationLeft}>
                <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#79d773" style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.elevationVal}>0 m</Text>
                  <Text style={styles.elevationLabel}>Elevation Gain</Text>
                </View>
              </View>
              <View style={styles.elevationGraph}>
                <Svg height="40" width="120" viewBox="0 0 120 40">
                  <Defs>
                    <SvgGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#79d773" stopOpacity="0.4" />
                      <Stop offset="1" stopColor="#79d773" stopOpacity="0" />
                    </SvgGradient>
                  </Defs>
                  <Path d="M 0 40 Q 20 35 40 30 T 80 10 T 120 20 L 120 40 Z" fill="url(#grad)" />
                  <Path d="M 0 40 Q 20 35 40 30 T 80 10 T 120 20" fill="none" stroke="#79d773" strokeWidth="2" />
                  <Circle cx="80" cy="10" r="3" fill="#79d773" />
                  <Circle cx="80" cy="10" r="1.5" fill="#fff" />
                </Svg>
                <Text style={styles.elevationMax}>1,220 m</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#a0aec0" />
            </View>

            {/* Control Buttons */}
            <View style={styles.controlBtnsRow}>
              <TouchableOpacity style={styles.pauseBtn}>
                <Ionicons name="pause" size={20} color="#fff" />
                <Text style={styles.pauseBtnText}>Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishBtn}>
                <View style={styles.finishSquare} />
                <Text style={styles.finishBtnText}>Finish</Text>
              </TouchableOpacity>
            </View>

            {/* SPACER for bottom nav */}
            <View style={{ height: 90 }} />
          </BlurView>
        </View>

        {/* BOTTOM NAVIGATION */}
        <BlurView intensity={80} tint="dark" style={[styles.bottomNav, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={22} color="#a0a0a0" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="compass-outline" size={22} color="#a0a0a0" />
            <Text style={styles.navText}>Explore</Text>
          </TouchableOpacity>
          
          <View style={styles.navCenterItem}>
            <TouchableOpacity style={styles.fabBtnActive}>
              <View style={styles.fabDot} />
              <View style={styles.fabGlowBlue} />
            </TouchableOpacity>
            <Text style={[styles.navText, { color: '#63b3ed', marginTop: 12 }]}>Record</Text>
            <View style={styles.navActiveUnderlineBlue} />
          </View>
          
          <TouchableOpacity style={styles.navItem}>
            <MaterialCommunityIcons name="image-filter-hdr" size={22} color="#a0a0a0" />
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
  topRow: {
    position: 'absolute',
    left: 15,
    right: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  gpsHeader: {
    flex: 1,
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(121, 215, 115, 0.3)',
    overflow: 'hidden',
  },
  gpsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsIcon: {
    marginRight: 10,
  },
  gpsTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gpsSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  gpsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accuracyLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    textAlign: 'right',
  },
  accuracyValue: {
    color: '#79d773',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  targetBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetBtnGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 25,
    backgroundColor: '#63b3ed',
    opacity: 0.3,
    shadowColor: '#63b3ed',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },
  targetBtnInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.5)',
    overflow: 'hidden',
  },
  compass: {
    position: 'absolute',
    top: scaleY(130),
    left: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  compassN: {
    color: '#e53e3e',
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
    top: 6,
  },
  compassNeedleContainer: {
    marginTop: 6,
  },
  waypointCard: {
    position: 'absolute',
    top: scaleY(260),
    left: 80,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.3)',
    overflow: 'hidden',
  },
  waypointIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 179, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  waypointVal: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  waypointLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
  },
  peakLabel: {
    position: 'absolute',
    top: scaleY(140),
    right: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  peakIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  peakTitle: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  peakVal: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
  },
  rightRail: {
    position: 'absolute',
    top: scaleY(220),
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
    marginVertical: 12,
    alignItems: 'center',
  },
  rail3DText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10, 15, 30, 0.6)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  bottomSheet: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.2)',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDotContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  recordingDotGlow: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e53e3e',
    opacity: 0.4,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fc8181',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  sheetSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
  },
  expandBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  elevationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  elevationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elevationVal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  elevationLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
  },
  elevationGraph: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  elevationMax: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    position: 'absolute',
    right: 0,
    top: 5,
  },
  controlBtnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pauseBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dd6b20',
    height: 56,
    borderRadius: 28,
  },
  pauseBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  finishBtn: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  finishSquare: {
    width: 14,
    height: 14,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  finishBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
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
  navActiveUnderlineBlue: {
    width: 24,
    height: 2,
    backgroundColor: '#63b3ed',
    borderRadius: 1,
    marginTop: 4,
  },
  navCenterItem: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBtnActive: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(10, 20, 40, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4299e1',
  },
  fabDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  fabGlowBlue: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    shadowColor: '#4299e1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  }
});
