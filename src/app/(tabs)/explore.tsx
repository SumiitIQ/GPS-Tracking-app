import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ARCGIS_API_KEY } from '../../constants/supabase';

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
          camera: { position: { x: 78.9629, y: 20.5937, z: 15000000 }, tilt: 0 }, // Center of India view
          environment: { starsEnabled: true, atmosphereEnabled: true },
          ui: { components: [] }
        });

        const treks = ${JSON.stringify(treks)};
        
        treks.forEach(trek => {
          if (!trek.lat || !trek.lng) return;
          const point = new Point({ longitude: trek.lng, latitude: trek.lat });
          
          // Marker
          const markerGraphic = new Graphic({
            geometry: point,
            symbol: new SimpleMarkerSymbol({
              style: "circle", color: [239, 68, 68, 1], size: "14px",
              outline: { color: [255, 255, 255, 1], width: 2 }
            }),
            attributes: trek
          });
          
          // Label
          const textGraphic = new Graphic({
            geometry: point,
            symbol: new TextSymbol({
              color: "white",
              haloColor: "black",
              haloSize: "1px",
              text: trek.name,
              yoffset: 15,
              font: { size: 12, weight: "bold", family: "sans-serif" }
            })
          });

          view.graphics.addMany([markerGraphic, textGraphic]);
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
  const router = useRouter();

  useEffect(() => {
    fetchTreks();
  }, []);

  const fetchTreks = async () => {
    setLoading(true);
    // Since we're using PostGIS, location is a geometry point. We can extract lat/lng in the select query.
    // Assuming location field is geography(POINT)
    const { data, error } = await supabase
      .from('treks_with_coords')
      .select('id, name, region, description, lat, lng');
    
    if (error) {
      console.error(error);
    } else if (data) {
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
      
      {/* Search Header Overlay */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Treks</Text>
        <Text style={styles.headerSub}>Find your next expedition</Text>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#ef4444" size="large" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60,
    left: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  headerSub: { color: '#9ca3af', fontSize: 13, marginTop: 4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});
