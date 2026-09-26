import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
// Using fixed reference width/height to scale positions if needed. 
// However, using percentage or flex where possible is safer. 
// For absolute markers over a static map, we scale vertically.
const scaleY = (val: number) => (val / 1024) * height;
const scaleX = (val: number) => (val / 456) * width;

export default function Navigate() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tabs.Screen options={{ headerShown: false, tabBarStyle: { display: 'none' } }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* MAP BACKGROUND */}
      <ImageBackground 
        source={require('../../../assets/images/navigate_assets/navigate_bg.jpg')}
        style={styles.backgroundImg}
        resizeMode="cover"
      >
        
        {/* TOP STATUS ROW */}
        <View style={[styles.topRow, { top: Math.max(insets.top + 10, 40) }]}>
          {/* Compass */}
          <BlurView intensity={80} tint="dark" style={styles.compass}>
            <Text style={styles.compassN}>N</Text>
            <View style={styles.compassNeedleContainer}>
              <Ionicons name="navigate" size={20} color="#fff" style={{ transform: [{ rotate: '-45deg' }] }} />
            </View>
          </BlurView>

          {/* ON ROUTE Pill */}
          <View style={styles.onRouteContainer}>
            <View style={styles.onRouteGlow} />
            <BlurView intensity={80} tint="dark" style={styles.onRoutePill}>
              <View style={styles.onRouteDot} />
              <Text style={styles.onRouteText}>ON ROUTE</Text>
            </BlurView>
          </View>

          {/* GPS Status */}
          <BlurView intensity={80} tint="dark" style={styles.gpsStatus}>
            <MaterialCommunityIcons name="satellite-variant" size={16} color="#fff" />
            <Text style={styles.gpsText}>GPS</Text>
            <View style={styles.signalBars}>
              <View style={[styles.bar, { height: 4 }]} />
              <View style={[styles.bar, { height: 6 }]} />
              <View style={[styles.bar, { height: 9 }]} />
              <View style={[styles.bar, { height: 12 }]} />
            </View>
          </BlurView>
        </View>

        {/* ROUTE INFO CARD */}
        <BlurView intensity={80} tint="dark" style={styles.routeInfoCard}>
          <View style={styles.routeInfoHeader}>
            <View style={styles.routeInfoIconWrap}>
              <MaterialCommunityIcons name="image-filter-hdr" size={20} color="#79d773" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.routeInfoTitle}>Pandavleni</Text>
              <Text style={styles.routeInfoSubTitle}>Ascent Route</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </View>

          <View style={styles.routeInfoStats}>
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={16} color="#79d773" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoVal}>600 m</Text>
                <Text style={styles.infoLabel}>Remaining</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="flag" size={16} color="#a0aec0" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoVal}>90 m</Text>
                <Text style={styles.infoLabel}>Elevation Gain</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoVal}>12 min</Text>
                <Text style={styles.infoLabel}>Est. Time</Text>
              </View>
            </View>
          </View>
        </BlurView>

        {/* RIGHT CONTROLS RAIL */}
        <BlurView intensity={80} tint="dark" style={styles.rightRail}>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="layers" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Text style={styles.rail3DText}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <MaterialCommunityIcons name="image-filter-hdr" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.railItem}>
            <Ionicons name="navigate" size={22} color="#fff" style={{ transform: [{ rotate: '45deg' }] }} />
          </TouchableOpacity>
        </BlurView>

        {/* PHOTO MARKERS (OVERLAYS) */}
        {/* We place these absolutely. To ensure they cover the baked-in pixels fully, we use BlurView behind the image. */}
        
        {/* Top Photo Marker */}
        <View style={[styles.photoMarker, { top: scaleY(270), left: scaleX(210) }]}>
          <BlurView intensity={10} tint="light" style={styles.photoMarkerWrapper}>
            <Image source={require('../../../assets/images/navigate_assets/thumb_mountain.jpg')} style={styles.photoMarkerImg} />
          </BlurView>
          <View style={styles.photoMarkerPointer} />
        </View>

        {/* Middle Photo Marker */}
        <View style={[styles.photoMarker, { top: scaleY(380), right: scaleX(80) }]}>
          <BlurView intensity={10} tint="light" style={styles.photoMarkerWrapper}>
            <Image source={require('../../../assets/images/navigate_assets/thumb_cave.jpg')} style={styles.photoMarkerImg} />
          </BlurView>
          <View style={styles.photoMarkerPointer} />
        </View>

        {/* Bottom Photo Marker */}
        <View style={[styles.photoMarker, { top: scaleY(515), left: scaleX(115) }]}>
          <BlurView intensity={10} tint="light" style={styles.photoMarkerWrapper}>
            <Image source={require('../../../assets/images/navigate_assets/thumb_sunset.jpg')} style={styles.photoMarkerImg} />
          </BlurView>
          <View style={styles.photoMarkerPointer} />
        </View>


        {/* BOTTOM SHEET */}
        <View style={styles.bottomSheetWrapper}>
          <BlurView intensity={90} tint="dark" style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.dragHandle} />
            
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Pandavleni Ascent Route</Text>
                <Text style={styles.sheetSub}>Following GPS track...</Text>
              </View>
              <TouchableOpacity style={styles.upBtn}>
                <Ionicons name="chevron-up" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* 4 Stats Cards Row */}
            <View style={styles.statsRow}>
              {/* Card 1 */}
              <View style={styles.statCard}>
                <Ionicons name="location-sharp" size={16} color="#79d773" />
                <Text style={styles.statVal}>0.6 km</Text>
                <Text style={styles.statLabel}>Distance Left</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '40%', backgroundColor: '#79d773' }]} />
                </View>
              </View>
              
              {/* Card 2 */}
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="image-filter-hdr" size={16} color="#4299e1" />
                <Text style={styles.statVal}>90 m</Text>
                <Text style={styles.statLabel}>Elevation Gain</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '60%', backgroundColor: '#4299e1' }]} />
                </View>
              </View>

              {/* Card 3 */}
              <View style={styles.statCard}>
                <Ionicons name="time-outline" size={16} color="#9f7aea" />
                <Text style={styles.statVal}>12 min</Text>
                <Text style={styles.statLabel}>Est. Time</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '50%', backgroundColor: '#9f7aea' }]} />
                </View>
              </View>

              {/* Card 4 */}
              <View style={styles.statCard}>
                <Ionicons name="footsteps" size={16} color="#ecc94b" />
                <Text style={styles.statVal}>3.2 km/h</Text>
                <Text style={styles.statLabel}>Current Speed</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: '70%', backgroundColor: '#ecc94b' }]} />
                </View>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.sideBtn}>
                <View style={styles.sideBtnIconWrapper}>
                  <Ionicons name="close" size={24} color="#a0aec0" />
                </View>
                <Text style={styles.sideBtnText}>End</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.pauseBtn}>
                <Ionicons name="pause" size={24} color="#fff" />
                <Text style={styles.pauseBtnText}>Pause</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.sideBtn}>
                <View style={styles.sideBtnIconWrapper}>
                  <Ionicons name="camera" size={22} color="#a0aec0" />
                </View>
                <Text style={styles.sideBtnText}>Add Point</Text>
              </TouchableOpacity>
            </View>

          </BlurView>
        </View>

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
  compass: {
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
  onRouteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  onRouteGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    backgroundColor: '#38a169',
    opacity: 0.3,
    shadowColor: '#38a169',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  onRoutePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#48bb78',
    overflow: 'hidden',
  },
  onRouteDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#48bb78',
    marginRight: 8,
  },
  onRouteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gpsStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.3)',
    overflow: 'hidden',
  },
  gpsText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 12,
  },
  bar: {
    width: 3,
    backgroundColor: '#48bb78',
    marginLeft: 2,
    borderRadius: 1,
  },
  routeInfoCard: {
    position: 'absolute',
    top: scaleY(120),
    left: 15,
    width: 170,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.3)',
    overflow: 'hidden',
  },
  routeInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeInfoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  routeInfoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeInfoSubTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeInfoStats: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoTextWrap: {
    marginLeft: 10,
  },
  infoVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  rightRail: {
    position: 'absolute',
    top: scaleY(200),
    right: 15,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 16,
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
  photoMarker: {
    position: 'absolute',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  photoMarkerWrapper: {
    padding: 3,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoMarkerImg: {
    width: 76,
    height: 52,
    borderRadius: 8,
  },
  photoMarkerPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
  },
  bottomSheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  bottomSheet: {
    width: '100%',
    paddingTop: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(5, 15, 30, 0.65)',
    borderTopWidth: 1,
    borderColor: 'rgba(99, 179, 237, 0.25)',
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
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sheetSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  upBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '23.5%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statVal: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  sideBtn: {
    alignItems: 'center',
  },
  sideBtnIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sideBtnText: {
    color: '#a0aec0',
    fontSize: 11,
  },
  pauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38a169',
    height: 60,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#38a169',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  pauseBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  }
});
