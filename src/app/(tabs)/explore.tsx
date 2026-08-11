import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, StatusBar, ActivityIndicator, 
  Platform, TextInput, TouchableOpacity, ScrollView, Switch
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
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
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/TextSymbol"
      ], function(esriConfig, Map, SceneView, Graphic, Point, SimpleMarkerSymbol, TextSymbol) {
        esriConfig.apiKey = "${apiKey}";
        
        const map = new Map({ basemap: "satellite", ground: "world-elevation" });
        const view = new SceneView({
          container: "viewDiv",
          map: map,
          camera: { position: { x: 78.9629, y: 20.5937, z: 15000000 }, tilt: 0 },
          environment: { starsEnabled: true, atmosphereEnabled: true },
          ui: { components: [] }
        });

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

          view.graphics.addMany([outerGraphic, innerGraphic, textGraphic]);
        });
        
        view.on("click", function(event) {
          view.hitTest(event).then(function(response) {
            if (response.results.length) {
              var graphic = response.results.filter(function (result) {
                return result.graphic.layer === view.graphics && result.graphic.attributes;
              })[0];
              if (graphic) {
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MARKER_CLICK', id: graphic.graphic.attributes.id }));
              }
            }
          });
        });
      });
    </script>
  </body>
</html>
`;

export default function ExploreTab() {
  const [treks, setTreks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(true);
  const router = useRouter();

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
      }
    } catch (e) {
      console.error(e);
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
          source={{ html: getExploreMapHtml(ARCGIS_API_KEY, treks) }}
          style={styles.map}
          scrollEnabled={false}
          bounces={false}
          onMessage={handleMessage}
        />
      )}

      {/* ── TOP HEADER PANEL ── */}
      <View style={styles.topHeader}>
        <Text style={styles.backText}>Back to Map</Text>
        
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9ca3af" style={{marginLeft: 4}} />
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
        <View style={styles.compassBtn}>
          <View style={styles.compassInner}>
            <View style={styles.compassNeedleRed} />
            <View style={styles.compassNeedleWhite} />
          </View>
        </View>
        
        <View style={styles.actionStack}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="layers" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.text3d}>3D</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]}>
            <Ionicons name="navigate-sharp" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── BOTTOM LEFT: IMPORT GPX ── */}
      <TouchableOpacity style={styles.importCard}>
        <View style={styles.importIconBox}>
          <MaterialCommunityIcons name="sign-direction" size={24} color="#10b981" />
        </View>
        <View>
          <Text style={styles.importTitle}>Import GPX Route</Text>
          <Text style={styles.importSub}>Navigate your own path</Text>
        </View>
      </TouchableOpacity>

      {/* ── BOTTOM RIGHT: VERIFIED TOGGLE ── */}
      <View style={styles.verifiedToggle}>
        <Switch 
          value={isVerified} 
          onValueChange={setIsVerified}
          trackColor={{ false: '#374151', true: '#3b82f6' }}
          thumbColor="#fff"
        />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>

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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + 10 : 50,
    paddingHorizontal: 20, paddingBottom: 20,
    zIndex: 10,
    alignItems: 'center',
  },
  backText: {
    color: '#1e3a8a', fontSize: 13, fontWeight: '600',
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161922',
    borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 12,
    width: '100%',
  },
  searchInput: {
    flex: 1, color: '#fff', fontSize: 16, marginLeft: 10,
  },
  divider: {
    width: 1, height: 24, backgroundColor: '#2d3748',
    marginHorizontal: 12,
  },
  filterIconBtn: { padding: 4 },
  discoverBtn: {
    marginTop: 16, alignItems: 'center',
  },
  discoverText: {
    color: '#60a5fa', fontSize: 12, fontWeight: '700', letterSpacing: 0.5,
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
    transform: [{ rotate: '-45deg' }]
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

  // ── Bottom Cards
  importCard: {
    position: 'absolute', left: 16, bottom: Platform.OS === 'android' ? 85 : 100,
    backgroundColor: 'rgba(22, 25, 34, 0.9)',
    borderRadius: 16, padding: 12,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 5,
  },
  importIconBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    width: 40, height: 40, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  importTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  importSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },

  verifiedToggle: {
    position: 'absolute', right: 16, bottom: Platform.OS === 'android' ? 85 : 100,
    backgroundColor: 'rgba(22, 25, 34, 0.9)',
    borderRadius: 24, paddingVertical: 8, paddingHorizontal: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 5,
  },
  verifiedText: { color: '#fff', fontSize: 14, fontWeight: '600' },

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

