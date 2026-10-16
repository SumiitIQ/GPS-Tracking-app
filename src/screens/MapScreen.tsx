import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
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
import { DOMParser } from '@xmldom/xmldom';
import { Buffer } from 'buffer';
import { ARCGIS_API_KEY } from '../constants/supabase';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { generateGPX, TrackPoint } from '../lib/gpx';
import { LOCATION_TASK_NAME } from '../lib/backgroundTask';
import { saveLocalTrack, UserRecordedTrack } from '../lib/userTracks';

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

        // Layer with slight elevation offset so path never clips under 3D mountains
        const trackingLayer = new GraphicsLayer({
          elevationInfo: { mode: "relative-to-ground", offset: 2 }
        });
        map.add(trackingLayer);

        let markerGraphic = null;
        let startMarkerGraphic = null;
        let routeGraphicOuter = null;
        let routeGraphicInner = null;
        let routePaths = [];
        let lastAddedLat = null;
        let lastAddedLng = null;
        
        // ── Smooth Marker Interpolation ──
        let currentPos = null;
        let targetPos = null;
        let animStartTime = 0;
        let animDuration = 400;

        function animateMarker(timestamp) {
          if (!currentPos || !targetPos || !markerGraphic) {
            requestAnimationFrame(animateMarker);
            return;
          }
          
          if (animStartTime === 0) animStartTime = timestamp;
          const elapsed = timestamp - animStartTime;
          let progress = Math.min(elapsed / animDuration, 1);
          
          const lat = currentPos.lat + (targetPos.lat - currentPos.lat) * progress;
          const lng = currentPos.lng + (targetPos.lng - currentPos.lng) * progress;
          
          markerGraphic.geometry = new Point({ longitude: lng, latitude: lat, spatialReference: { wkid: 4326 } });
          
          if (progress < 1) {
            requestAnimationFrame(animateMarker);
          } else {
            currentPos = targetPos;
            animStartTime = 0;
            requestAnimationFrame(animateMarker);
          }
        }
        
        requestAnimationFrame(animateMarker);

        // Calculate distance between two lat/lng in meters
        function distBetween(lat1, lon1, lat2, lon2) {
          var R = 6371000;
          var rad = Math.PI / 180;
          var dLat = (lat2 - lat1) * rad;
          var dLon = (lon2 - lon1) * rad;
          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }

        window.clearTrack = function() {
          routePaths = [];
          lastAddedLat = null;
          lastAddedLng = null;
          if (routeGraphicOuter) { trackingLayer.remove(routeGraphicOuter); routeGraphicOuter = null; }
          if (routeGraphicInner) { trackingLayer.remove(routeGraphicInner); routeGraphicInner = null; }
          if (startMarkerGraphic) { trackingLayer.remove(startMarkerGraphic); startMarkerGraphic = null; }
        };

        window.startTrackingRoute = function(lat, lng) {
          window.clearTrack();
          routePaths = [[lng, lat]];
          lastAddedLat = lat;
          lastAddedLng = lng;
          
          // Place vivid green Start Trailhead pin
          startMarkerGraphic = new Graphic({
            geometry: new Point({ longitude: lng, latitude: lat, spatialReference: { wkid: 4326 } }),
            symbol: new SimpleMarkerSymbol({
              style: "circle",
              color: [34, 197, 94, 1], // Emerald Green
              size: "14px",
              outline: { color: [255, 255, 255, 1], width: 3 }
            })
          });
          trackingLayer.add(startMarkerGraphic);
        };

        // Global function called from React Native
        window.updateLocation = function(lat, lng, heading, follow, isTracking) {
          const point = new Point({ longitude: lng, latitude: lat, spatialReference: { wkid: 4326 } });
          
          if (!markerGraphic) {
            markerGraphic = new Graphic({
              geometry: point,
              symbol: new SimpleMarkerSymbol({
                style: "circle",
                color: [0, 122, 255, 1], // Vivid Royal Electric Blue
                size: "20px",
                outline: { color: [255, 255, 255, 1], width: 3.5 }
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
            var shouldAddPoint = false;
            if (routePaths.length === 0) {
              shouldAddPoint = true;
            } else if (lastAddedLat !== null && lastAddedLng !== null) {
              var d = distBetween(lastAddedLat, lastAddedLng, lat, lng);
              if (d >= 2.0) { // Clean 2 meter filter prevents jitter/knots
                shouldAddPoint = true;
              }
            } else {
              shouldAddPoint = true;
            }

            if (shouldAddPoint) {
              routePaths.push([lng, lat]);
              lastAddedLat = lat;
              lastAddedLng = lng;

              // Ensure start pin exists
              if (!startMarkerGraphic && routePaths.length >= 1) {
                startMarkerGraphic = new Graphic({
                  geometry: new Point({ longitude: routePaths[0][0], latitude: routePaths[0][1], spatialReference: { wkid: 4326 } }),
                  symbol: new SimpleMarkerSymbol({
                    style: "circle",
                    color: [34, 197, 94, 1],
                    size: "14px",
                    outline: { color: [255, 255, 255, 1], width: 3 }
                  })
                });
                trackingLayer.add(startMarkerGraphic);
              }

              // Draw or update the path polyline
              if (routePaths.length >= 2) {
                const newPolyline = new Polyline({
                  paths: [routePaths],
                  spatialReference: { wkid: 4326 }
                });

                if (!routeGraphicInner) {
                  // Outer glowing electric blue halo
                  const outerSymbol = new SimpleLineSymbol({
                    color: [0, 102, 255, 0.45],
                    width: 9,
                    join: "round",
                    cap: "round"
                  });
                  routeGraphicOuter = new Graphic({ geometry: newPolyline, symbol: outerSymbol });
                  
                  // Inner solid electric blue core line
                  const innerSymbol = new SimpleLineSymbol({
                    color: [0, 153, 255, 1],
                    width: 4.5,
                    join: "round",
                    cap: "round"
                  });
                  routeGraphicInner = new Graphic({ geometry: newPolyline, symbol: innerSymbol });
                  
                  trackingLayer.addMany([routeGraphicOuter, routeGraphicInner]); 
                } else {
                  // Assign new Polyline instances to trigger immediate re-draw
                  routeGraphicOuter.geometry = newPolyline;
                  routeGraphicInner.geometry = newPolyline;
                }
              }
            }
          }
          
          if (follow) {
            view.goTo({ target: point, zoom: 19, tilt: 45, heading: heading || 0 }, { duration: 400 });
          }
        };
        
        window.centerMap = function(lat, lng, heading) {
          const point = new Point({ longitude: lng, latitude: lat, spatialReference: { wkid: 4326 } });
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
const MAX_ACCURACY_M = 150;

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
    let isMounted = true;

    (async () => {
      try {
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        if (fgStatus !== 'granted') {
          Alert.alert('GPS Required', 'Please enable Location permission in Settings so Nirdesh can record your trek route.', [{ text: 'OK' }]);
          return;
        }
      } catch (err) {
        console.warn('Foreground permission error:', err);
      }

      // Safe background permission request (never block foreground tracking if denied)
      try {
        await Location.requestBackgroundPermissionsAsync();
      } catch (err) {
        console.warn('Background permission notice:', err);
      }

      // Fetch immediate current location to make Start button ready without delay
      try {
        const quickLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (quickLoc && isMounted) {
          handleLocationUpdate(quickLoc);
        }
      } catch (e) {
        console.warn('Quick position fetch notice:', e);
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
             distAccum += dist;
             lastRecordedPos.current = { lat: pt.lat, lng: pt.lng, ts: pt.timestamp };
             trackPoints.current.push(pt);
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
      try {
        locationSubscription.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
          handleLocationUpdate
        );
      } catch (e) {
        console.warn('watchPositionAsync notice:', e);
      }
    })();

    return () => {
      isMounted = false;
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

    // Accept valid coordinates with reasonable accuracy (up to 150m or null)
    const isValidForTracking = latitude !== 0 && longitude !== 0 && (acc === null || acc <= MAX_ACCURACY_M);

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
        if (dist >= MIN_DISTANCE_TO_RECORD_M) {
          setTotalDistance(prev => prev + dist);
          lastRecordedPos.current = { lat: latitude, lng: longitude, ts: now };
          trackPoints.current.push({ lat: latitude, lng: longitude, timestamp: now, elevation: loc.coords.altitude || 0 });
        }
      } else {
        lastRecordedPos.current = { lat: latitude, lng: longitude, ts: now };
        trackPoints.current.push({ lat: latitude, lng: longitude, timestamp: now, elevation: loc.coords.altitude || 0 });
      }
    }
  }, []);

  // ─── Controls ────────────────────────────────────────────────────────────
  const startTracking = async () => {
    setIsTracking(true);
    setIsPaused(false);
    isTrackingRef.current = true;
    setTotalDistance(0);
    setElapsedSeconds(0);
    lastRecordedPos.current = null;
    trackPoints.current = [];

    // Seed the starting point immediately if we already have a position
    if (currentPos.current) {
      const now = Date.now();
      trackPoints.current.push({
        lat: currentPos.current.lat,
        lng: currentPos.current.lng,
        timestamp: now,
        elevation: 0,
      });
      lastRecordedPos.current = { lat: currentPos.current.lat, lng: currentPos.current.lng, ts: now };
    } else {
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(loc => {
        if (loc && loc.coords) {
          const now = loc.timestamp || Date.now();
          currentPos.current = { lat: loc.coords.latitude, lng: loc.coords.longitude, heading: loc.coords.heading || 0 };
          setGpsReady(true);
          setAccuracy(loc.coords.accuracy ? Math.round(loc.coords.accuracy) : null);
          if (trackPoints.current.length === 0) {
            trackPoints.current.push({
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              timestamp: now,
              elevation: loc.coords.altitude || 0,
            });
            lastRecordedPos.current = { lat: loc.coords.latitude, lng: loc.coords.longitude, ts: now };
          }
          if (webViewRef.current) {
            webViewRef.current.injectJavaScript(`if(window.startTrackingRoute) window.startTrackingRoute(${loc.coords.latitude}, ${loc.coords.longitude}); true;`);
          }
        }
      }).catch(err => console.warn(err));
    }
    
    await AsyncStorage.setItem('is_tracking', 'true');
    await AsyncStorage.setItem('tracking_start_time', Date.now().toString());
    await AsyncStorage.removeItem('bg_locations');
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    
    if (webViewRef.current) {
      const startLat = currentPos.current?.lat;
      const startLng = currentPos.current?.lng;
      if (startLat && startLng) {
        webViewRef.current.injectJavaScript(`if(window.startTrackingRoute) window.startTrackingRoute(${startLat}, ${startLng}); true;`);
      } else {
        webViewRef.current.injectJavaScript('if(window.clearTrack) window.clearTrack(); true;');
      }
    }

    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      } catch (err) {}
    }

    try {
      const bgPerm = await Location.getBackgroundPermissionsAsync();
      if (bgPerm.status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: MIN_DISTANCE_TO_RECORD_M,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Nirdesh Trek Tracker",
            notificationBody: "Tracking your route actively.",
            notificationColor: "#2D7D78",
          }
        });
      }
    } catch (e: any) {
      console.warn('Background tracking notice (foreground GPS remains active):', e);
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
      const bgPerm = await Location.getBackgroundPermissionsAsync();
      if (bgPerm.status === 'granted') {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          timeInterval: 2000,
          distanceInterval: MIN_DISTANCE_TO_RECORD_M,
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Nirdesh Trek Tracker",
            notificationBody: "Tracking your route actively.",
            notificationColor: "#2D7D78",
          }
        });
      }
    } catch (e) {
      console.warn('Failed to resume bg location', e);
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
      console.warn('Failed to stop bg location', e);
    }
  };

  const finishTracking = async () => {
    await stopTracking();
    
    // Ensure we have at least 2 points to generate a valid GPX path
    if (trackPoints.current.length === 1) {
      const p = trackPoints.current[0];
      const pTime = typeof p.timestamp === 'number' ? p.timestamp : Date.now();
      trackPoints.current.push({
        lat: p.lat,
        lng: p.lng,
        timestamp: pTime + 1000,
        elevation: p.elevation || 0,
      });
    } else if (trackPoints.current.length === 0 && currentPos.current) {
      const now = Date.now();
      trackPoints.current.push({
        lat: currentPos.current.lat,
        lng: currentPos.current.lng,
        timestamp: now,
        elevation: 0,
      });
      trackPoints.current.push({
        lat: currentPos.current.lat,
        lng: currentPos.current.lng,
        timestamp: now + 1000,
        elevation: 0,
      });
    }

    if (trackPoints.current.length < 2) {
      Alert.alert('No GPS Location', 'Please ensure GPS is enabled on your device to record a track.');
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
      const trackId = Date.now().toString();
      let publicGpxUrl = gpxData.path; // fallback to local

      // ── Always save a local copy to device storage ──
      const localTrack: UserRecordedTrack = {
        id: trackId,
        title: trailName || 'Recorded Trek',
        distance: totalDistance,
        elevationGain: 0,
        durationSeconds: elapsedSeconds,
        createdAt: new Date().toISOString(),
        gpxUrl: gpxData.path,
        localGpxUri: gpxData.path,
        isPendingSync: !netState.isConnected || !user,
        isPendingApproval: false,
        difficulty,
        source: !netState.isConnected || !user ? 'pending' : 'cloud',
      };
      await saveLocalTrack(localTrack);

      if (!netState.isConnected || !user) {
        // --- OFFLINE / LOCAL SAVE LOGIC ---
        const pendingTrack = {
          id: trackId,
          userId: user?.id || 'local_user',
          title: trailName || 'Recorded Trek',
          gpxData,
          distance: totalDistance,
          elapsedSeconds,
          timestamp: new Date().toISOString()
        };
        const existing = await AsyncStorage.getItem('pending_tracks');
        const tracks = existing ? JSON.parse(existing) : [];
        tracks.push(pendingTrack);
        await AsyncStorage.setItem('pending_tracks', JSON.stringify(tracks));
        Alert.alert('Saved Offline 📡', 'Your track has been safely stored on your phone! It will automatically sync when you reconnect.');
        return;
      }

      // 1. Upload to Supabase Storage (gpx-routes bucket)
      const arrayBuffer = Buffer.from(gpxData.content, 'utf-8').buffer;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gpx-routes')
        .upload(`${user.id}/${gpxData.fileName}`, arrayBuffer, {
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
        Alert.alert('Database Notice', `Saved locally. Cloud sync notice: ${error.message || 'Queued'}`);
      } else {
        // Update local track with cloud URL
        localTrack.gpxUrl = publicGpxUrl;
        localTrack.isPendingSync = false;
        localTrack.source = 'cloud';
        await saveLocalTrack(localTrack);
        Alert.alert('Track Saved 🎉', 'Your track has been successfully saved to your profile and cloud!');
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
            <MaterialIcons name={followMode ? "my-location" : "location-searching"} size={22} color={followMode ? "#fff" : "#9ca3af"} />
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
              style={styles.startBtn}
              onPress={startTracking}
              activeOpacity={0.85}
            >
              <Text style={styles.startBtnText}>
                ▶  Start Recording
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── POST-TRACK METADATA MODAL ─────────────────────────────────────── */}
      <Modal
        visible={isPostTrackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPostTrackModalVisible(false)}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={modalStyles.title}>🏔️ Save Your Trek</Text>
              <Text style={modalStyles.subtitle}>
                Distance: {formatDist(totalDistance)} · Time: {formatTime(elapsedSeconds)}
              </Text>

              <Text style={modalStyles.label}>Trail Name</Text>
              <TextInput
                style={modalStyles.input}
                value={trailName}
                onChangeText={setTrailName}
                placeholder="e.g. Morning Hill Trek"
                placeholderTextColor="#6b7280"
              />

              <Text style={modalStyles.label}>Activity Type</Text>
              <View style={modalStyles.chipRow}>
                {['Trekking', 'Hiking', 'Running', 'Cycling', 'Other'].map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[modalStyles.chip, activityType === t && modalStyles.chipActive]}
                    onPress={() => setActivityType(t)}
                  >
                    <Text style={[modalStyles.chipText, activityType === t && modalStyles.chipTextActive]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={modalStyles.label}>Difficulty</Text>
              <View style={modalStyles.chipRow}>
                {['Easy', 'Moderate', 'Hard', 'Expert'].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[modalStyles.chip, difficulty === d && modalStyles.chipActive]}
                    onPress={() => setDifficulty(d)}
                  >
                    <Text style={[modalStyles.chipText, difficulty === d && modalStyles.chipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={modalStyles.label}>Weather</Text>
              <View style={modalStyles.chipRow}>
                {['Sunny', 'Cloudy', 'Rainy', 'Foggy', 'Snowy', 'Windy'].map(w => (
                  <TouchableOpacity
                    key={w}
                    style={[modalStyles.chip, weather === w && modalStyles.chipActive]}
                    onPress={() => setWeather(w)}
                  >
                    <Text style={[modalStyles.chipText, weather === w && modalStyles.chipTextActive]}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={modalStyles.label}>Notes / Gear</Text>
              <TextInput
                style={[modalStyles.input, { height: 70, textAlignVertical: 'top' }]}
                value={gearNotes}
                onChangeText={setGearNotes}
                placeholder="Any notes about this trek..."
                placeholderTextColor="#6b7280"
                multiline
              />

              <TouchableOpacity style={modalStyles.saveBtn} onPress={saveAndUploadTrack}>
                <Text style={modalStyles.saveBtnText}>💾  Save Track to Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={() => setIsPostTrackModalVisible(false)}
              >
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1a2e',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chipActive: {
    backgroundColor: 'rgba(59,130,246,0.3)',
    borderColor: '#3b82f6',
  },
  chipText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#60a5fa',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  cancelBtnText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  },
});
