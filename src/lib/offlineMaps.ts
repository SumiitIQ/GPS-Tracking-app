import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAHARASHTRA_TREKS, getTrekById, generateRealTrekGpx } from '../constants/maharashtraTreks';

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

// Exported presets directly from real Maharashtra treks
export const PRESET_OFFLINE_TREKS = MAHARASHTRA_TREKS.map(trek => ({
  id: trek.id,
  name: trek.name,
  region: `${trek.region} (${trek.district})`,
  sizeText: `${Math.round(trek.distanceMeters / 400 + 10)} MB • Ready`,
  distanceText: trek.distance,
  routeTitle: trek.routeTitle,
  elevationGain: trek.elevationMeters,
  gpxUrl: trek.gpxUrl,
  sampleCoords: trek.trailPoints
}));

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
  const matchedTrek = getTrekById(trek.id);
  let coordinates: number[][] = matchedTrek ? matchedTrek.trailPoints : [];

  // 1. If remote GPX is provided and accessible, download it
  let downloadedOnline = false;
  if (route?.gpx_url && route.gpx_url.startsWith('http')) {
    try {
      const res = await FileSystem.downloadAsync(route.gpx_url, localGpxPath);
      if (res.status === 200) {
        const xmlStr = await FileSystem.readAsStringAsync(localGpxPath);
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
          downloadedOnline = true;
        }
      }
    } catch (err) {
      console.warn('Remote GPX download skipped, generating from real database:', err);
    }
  }

  // 2. If not downloaded from remote URL, generate standard valid GPX from authentic database
  if (!downloadedOnline) {
    let gpxContent = '';
    if (matchedTrek) {
      gpxContent = generateRealTrekGpx(matchedTrek);
    } else {
      const trkptsXml = coordinates.map(c => `      <trkpt lat="${c[1]}" lon="${c[0]}"><ele>0</ele></trkpt>`).join('\n');
      gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Nirdesh">
  <trk>
    <name>${trek.name}</name>
    <trkseg>
${trkptsXml}
    </trkseg>
  </trk>
</gpx>`;
    }
    await FileSystem.writeAsStringAsync(localGpxPath, gpxContent);
  }

  const preset = PRESET_OFFLINE_TREKS.find(p => p.id === trek.id);
  const distM = route?.distance || (matchedTrek ? matchedTrek.distanceMeters : preset ? parseFloat(preset.distanceText) * 1000 : 1000);
  const distanceText = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${Math.round(distM)} m`;

  const offlineItem: OfflineMapItem = {
    id: trek.id,
    name: matchedTrek?.name || trek.name,
    region: matchedTrek ? `${matchedTrek.region} (${matchedTrek.district})` : (trek.region || 'Maharashtra, India'),
    sizeText: preset?.sizeText || `${Math.round(distM / 400 + 10)} MB • Ready`,
    downloadedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    gpxLocalUri: localGpxPath,
    routeTitle: route?.title || matchedTrek?.routeTitle || preset?.routeTitle || 'Main Trail',
    distanceText,
    coordinates,
    elevationGain: route?.elevation_gain || matchedTrek?.elevationMeters || preset?.elevationGain || 100,
  };

  await saveMapOffline(offlineItem);
  return offlineItem;
}
