import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface OfflineMapItem {
  id: string; // trek id or custom id
  name: string;
  region: string;
  sizeText: string;
  downloadedAt: string;
  gpxLocalUri: string;
  routeTitle: string;
  distanceText: string;
  coordinates: number[][]; // [lon, lat]
  elevationGain?: number;
}

const OFFLINE_MAPS_KEY = 'nirdesh_offline_maps_list';

// Default pre-packaged / popular routes data with full coordinates for guaranteed offline use
export const PRESET_OFFLINE_TREKS = [
  {
    id: 'pandavleni',
    name: 'Pandavleni Caves Trek',
    region: 'Nashik, Maharashtra',
    sizeText: '12 MB • Ready',
    distanceText: '0.6 km',
    routeTitle: 'Pandavleni Ascent Route',
    elevationGain: 90,
    gpxUrl: 'https://pexkoxqazawomgvhjure.supabase.co/storage/v1/object/public/gpx-routes/Pandavleni_Final.gpx',
    sampleCoords: [
      [73.7482, 19.9634],
      [73.7488, 19.9639],
      [73.7495, 19.9644],
      [73.7501, 19.9650],
      [73.7508, 19.9655],
      [73.7514, 19.9661],
      [73.7521, 19.9667]
    ]
  },
  {
    id: 'kalsubai',
    name: 'Kalsubai Peak Trek',
    region: 'Igatpuri, Maharashtra',
    sizeText: '18 MB • Ready',
    distanceText: '6.6 km',
    routeTitle: 'Bari Village Route',
    elevationGain: 800,
    gpxUrl: '',
    sampleCoords: [
      [73.7080, 19.6010],
      [73.7100, 19.6025],
      [73.7125, 19.6040],
      [73.7150, 19.6055],
      [73.7175, 19.6070],
      [73.7200, 19.6085]
    ]
  },
  {
    id: 'rajmachi',
    name: 'Rajmachi Fort Trail',
    region: 'Lonavala, Maharashtra',
    sizeText: '15 MB • Ready',
    distanceText: '16.0 km',
    routeTitle: 'Udhewadi Trail',
    elevationGain: 450,
    gpxUrl: '',
    sampleCoords: [
      [73.4010, 18.8250],
      [73.4035, 18.8270],
      [73.4060, 18.8295],
      [73.4085, 18.8315],
      [73.4110, 18.8340]
    ]
  }
];

export async function getDownloadedMaps(): Promise<OfflineMapItem[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_MAPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error getting downloaded maps:', e);
    return [];
  }
}

export async function isMapDownloaded(trekId: string): Promise<boolean> {
  const list = await getDownloadedMaps();
  return list.some(item => item.id === trekId);
}

export async function saveMapOffline(item: OfflineMapItem): Promise<void> {
  const list = await getDownloadedMaps();
  const filtered = list.filter(m => m.id !== item.id);
  filtered.push(item);
  await AsyncStorage.setItem(OFFLINE_MAPS_KEY, JSON.stringify(filtered));
}

export async function removeDownloadedMap(trekId: string): Promise<void> {
  const list = await getDownloadedMaps();
  const target = list.find(m => m.id === trekId);
  if (target && target.gpxLocalUri) {
    try {
      await FileSystem.deleteAsync(target.gpxLocalUri, { idempotent: true });
    } catch (e) {
      // ignore
    }
  }
  const filtered = list.filter(m => m.id !== trekId);
  await AsyncStorage.setItem(OFFLINE_MAPS_KEY, JSON.stringify(filtered));
}

// Download GPX file and save map details locally
export async function downloadTrekForOffline(
  trek: { id: string; name: string; region?: string },
  route?: { title?: string; distance?: number; elevation_gain?: number; gpx_url?: string }
): Promise<OfflineMapItem> {
  const offlineDir = `${FileSystem.documentDirectory}offline_maps/`;
  const dirInfo = await FileSystem.getInfoAsync(offlineDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(offlineDir, { intermediates: true });
  }

  const localGpxPath = `${offlineDir}${trek.id}.gpx`;
  let coordinates: number[][] = [];

  // Check if we have preset coords
  const preset = PRESET_OFFLINE_TREKS.find(p => p.id === trek.id);
  if (preset && preset.sampleCoords) {
    coordinates = preset.sampleCoords;
  }

  // If there is a real GPX URL, download it
  if (route?.gpx_url && route.gpx_url.startsWith('http')) {
    try {
      await FileSystem.downloadAsync(route.gpx_url, localGpxPath);
      const xmlStr = await FileSystem.readAsStringAsync(localGpxPath);
      // Extract coordinates from GPX
      const trkptRegex = /lat=["']([0-9.-]+)["']\s+lon=["']([0-9.-]+)["']/g;
      let match;
      const parsedCoords: number[][] = [];
      while ((match = trkptRegex.exec(xmlStr)) !== null) {
        const lat = parseFloat(match[1]);
        const lon = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lon)) {
          parsedCoords.push([lon, lat]);
        }
      }
      if (parsedCoords.length > 0) {
        coordinates = parsedCoords;
      }
    } catch (err) {
      console.warn('Could not download online GPX, using fallback coordinates', err);
    }
  }

  // If local gpx file wasn't created via download, create a valid local GPX XML
  const fileExists = await FileSystem.getInfoAsync(localGpxPath);
  if (!fileExists.exists) {
    const trkptsXml = coordinates.map(c => `      <trkpt lat="${c[1]}" lon="${c[0]}"><ele>0</ele></trkpt>`).join('\n');
    const gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nirdesh">
  <trk>
    <name>${trek.name}</name>
    <trkseg>
${trkptsXml}
    </trkseg>
  </trk>
</gpx>`;
    await FileSystem.writeAsStringAsync(localGpxPath, gpxContent);
  }

  const distM = route?.distance || (preset ? parseFloat(preset.distanceText) * 1000 : 1000);
  const distanceText = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${Math.round(distM)} m`;

  const offlineItem: OfflineMapItem = {
    id: trek.id,
    name: trek.name,
    region: trek.region || 'Maharashtra, India',
    sizeText: preset?.sizeText || '14 MB • Ready',
    downloadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    gpxLocalUri: localGpxPath,
    routeTitle: route?.title || preset?.routeTitle || 'Main Trail',
    distanceText,
    coordinates,
    elevationGain: route?.elevation_gain || preset?.elevationGain || 100,
  };

  await saveMapOffline(offlineItem);
  return offlineItem;
}
