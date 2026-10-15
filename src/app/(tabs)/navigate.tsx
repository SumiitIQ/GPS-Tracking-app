import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system/legacy';
import { DOMParser } from '@xmldom/xmldom';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ARCGIS_API_KEY } from '../../constants/supabase';

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6372800;
  const cosPhi =
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lon2) - toRad(lon1)) +
    Math.sin(toRad(lat1)) * Math.sin(toRad(lat2));
  return R * Math.acos(Math.max(-1, Math.min(1, cosPhi)));
}

const getArcGISHtml = (apiKey: string, routeLineJSON: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>ArcGIS Navigate</title>
    <style>
      html, body, #viewDiv { padding: 0; margin: 0; height: 100%; width: 100%; background: #000; overflow: hidden; }
      .esri-ui { display: none !important; }
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
        "esri/symbols/SimpleLineSymbol",
        "esri/symbols/TextSymbol"
      ], function(esriConfig, Map, SceneView, GraphicsLayer, Graphic, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol) {
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

        const routeCoords = ${routeLineJSON};
        
        let markerGraphic = null;
        
                            view.when(() => {
            if (routeCoords && routeCoords.length > 0) {
              const polyline = new Polyline({ paths: [routeCoords] });
              const outerSymbol = new SimpleLineSymbol({ color: [0, 85, 170, 0.9], width: 8, join: "round", cap: "round" });
              const innerSymbol = new SimpleLineSymbol({ color: [59, 130, 246, 1], width: 4, join: "round", cap: "round" });
              const routeGraphicOuter = new Graphic({ geometry: polyline, symbol: outerSymbol });
              const routeGraphicInner = new Graphic({ geometry: polyline, symbol: innerSymbol });
              
              // Start Marker
              const startCoord = routeCoords[0];
              const startPoint = new Point({ longitude: startCoord[0], latitude: startCoord[1] });
              const startMarker = new Graphic({
                geometry: startPoint,
                symbol: {
                  type: "simple-marker", style: "circle",
                  color: [22, 163, 74], outline: { color: [255, 255, 255], width: 2 }, size: 12
                }
              });
              const startText = new Graphic({
                geometry: startPoint,
                symbol: {
                  type: "text", text: " START ", color: "white",
                  haloColor: "black", haloSize: "2px",
                  backgroundColor: "black",
                  font: { size: 10, weight: "bold", family: "sans-serif" },
                  xoffset: 35, yoffset: -4
                }
              });

              // End Marker
              const endCoord = routeCoords[routeCoords.length - 1];
              const endPoint = new Point({ longitude: endCoord[0], latitude: endCoord[1] });
              const endMarker = new Graphic({
                geometry: endPoint,
                symbol: {
                  type: "simple-marker", style: "circle",
                  color: [220, 38, 38], outline: { color: [255, 255, 255], width: 2 }, size: 12
                }
              });
              const endFlag = new Graphic({
                geometry: endPoint,
                symbol: { type: "text", text: "??", font: { size: 12 }, yoffset: 4 }
              });
              const endText = new Graphic({
                geometry: endPoint,
                symbol: {
                  type: "text", text: " END ", color: "white",
                  haloColor: "black", haloSize: "2px",
                  backgroundColor: "black",
                  font: { size: 10, weight: "bold", family: "sans-serif" },
                  xoffset: 30, yoffset: -4
                }
              });

              trackingLayer.addMany([routeGraphicOuter, routeGraphicInner, startMarker, startText, endMarker, endFlag, endText]);
              view.goTo(polyline.extent.expand(1.2));
            }
          });

        let currentPos = null;
        let targetPos = null;
        let animStartTime = 0;
        let animDuration = 1000;

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
          
          markerGraphic.geometry = new Point({ longitude: lng, latitude: lat });
          
          if (progress < 1) {
            requestAnimationFrame(animateMarker);
          } else {
            currentPos = targetPos;
            animStartTime = 0;
            requestAnimationFrame(animateMarker);
          }
        }
        requestAnimationFrame(animateMarker);

        window.updateLocation = function(lat, lng, heading, follow) {
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
          if (follow) {
            view.goTo({ target: point, zoom: 19, tilt: 45, heading: heading || 0 }, { duration: 1000 });
          }
        };
        
        window.centerMap = function(lat, lng, heading) {
          const point = new Point({ longitude: lng, latitude: lat });
          view.goTo({ target: point, zoom: 19, tilt: 45, heading: heading || 0 }, { duration: 500 });
        };
        
        window.toggle3D = function() {
          if (!view || !view.camera) return;
          const currentTilt = view.camera.tilt;
          view.goTo({ tilt: currentTilt > 10 ? 0 : 60 }, { duration: 800 }).catch(function(e){});
        };
        
        window.setBasemap = function(type) {
          if (map) map.basemap = type;
        };

        window.resetNorth = function() {
          view.goTo({ heading: 0 }, { duration: 500 }).catch(function(e){});
        };

        view.watch("camera.heading", function(newHeading) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HEADING_CHANGE', heading: newHeading }));
        });
      });
    </script>
  </body>
