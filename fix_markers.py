import re

with open('src/app/(tabs)/navigate.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add TextSymbol to requires
content = content.replace(
    '"esri/symbols/SimpleLineSymbol"\n      ], function(esriConfig, Map, SceneView, GraphicsLayer, Graphic, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol) {',
    '"esri/symbols/SimpleLineSymbol",\n        "esri/symbols/TextSymbol"\n      ], function(esriConfig, Map, SceneView, GraphicsLayer, Graphic, Point, Polyline, SimpleMarkerSymbol, SimpleLineSymbol, TextSymbol) {'
)

# 2. Make the markers simpler and safer for autocasting
replacement = '''          view.when(() => {
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
          });'''

# Regex to replace the view.when block
pattern = r'view\.when\(\(\) => \{.*?view\.goTo\(polyline\.extent\.expand\(1\.2\)\);\s*\}\s*\}\);'
content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('src/app/(tabs)/navigate.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated navigate.tsx with safer ArcGIS autocasting')
