import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Alert,
  Share,
  DeviceEventEmitter,
  PermissionsAndroid,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ARCGIS_API_KEY } from '../constants/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateGPX, TrackPoint } from '../lib/gpx';
import { LOCATION_TASK_NAME } from '../lib/backgroundTask';

// ─── ArcGIS WebView Template ─────────────────────────────────────────────────
const getArcGISHtml = (apiKey: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>ArcGIS Map</title>
    <style>
      html, body, #viewDiv { padding: 0; margin: 0; height: 100%; width: 100%; background: #000; overflow: hidden; }
      .esri-ui { display: none !important; } /* Hide all default UI */
    </style>
    <link rel="stylesheet" href="https://js.arcgis.com/4.30/esri/themes/dark/main.css" />
    <script src="https://js.arcgis.com/4.30/"></script>
  </head>
  <body>
    <div id="viewDiv"></div>
    <script>
      require([
        "esri/config",
        "esri/Map",
        "esri/views/SceneView",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol"
      ], function(esriConfig, Map, SceneView, GraphicsLayer, Graphic, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol) {
        esriConfig.apiKey = "${apiKey}";
        
        const map = new Map({ basemap: "satellite", ground: "world-elevation" });
        const view = new SceneView({
          container: "viewDiv",
          map: map,
          camera: { position: { x: 78.9629, y: 20.5937, z: 15000000 }, tilt: 0 },
          environment: { starsEnabled: true, atmosphereEnabled: true },
          ui: { components: [] }
        });

        const trackingLayer = new GraphicsLayer({
          elevationInfo: { mode: "on-the-ground" }
        });
        map.add(trackingLayer);

        let markerGraphic = null;
        let routeGraphicOuter = null;
        let routeGraphicInner = null;
        let routePaths = [];
        
        // ── Smooth Interpolation Logic ──
        let currentPos = null;
        let targetPos = null;
        let animStartTime = 0;
        let animDuration = 500;

        function animateMarker(timestamp) {
          if (!currentPos || !targetPos || !markerGraphic) {
            requestAnimationFrame(animateMarker);
            return;
          }
          
          if (animStartTime === 0) animStartTime = timestamp;
          const elapsed = timestamp - animStartTime;
          let progress = Math.min(elapsed / animDuration, 1);
          
          // Linear interpolation for constant smooth gliding
          const lat = currentPos.lat + (targetPos.lat - currentPos.lat) * progress;
          const lng = currentPos.lng + (targetPos.lng - currentPos.lng) * progress;
          
          markerGraphic.geometry = new Point({ longitude: lng, latitude: lat });
          
          if (progress < 1) {
            requestAnimationFrame(animateMarker);
          } else {
            currentPos = targetPos;
            animStartTime = 0; // Wait for next update
            requestAnimationFrame(animateMarker);
          }
        }
        
        requestAnimationFrame(animateMarker);

        window.clearTrack = function() {
          routePaths = [];
          if (routeGraphicOuter) { trackingLayer.remove(routeGraphicOuter); routeGraphicOuter = null; }
          if (routeGraphicInner) { trackingLayer.remove(routeGraphicInner); routeGraphicInner = null; }
        };

        // Global function callable from React Native
        window.updateLocation = function(lat, lng, heading, follow, isTracking) {
          const point = new Point({ longitude: lng, latitude: lat });
          
          if (!markerGraphic) {
            markerGraphic = new Graphic({
              geometry: point,
              symbol: new SimpleMarkerSymbol({
                style: "circle", color: [59, 130, 246, 1], size: "18px",
                outline: { color: [255, 255, 255, 1], width: 3 }
              })
            });
            trackingLayer.add(markerGraphic);
            currentPos = { lat, lng };
            targetPos = { lat, lng };
          } else {
            currentPos = { lat: markerGraphic.geometry.latitude, lng: markerGraphic.geometry.longitude };
            targetPos = { lat, lng };
            animStartTime = 0;
          }

          if (isTracking) {
            routePaths.push([lng, lat]);
            if (!routeGraphicInner) {
              const polyline = new Polyline({ paths: [routePaths] });
              
              const outerSymbol = new SimpleLineSymbol({ color: [0, 85, 170, 0.9], width: 8, join: "round", cap: "round" });
              routeGraphicOuter = new Graphic({ geometry: polyline, symbol: outerSymbol });
              
              const innerSymbol = new SimpleLineSymbol({ color: [59, 130, 246, 1], width: 4, join: "round", cap: "round" });
              routeGraphicInner = new Graphic({ geometry: polyline, symbol: innerSymbol });
              
              trackingLayer.addMany([routeGraphicOuter, routeGraphicInner]); 
            } else {
              const geom = routeGraphicInner.geometry.clone();
              geom.paths[0] = routePaths;
              routeGraphicOuter.geometry = geom;
              routeGraphicInner.geometry = geom;
            }
          }
          
          if (follow) {
            view.goTo({ target: point, zoom: 19, tilt: 45, heading: heading || 0 }, { duration: 500 });
          }
        };
        
        window.centerMap = function(lat, lng, heading) {
          const point = new Point({ longitude: lng, latitude: lat });
          view.goTo({ target: point, zoom: 19, tilt: 45, heading: heading || 0 }, { duration: 500 });
        };
      });
    </script>
  </body>
</html>
`;

// ─── Exact Distance (Spherical Law of Cosines) ───────────────────────────────
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6372800;
  const cosPhi =
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2) - toRad(lon1)) +
    Math.sin(toRad(lat1)) * Math.sin(toRad(lat2));
  return R * Math.acos(Math.max(-1, Math.min(1, cosPhi)));
}

const MIN_DISTANCE_TO_RECORD_M = 2;
const MAX_ACCURACY_M = 50;

export default function MapScreen() {
  const { user, signOut } = useAuth();
  const webViewRef = useRef<WebView>(null);

  // ── GPS State ────────────────────────────────────────────────────────────
  const [gpsReady, setGpsReady] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [speed, setSpeed] = useState(0);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const lastRecordedPos = useRef<{lat: number, lng: number, ts?: number} | null>(null);
  const currentPos = useRef<{ lat: number; lng: number, heading: number } | null>(null);
  const trackPoints = useRef<TrackPoint[]>([]);

  // ── Follow Mode ───────────────────────────────────────────────────────────
  const [followMode, setFollowMode] = useState(true);
  const followModeRef = useRef(true);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [totalDistance, setTotalDistance] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const isTrackingRef = useRef(false);

  // ── Post-Tracking Form State ──────────────────────────────────────────────
  const [isPostTrackModalVisible, setIsPostTrackModalVisible] = useState(false);
  const [trailName, setTrailName] = useState('My Expedition');
  const [activityType, setActivityType] = useState('Trekking');
  const [difficulty, setDifficulty] = useState('Moderate');
  const [weather, setWeather] = useState('Sunny');
  const [gearNotes, setGearNotes] = useState('');

  // ─── Request Permissions & Start Watching ──────────────────────────────────
  useEffect(() => {
    let bgListener: any;

    (async () => {
      const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
      const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (fgStatus !== 'granted') {
        Alert.alert('GPS Required', 'PrecisionTrack needs GPS access to track you.', [{ text: 'OK' }]);
        return;
      }

      // ── RESTORE STATE IF KILLED ──
      const trackingStr = await AsyncStorage.getItem('is_tracking');
      if (trackingStr === 'true') {
        setIsTracking(true);
        isTrackingRef.current = true;
        
        const startTimeStr = await AsyncStorage.getItem('tracking_start_time');
        if (startTimeStr) {
          const startTime = parseInt(startTimeStr, 10);
          setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          timerRef.current = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
        }

        const ptsStr = await AsyncStorage.getItem('bg_locations');
        if (ptsStr) {
          const pts = JSON.parse(ptsStr);
          trackPoints.current = pts;
          
          let dist = 0;
          for(let i=1; i<pts.length; i++) {
             dist += getDistanceMeters(pts[i-1].lat, pts[i-1].lng, pts[i].lat, pts[i].lng);
          }
          setTotalDistance(dist);
          
          if (pts.length > 0) {
            lastRecordedPos.current = { lat: pts[pts.length-1].lat, lng: pts[pts.length-1].lng, ts: pts[pts.length-1].timestamp };
          }
        }
      }

      // ── LISTEN FOR BACKGROUND POINTS ──
      bgListener = DeviceEventEmitter.addListener('onBackgroundLocation', (newPoints: any[]) => {
        if (!isTrackingRef.current) return;
        
        let distAccum = 0;
        newPoints.forEach(pt => {
           if (lastRecordedPos.current) {
             const dist = getDistanceMeters(lastRecordedPos.current.lat, lastRecordedPos.current.lng, pt.lat, pt.lng);
             if (dist >= MIN_DISTANCE_TO_RECORD_M) {
               distAccum += dist;
               lastRecordedPos.current = { lat: pt.lat, lng: pt.lng, ts: pt.timestamp };
               trackPoints.current.push(pt);
             }
           } else {
             lastRecordedPos.current = { lat: pt.lat, lng: pt.lng, ts: pt.timestamp };
             trackPoints.current.push(pt);
           }
        });
        
        if (distAccum > 0) {
          setTotalDistance(prev => prev + distAccum);
        }
      });

      // Always watch foreground for immediate blue dot & accuracy updates
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
        handleLocationUpdate
      );
    })();

    return () => {
      locationSubscription.current?.remove();
      if (bgListener) bgListener.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ─── Core GPS Handler ─────────────────────────────────────────────────────
  const handleLocationUpdate = useCallback((loc: Location.LocationObject) => {
    const { latitude, longitude, accuracy: acc, speed: spd, heading } = loc.coords;

    // Always update UI state so user sees current signal strength
    setAccuracy(acc ? Math.round(acc) : null);
    setGpsReady(true);
    setSpeed(spd && spd > 0 ? spd * 3.6 : 0); // m/s → km/h

    currentPos.current = { lat: latitude, lng: longitude, heading: heading || 0 };

    // Only add to track if accuracy is good enough
    const isValidForTracking = acc !== null && acc <= MAX_ACCURACY_M;

    // ── Inject Location into ArcGIS WebView ─────────────────────────────────
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateLocation) {
          window.updateLocation(${latitude}, ${longitude}, ${heading || 0}, ${followModeRef.current}, ${isTrackingRef.current && isValidForTracking});
        }
        true;
      `);
    }

    // ── Save High-Frequency Points to GPX Track ─────────────────────────────
    if (isTrackingRef.current && isValidForTracking) {
      const now = loc.timestamp || Date.now();
      if (lastRecordedPos.current) {
        const dist = getDistanceMeters(lastRecordedPos.current.lat, lastRecordedPos.current.lng, latitude, longitude);
        // Only record if moved at least 1 meter (avoids extreme bloat, keeps curves smooth)
        if (dist >= 1) {
          setTotalDistance(prev => prev + dist);
          lastRecordedPos.current = { lat: latitude, lng: longitude, ts: now };
          trackPoints.current.push({ lat: latitude, lng: longitude, timestamp: now, elevation: loc.coords.altitude || 0 });
        }
      } else {
        lastRecordedPos.current = { lat: latitude, lng: longitude, ts: now };
        trackPoints.current.push({ lat: latitude, lng: longitude, timestamp: now, elevation: loc.coords.altitude || 0 });
      }
    }
  }, [isTracking]);

  // ─── Controls ────────────────────────────────────────────────────────────
  const startTracking = async () => {
    setIsTracking(true);
    setIsPaused(false);
    isTrackingRef.current = true;
    setTotalDistance(0);
    setElapsedSeconds(0);
    lastRecordedPos.current = null;
    trackPoints.current = [];
    
    await AsyncStorage.setItem('is_tracking', 'true');
    await AsyncStorage.removeItem('bg_locations');
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.clearTrack) window.clearTrack(); true;');
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Notifications Disabled", "You won't see the background tracking notification because permission was denied.");
        }
      } catch (err) {}
    }

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: MIN_DISTANCE_TO_RECORD_M,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "SummitIQ",
          notificationBody: "Tracking active. Tap to open app.",
          notificationColor: "#fc4c02",
        }
      });
    } catch (e: any) {
      console.error('Failed to start bg location', e);
      Alert.alert('Tracking Error', 'Could not start background tracking: ' + (e.message || String(e)));
    }
  };

  const pauseTracking = async () => {
    setIsPaused(true);
    isTrackingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (e) {
      console.error('Failed to pause bg location', e);
    }
  };

  const resumeTracking = async () => {
    setIsPaused(false);
    isTrackingRef.current = true;
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    
    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: MIN_DISTANCE_TO_RECORD_M,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "SummitIQ",
          notificationBody: "Tracking active. Tap to open app.",
          notificationColor: "#fc4c02",
        }
      });
    } catch (e) {
      console.error('Failed to resume bg location', e);
    }
  };

  const stopTracking = async () => {
    setIsTracking(false);
    setIsPaused(false);
    isTrackingRef.current = false;
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    
    await AsyncStorage.setItem('is_tracking', 'false');
    
    try {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }
    } catch (e) {
      console.error('Failed to stop bg location', e);
    }
  };

  const finishTracking = async () => {
    stopTracking();
    if (trackPoints.current.length < 2) {
      Alert.alert('Not enough data', 'You need to move around to record a track.');
      return;
    }
    // Open the metadata form modal
    setIsPostTrackModalVisible(true);
  };

  const saveAndUploadTrack = async () => {
    setIsPostTrackModalVisible(false);

    try {
      const descStr = `Distance: ${formatDist(totalDistance)}, Time: ${formatTime(elapsedSeconds)}\nActivity: ${activityType}\nDifficulty: ${difficulty}\nWeather: ${weather}\nNotes: ${gearNotes}`;
      
      const gpxData = await generateGPX(trackPoints.current, {
        name: trailName,
        desc: descStr
      });

      const netState = await NetInfo.fetch();
      
      if (!netState.isConnected) {
        // --- OFFLINE SAVE LOGIC ---
        if (user) {
          const pendingTrack = {
            id: Date.now().toString(),
            userId: user.id,
            gpxData,
            distance: totalDistance,
            elapsedSeconds,
            timestamp: new Date().toISOString()
          };
          const existing = await AsyncStorage.getItem('pending_tracks');
          const tracks = existing ? JSON.parse(existing) : [];
          tracks.push(pendingTrack);
          await AsyncStorage.setItem('pending_tracks', JSON.stringify(tracks));
          Alert.alert('Saved Offline 📡', 'Your track has been safely stored on your phone. It will automatically upload to your profile when you reconnect to the internet.');
        } else {
          Alert.alert('Error', 'You must be logged in to save tracks.');
        }
        return; // Stop here, don't share until uploaded
      }

      let publicGpxUrl = gpxData.path; // fallback to local

      if (user) {
        // 1. Upload to Supabase Storage (gpx-routes bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gpx-routes')
          .upload(`${user.id}/${gpxData.fileName}`, gpxData.content, {
            contentType: 'application/gpx+xml',
            upsert: true
          });

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('gpx-routes')
            .getPublicUrl(`${user.id}/${gpxData.fileName}`);
          
          publicGpxUrl = publicUrlData.publicUrl;
        } else {
          console.error('GPX Upload Error:', uploadError);
        }

        // 2. Save to database
        const { error } = await supabase.from('routes').insert({
          title: trailName,
          gpx_url: publicGpxUrl, // Real cloud URL
          distance: totalDistance,
          elevation_gain: 0,
          submitter_id: user.id,
        });
        if (error) {
          console.error('DB Insert Error:', error);
          Alert.alert('Database Error', `Could not save to cloud. Error: ${error.message || 'Unknown error'}. Please make sure you ran the SQL command!`);
        } else {
          Alert.alert('Track Saved', 'Your track has been successfully saved to the cloud!');
        }
      }

      // Show native share dialog with PUBLIC LINK
      await Share.share({
        message: `I just completed a trek!\nDistance: ${formatDist(totalDistance)}\nTime: ${formatTime(elapsedSeconds)}\n\nDownload my GPX Route here:\n${publicGpxUrl}`,
        title: 'Share your GPX Track'
      });

    } catch (err: any) {
      console.error(err);
      Alert.alert('System Error', `Crash details: ${err.message || String(err)}`);
    }
  };

  const toggleFollow = () => {
    const v = !followMode;
    setFollowMode(v);
    followModeRef.current = v;
    
    // Immediately re-center if toggling on
    if (v && currentPos.current && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.centerMap) {
          window.centerMap(${currentPos.current.lat}, ${currentPos.current.lng}, ${currentPos.current.heading});
        }
        true;
      `);
    }
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };
  const formatDist = (m: number) => m >= 1000 ? `${(m/1000).toFixed(2)} km` : `${Math.round(m)} m`;
  const formatPace = (m: number, s: number) => {
    if (m < 10 || s < 1) return '--:--';
    const pps = (s / m) * 1000, pm = Math.floor(pps / 60), ps = Math.round(pps % 60);
    return `${pm}:${String(ps).padStart(2,'0')}`;
  };
  const gpsColor = !gpsReady ? '#6b7280' : accuracy && accuracy <= 10 ? '#22c55e' : accuracy && accuracy <= 25 ? '#f59e0b' : '#ef4444';

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── ArcGIS 3D WebView ─────────────────────────────────────────────── */}
      <View style={styles.map}>
        {/* Transparent overlay to allow dragging map but intercepting touches for follow mode off */}
        <WebView
          ref={webViewRef}
          source={{ html: getArcGISHtml(ARCGIS_API_KEY) }}
          style={{ flex: 1, backgroundColor: '#000' }}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          onTouchStart={() => {
            if (followMode) {
              setFollowMode(false);
              followModeRef.current = false;
            }
          }}
        />
      </View>

      {/* ── TOP HUD ──────────────────────────────────────────────────────── */}
      <View style={styles.topHud} pointerEvents="box-none">
        {/* GPS chip */}
        <View style={styles.gpsChip}>
          <View style={[styles.gpsDot, { backgroundColor: gpsColor }]} />
          <Text style={styles.gpsText}>
            {!gpsReady ? 'ArcGIS · Acquiring GPS…' : `ArcGIS 3D · ±${accuracy}m`}
          </Text>
        </View>
        {/* Follow toggle */}
        <TouchableOpacity
          style={[styles.hudBtn, followMode && styles.hudBtnActive]}
          onPress={toggleFollow}
        >
          <Text style={styles.hudBtnIcon}>{followMode ? '🎯' : '🗺️'}</Text>
        </TouchableOpacity>
        {/* Sign out */}
        <TouchableOpacity style={styles.hudBtn} onPress={signOut}>
          <Text style={styles.hudBtnIcon}>⎋</Text>
        </TouchableOpacity>
      </View>

      {/* ── BOTTOM PANEL (Strava style) ───────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        {/* ── SPEED BADGE ──────────────────────────────────────────────────── */}
        {gpsReady && (
          <View style={styles.speedBadge} pointerEvents="none">
            <Text style={styles.speedVal}>{speed.toFixed(1)}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        )}

        {/* Status Bar */}
        <View style={[styles.statusBar, isTracking && styles.statusBarActive]}>
          <Text style={styles.statusText}>
            {isTracking ? (isPaused ? '⏸  Paused' : '🔴  Recording') : '⬛  Stopped'}
          </Text>
          <TouchableOpacity>
            <Text style={styles.expandIcon}>↗</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatTime(elapsedSeconds)}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={[styles.statBox, { alignItems: 'center' }]}>
            <Text style={styles.statValue}>{formatPace(totalDistance, elapsedSeconds)}</Text>
            <Text style={styles.statLabel}>Avg pace (/km)</Text>
          </View>
          <View style={[styles.statBox, { alignItems: 'flex-end' }]}>
            <Text style={styles.statValue}>{formatDist(totalDistance)}</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.controlRow}>
          {isTracking ? (
            <>
              {isPaused ? (
                <TouchableOpacity style={styles.resumeBtn} onPress={resumeTracking}>
                  <Text style={styles.resumeBtnText}>▶  Resume</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.resumeBtn} onPress={pauseTracking}>
                  <Text style={styles.resumeBtnText}>⏸  Pause</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.finishBtn} onPress={finishTracking}>
                <View style={styles.finishIcon} />
                <Text style={styles.finishBtnText}>Finish</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.startBtn, !gpsReady && styles.startBtnDisabled]}
              onPress={startTracking}
              disabled={!gpsReady}
            >
              <Text style={styles.startBtnText}>
                ▶  {gpsReady ? 'Start' : 'Waiting for GPS…'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },

  // ── Top HUD
  topHud: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    zIndex: 10,
  },
  gpsChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 9,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  gpsDot: { width: 8, height: 8, borderRadius: 4 },
  gpsText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  hudBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  hudBtnActive: {
    backgroundColor: 'rgba(59,130,246,0.5)',
    borderColor: '#3b82f6',
  },
  hudBtnIcon: { fontSize: 20 },

  // ── Speed badge
  speedBadge: {
    position: 'absolute',
    right: 16,
    top: -70,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    zIndex: 10,
  },
  speedVal: { color: '#60a5fa', fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  speedUnit: { color: '#6b7280', fontSize: 10, fontWeight: '600', marginTop: 2 },

  // ── Bottom Panel
  bottomPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#0e0e0e',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    paddingBottom: Platform.OS === 'android' ? 85 : 121,
    zIndex: 10,
  },
  statusBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: 24, paddingVertical: 16,
    marginBottom: 4,
  },
  statusBarActive: {
    backgroundColor: '#1a0a0a',
  },
  statusText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  expandIcon: { color: '#6b7280', fontSize: 18 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  statBox: { flex: 1, alignItems: 'flex-start' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  statLabel: { color: '#6b7280', fontSize: 11, marginTop: 2, letterSpacing: 0.3 },
  controlRow: {
    flexDirection: 'row', paddingHorizontal: 16, paddingTop: 14, gap: 10,
  },
  startBtn: {
    flex: 1, backgroundColor: '#22c55e',
    borderRadius: 50, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  startBtnDisabled: { backgroundColor: '#374151', shadowOpacity: 0 },
  startBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  resumeBtn: {
    flex: 1, backgroundColor: '#f97316',
    borderRadius: 50, paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  resumeBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  finishBtn: {
    flex: 1, backgroundColor: '#1c1c1e',
    borderRadius: 50, paddingVertical: 18,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
    borderWidth: 1.5, borderColor: '#374151',
  },
  finishIcon: {
    width: 16, height: 16,
    backgroundColor: '#fff', borderRadius: 3,
  },
  finishBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