</html>
`;

export default function NavigateTab() {
  const { routeUrl, title } = useLocalSearchParams();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [routePoints, setRoutePoints] = useState<{lat: number, lng: number}[]>([]);
  const [gpsReady, setGpsReady] = useState(false);
  const [followMode, setFollowMode] = useState(false);
  const followModeRef = useRef(false);
  const [offRoute, setOffRoute] = useState(false);
  const [heading, setHeading] = useState(0);
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const routePointsRef = useRef(routePoints);
  const latestLocRef = useRef<{lat: number, lng: number, heading: number} | null>(null);

  useEffect(() => {
    if (routeUrl) {
      loadRoute(routeUrl as string);
    }
  }, [routeUrl]);

  useEffect(() => { 
    routePointsRef.current = routePoints; 
  }, [routePoints]);

  const loadRoute = async (url: string) => {
    try {
      let localUri = url;
      if (url.startsWith('http')) {
        const dest = `${FileSystem.cacheDirectory}nav_temp.gpx`;
        const { uri } = await FileSystem.downloadAsync(url, dest);
        localUri = uri;
      }
      
      const xmlStr = await FileSystem.readAsStringAsync(localUri);
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlStr, 'text/xml');
      const trkptNodes = doc.getElementsByTagName('trkpt');
      
      const points = [];
      for (let i = 0; i < trkptNodes.length; i++) {
        const latStr = trkptNodes[i].getAttribute('lat');
        const lonStr = trkptNodes[i].getAttribute('lon');
        if (!latStr || !lonStr) continue;

        const lat = parseFloat(latStr);
        const lon = parseFloat(lonStr);
        // Filter out corrupted points at 0,0
        if (lat === 0 || lon === 0 || isNaN(lat) || isNaN(lon)) continue;
        
        points.push({ lat, lng: lon });
      }
      setRoutePoints(points);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not parse GPX file for navigation.');
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      locationSubscription.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 0 },
        handleLocationUpdate
      );
    })();
    return () => locationSubscription.current?.remove();
  }, []);

  const handleLocationUpdate = useCallback((loc: Location.LocationObject) => {
    const { latitude, longitude, heading } = loc.coords;
    setGpsReady(true);
    latestLocRef.current = { lat: latitude, lng: longitude, heading: heading || 0 };
    
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (window.updateLocation) window.updateLocation(${latitude}, ${longitude}, ${heading || 0}, ${followModeRef.current});
        true;
      `);
    }

    const pts = routePointsRef.current;
    if (pts.length > 0) {
      let minDistance = Infinity;
      for (let i = 0; i < pts.length; i++) {
        const d = getDistanceMeters(latitude, longitude, pts[i].lat, pts[i].lng);
        if (d < minDistance) minDistance = d;
      }
      setOffRoute(minDistance > 30); // 30 meters deviation tolerance
    }
  }, []);

  const routeLineJSON = JSON.stringify(routePoints.map(p => [p.lng, p.lat]));

  const toggleFollow = () => {
    const v = !followMode;
    setFollowMode(v);
    followModeRef.current = v;
    
    if (v && latestLocRef.current && webViewRef.current) {
      const { lat, lng, heading } = latestLocRef.current;
      webViewRef.current.injectJavaScript(`
        if (window.centerMap) window.centerMap(${lat}, ${lng}, ${heading});
        true;
      `);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'HEADING_CHANGE') {
        setHeading(data.heading);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggle3D = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.toggle3D) window.toggle3D(); true;');
    }
  };

  const handleSetBasemap = (type: string) => {
    if (webViewRef.current) {
    webViewRef.current.injectJavaScript(`if(window.setBasemap) window.setBasemap('${type}'); true;`);
    }
    setIsLayerOpen(false);
  };

  const handleResetNorth = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.resetNorth) window.resetNorth(); true;');
    }
  };

  if (!routeUrl) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Route Selected</Text>
        <Text style={styles.emptySub}>Go to the Explore tab to find a route to navigate.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <WebView
        ref={webViewRef}
        source={{ html: getArcGISHtml(ARCGIS_API_KEY, routeLineJSON) }}
        style={{ flex: 1, backgroundColor: '#000' }}
        scrollEnabled={false}
        bounces={false}
        onMessage={handleMessage}
        onTouchStart={() => {
          if (followMode) {
            setFollowMode(false);
            followModeRef.current = false;
          }
        }}
      />

      {/* Top HUD */}
      <View style={styles.topHud}>
        <View style={[styles.statusPill, offRoute ? styles.statusOff : styles.statusOn]}>
          <Text style={styles.statusText}>
            {offRoute ? '⚠️ OFF ROUTE' : '✅ ON ROUTE'}
          </Text>
        </View>
      </View>

      {/* ── RIGHT ACTION BUTTONS ── */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.compassBtn} onPress={handleResetNorth}>
          <View style={[styles.compassInner, { transform: [{ rotate: `${-heading}deg` }] }]}>
            <View style={styles.compassNeedleRed} />
            <View style={styles.compassNeedleWhite} />
          </View>
        </TouchableOpacity>
        
        <View style={styles.actionStack}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsLayerOpen(!isLayerOpen)}>
            <Ionicons name="layers" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleToggle3D}>
            <Text style={styles.text3d}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={toggleFollow}>
            <MaterialCommunityIcons name={followMode ? "crosshairs-gps" : "crosshairs"} size={24} color={followMode ? "#10b981" : "#3b82f6"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── LAYER MODAL ── */}
      {isLayerOpen && (
        <View style={styles.layerModal}>
          <Text style={styles.layerTitle}>MAP TYPE</Text>
          <TouchableOpacity style={styles.layerOption} onPress={() => handleSetBasemap('satellite')}>
            <Text style={styles.layerOptionText}>Satellite</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerOption} onPress={() => handleSetBasemap('topo-vector')}>
            <Text style={styles.layerOptionText}>Topographic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.layerOption} onPress={() => handleSetBasemap('osm')}>
            <Text style={styles.layerOptionText}>Street</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.bottomHud}>
        <View style={styles.titleCard}>
          <Text style={styles.titleText}>{title || 'Navigating Route'}</Text>
          <Text style={styles.titleSub}>Following GPS track...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  emptyContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  emptySub: { color: '#9ca3af', textAlign: 'center', marginTop: 10 },
  
  topHud: { position: 'absolute', top: Platform.OS === 'android' ? 40 : 60, left: 0, right: 0, alignItems: 'center' },
  statusPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, borderWidth: 2, backgroundColor: 'rgba(0,0,0,0.8)' },
  statusOn: { borderColor: '#10b981' },
  statusOff: { borderColor: '#ef4444' },
  statusText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  
  bottomHud: { position: 'absolute', bottom: Platform.OS === 'android' ? 85 : 125, left: 20, right: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  titleCard: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginRight: 10 },
  titleText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  titleSub: { color: '#9ca3af', fontSize: 12, marginTop: 4, fontWeight: '600' },

  hudBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.8)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  // ── Right Actions
  rightActions: {
    position: 'absolute', right: 12, top: 220,
    alignItems: 'center', zIndex: 5,
  },
  compassBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1e1e1e', borderWidth: 2, borderColor: '#000',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, elevation: 5,
  },
  compassInner: {
    width: 24, height: 24,
  },
  compassNeedleRed: {
    position: 'absolute', top: 0, left: 10, width: 4, height: 12,
    backgroundColor: '#ef4444', borderTopLeftRadius: 4, borderTopRightRadius: 4,
  },
  compassNeedleWhite: {
    position: 'absolute', bottom: 0, left: 10, width: 4, height: 12,
    backgroundColor: '#fff', borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  actionStack: {
    backgroundColor: 'rgba(22, 25, 34, 0.85)',
    borderRadius: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  actionBtn: {
    width: 48, height: 48,
    alignItems: 'center', justifyContent: 'center',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  text3d: { color: '#3b82f6', fontWeight: '800', fontSize: 16 },

  // ── Layer Modal
  layerModal: {
    position: 'absolute', right: 70, top: 220,
    backgroundColor: '#1b202d',
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 20,
  },
  layerTitle: { color: '#9ca3af', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  layerOption: { paddingVertical: 8 },
  layerOptionText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  hudBtnIcon: { fontSize: 24 },
});
