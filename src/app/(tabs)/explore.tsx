import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, StatusBar, ActivityIndicator, 
  Platform, TextInput, TouchableOpacity, ScrollView, Switch
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { DOMParser } from '@xmldom/xmldom';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { ARCGIS_API_KEY } from '../../constants/supabase';

// ─── ArcGIS WebView Template ─────────────────────────────────────────────────
const getExploreMapHtml = (apiKey: string, treks: any[]) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no" />
    <title>ArcGIS Map</title>
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
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol",
        "esri/geometry/Polyline",
        "esri/symbols/SimpleLineSymbol"
      ], function(esriConfig, Map, SceneView, GraphicsLayer, Graphic, Point, SimpleMarkerSymbol, TextSymbol, Polyline, SimpleLineSymbol) {
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

        const treks = ${JSON.stringify(treks)};
        
        treks.forEach(trek => {
          if (!trek.lat || !trek.lng) return;
          const point = new Point({ longitude: trek.lng, latitude: trek.lat });
          
          // Outer orange ring
          const outerGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: "circle", color: [249, 115, 22, 0.2], size: "24px",
              outline: { color: [255, 255, 255, 0], width: 0 }
            })
          });
          
          // Inner orange dot with white border
          const innerGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: "circle", color: [249, 115, 22, 1], size: "12px",
              outline: { color: [255, 255, 255, 1], width: 2 }
            }),
            attributes: trek
          });
          
          // Label
          const textGraphic = new Graphic({
            geometry: point,
            symbol: new TextSymbol({
              color: "white",
              haloColor: "rgba(0,0,0,0.8)",
              haloSize: "1.5px",
              text: trek.name,
              yoffset: 18,
              font: { size: 11, weight: "bold", family: "sans-serif" }
            })
          });

          trackingLayer.addMany([outerGraphic, innerGraphic, textGraphic]);
        });
        
        view.on("click", function(event) {
          view.hitTest(event).then(function(response) {
            if (response.results.length) {
              var graphic = response.results.filter(function (result) {
                return result.graphic.layer === trackingLayer && result.graphic.attributes;
              })[0];
              if (graphic) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', id: graphic.graphic.attributes.id }));
              }
            }
          });
        });

        window.toggle3D = function() {
          if (!view || !view.camera) return;
          const currentTilt = view.camera.tilt;
          view.goTo({ tilt: currentTilt > 10 ? 0 : 60 }, { duration: 800 }).catch(function(e){});
        };
        
        window.setBasemap = function(type) {
          if (map) map.basemap = type;
        };

        let gpxGraphicOuter = null;
        let gpxGraphicInner = null;
        window.drawGPX = function(pathCoordinates) {
          if (gpxGraphicOuter) trackingLayer.remove(gpxGraphicOuter);
          if (gpxGraphicInner) trackingLayer.remove(gpxGraphicInner);
          
          const polyline = new Polyline({
            paths: [pathCoordinates]
          });
          
          const outerSymbol = new SimpleLineSymbol({ color: [0, 85, 170, 0.9], width: 8, join: "round", cap: "round" });
          const innerSymbol = new SimpleLineSymbol({ color: [59, 130, 246, 1], width: 4, join: "round", cap: "round" });
          
          gpxGraphicOuter = new Graphic({ geometry: polyline, symbol: outerSymbol });
          gpxGraphicInner = new Graphic({ geometry: polyline, symbol: innerSymbol });
          
          trackingLayer.addMany([gpxGraphicOuter, gpxGraphicInner]);
          view.goTo({ target: polyline, zoom: 13 }, { duration: 1500 }).catch(function(e){});
        };

        window.clearGPX = function() {
          if (gpxGraphicOuter) trackingLayer.remove(gpxGraphicOuter);
          if (gpxGraphicInner) trackingLayer.remove(gpxGraphicInner);
          gpxGraphicOuter = null;
          gpxGraphicInner = null;
        };

        window.resetNorth = function() {
          view.goTo({ heading: 0 }, { duration: 500 }).catch(function(e){});
        };

        // Watch camera heading to sync compass
        view.watch("camera.heading", function(newHeading) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HEADING_CHANGE', heading: newHeading }));
        });

        window.centerOn = function(lat, lng) {
          view.goTo({
            target: new Point({ longitude: lng, latitude: lat }),
            zoom: 16
          }, { duration: 800 });
        };
      });
    </script>
  </body>
</html>
`;

export default function ExploreTab() {
  const [treks, setTreks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLayerOpen, setIsLayerOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [heading, setHeading] = useState(0);
  const [hasImportedRoute, setHasImportedRoute] = useState(false);
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('treks_with_coords')
      .select('id, name, region, description, lat, lng');
    
    if (!error && data) {
      setTreks(data);
    }
    setLoading(false);
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MARKER_CLICK') {
        router.push(`/trek/${data.id}`);
      } else if (data.type === 'HEADING_CHANGE') {
        setHeading(data.heading);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLocateMe = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { setLocating(false); return; }
      
      let loc = await Location.getLastKnownPositionAsync();
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      }
      
      if (webViewRef.current && loc) {
        webViewRef.current.injectJavaScript(`if(window.centerOn) window.centerOn(${loc.coords.latitude}, ${loc.coords.longitude}); true;`);
      }
    } catch (e) {
      console.log('Location error:', e);
    }
    setLocating(false);
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

  const handleImportGPX = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const fileUri = result.assets[0].uri;
      const fileStr = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(fileStr, 'text/xml');
      const trkpts = doc.getElementsByTagName('trkpt');
      
      if (!trkpts || trkpts.length === 0) {
        alert("No route points found in the GPX file.");
        return;
      }
      
      const path: number[][] = [];
      for (let i = 0; i < trkpts.length; i++) {
        const pt = trkpts[i];
        const lat = parseFloat(pt.getAttribute('lat') || '0');
        const lon = parseFloat(pt.getAttribute('lon') || '0');
        if (lat && lon) {
          path.push([lon, lat]);
        }
      }
      
      if (path.length > 0 && webViewRef.current) {
        webViewRef.current.injectJavaScript(`if(window.drawGPX) window.drawGPX(${JSON.stringify(path)}); true;`);
        setHasImportedRoute(true);
      }
    } catch (e: any) {
      console.log('Error importing GPX:', e);
      alert("Error: " + (e.message || "Could not read file"));
    }
  };

  const handleClearGPX = () => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('if(window.clearGPX) window.clearGPX(); true;');
      setHasImportedRoute(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* ── MAP BACKGROUND ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#0ea5e9" size="large" />
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ html: getExploreMapHtml(ARCGIS_API_KEY, treks) }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleMessage}
        />
      )}

      {/* ── TOP HEADER PANEL ── */}
      <View style={styles.topHeader}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9ca3af" style={{marginLeft: 4}} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search treks, places..."
            placeholderTextColor="#6b7280"
          />
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterIconBtn}>
            <Ionicons name="options-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.discoverBtn}>
          <Text style={styles.discoverText}>DISCOVER EPIC ADVENTURES (244)</Text>
          <Ionicons name="chevron-down" size={16} color="#3b82f6" />
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.actionBtn} onPress={handleLocateMe}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]}>
            <Ionicons name="navigate-sharp" size={22} color="#3b82f6" />
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

      {/* ── BOTTOM LEFT: IMPORT GPX ── */}
      {hasImportedRoute ? (
        <TouchableOpacity style={[styles.importCard, {backgroundColor: 'rgba(239, 68, 68, 0.9)'}]} onPress={handleClearGPX}>
          <View style={[styles.importIconBox, {backgroundColor: 'rgba(255,255,255,0.2)'}]}>
            <Ionicons name="close-circle" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.importTitle}>Clear Route</Text>
            <Text style={[styles.importSub, {color: '#fca5a5'}]}>Remove imported GPX from map</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.importCard} onPress={handleImportGPX}>
          <View style={styles.importIconBox}>
            <MaterialCommunityIcons name="sign-direction" size={24} color="#10b981" />
          </View>
          <View>
            <Text style={styles.importTitle}>Import GPX Route</Text>
            <Text style={styles.importSub}>Navigate your own path</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* ── FILTER MODAL ── */}
      {isFilterOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Ionicons name="options-outline" size={24} color="#3b82f6" />
                <Text style={styles.modalTitle}>Filters</Text>
              </View>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Difficulty */}
            <Text style={styles.sectionLabel}>DIFFICULTY</Text>
            <View style={styles.pillRow}>
              <TouchableOpacity style={styles.pill}>
                <View style={[styles.dot, {backgroundColor: '#10b981'}]} />
                <Text style={styles.pillText}>Easy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.pill, styles.pillActive]}>
                <View style={[styles.dot, {backgroundColor: '#f59e0b'}]} />
                <Text style={styles.pillTextActive}>Moderate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill}>
                <View style={[styles.dot, {backgroundColor: '#ef4444'}]} />
                <Text style={styles.pillText}>Difficult</Text>
              </TouchableOpacity>
            </View>

            {/* Category */}
            <Text style={[styles.sectionLabel, {marginTop: 24}]}>CATEGORY</Text>
            <View style={styles.pillRowWrap}>
              <TouchableOpacity style={styles.pill}>
                <MaterialCommunityIcons name="sign-direction" size={16} color="#9ca3af" />
                <Text style={styles.pillText}>Area</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill}>
                <MaterialCommunityIcons name="flashlight" size={16} color="#9ca3af" />
                <Text style={styles.pillText}>Cave</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill}>
                <MaterialCommunityIcons name="shield-half-full" size={16} color="#9ca3af" />
                <Text style={styles.pillText}>Fort</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill}>
                <MaterialCommunityIcons name="sign-direction" size={16} color="#9ca3af" />
                <Text style={styles.pillText}>Trail</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pill}>
                <Ionicons name="water-outline" size={16} color="#9ca3af" />
                <Text style={styles.pillText}>Waterfall</Text>
              </TouchableOpacity>
            </View>

            {/* Show Results Button */}
            <TouchableOpacity style={styles.showResultsBtn} onPress={() => setIsFilterOpen(false)}>
              <Text style={styles.showResultsText}>Show 244 Results</Text>
            </TouchableOpacity>

          </View>
        </View>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // ── Top Header
  topHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: '#0a0d14',
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 5 : 40,
    paddingHorizontal: 20, paddingBottom: 12,
    zIndex: 10,
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161922',
    borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 8,
    width: '100%',
  },
  searchInput: {
    flex: 1, color: '#fff', fontSize: 16, marginLeft: 10,
  },
  divider: {
    width: 1, height: 20, backgroundColor: '#2d3748',
    marginHorizontal: 12,
  },
  filterIconBtn: { padding: 4 },
  discoverBtn: {
    marginTop: 8, alignItems: 'center',
  },
  discoverText: {
    color: '#60a5fa', fontSize: 11, fontWeight: '700', letterSpacing: 0.5,
  },

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

  // ── Bottom Cards
  importCard: {
    position: 'absolute', left: 16, bottom: Platform.OS === 'android' ? 85 : 100,
    backgroundColor: 'rgba(22, 25, 34, 0.9)',
    borderRadius: 12, padding: 8,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 5,
  },
  importIconBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    width: 32, height: 32, borderRadius: 6,
    alignItems: 'center', justifyContent: 'center',
  },
  importTitle: { color: '#fff', fontSize: 13, fontWeight: '700' },
  importSub: { color: '#6b7280', fontSize: 10, marginTop: 1 },

  // ── Modal
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
  },
  filterModal: {
    width: '85%',
    backgroundColor: '#1b202d',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sectionLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 10 },
  pillRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16,
  },
  pillActive: {
    borderColor: '#4b5563', backgroundColor: 'rgba(255,255,255,0.05)'
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pillText: { color: '#e5e7eb', fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#fff', fontSize: 14, fontWeight: '700' },
  showResultsBtn: {
    backgroundColor: '#0ea5e9',
    borderRadius: 30, paddingVertical: 16,
    alignItems: 'center', marginTop: 32,
  },
  showResultsText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

