import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { supabase } from './supabase';
import { DOMParser } from '@xmldom/xmldom';
import NetInfo from '@react-native-community/netinfo';

export const LOCAL_TRACKS_KEY = 'local_saved_tracks';
export const PENDING_TRACKS_KEY = 'pending_tracks';

export interface UserRecordedTrack {
  id: string;
  title: string;
  distance: number; // meters
  elevationGain: number;
  durationSeconds: number;
  createdAt: string;
  gpxUrl?: string;
  localGpxUri?: string;
  isPendingSync: boolean;
  isPendingApproval: boolean;
  difficulty: string;
  source: 'cloud' | 'local' | 'pending';
}

/**
 * Parses basic info from a local GPX file content or file URI
 */
async function parseGpxFileInfo(fileUri: string): Promise<{ name?: string; distanceM?: number; pointCount: number }> {
  try {
    const xmlStr = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');
    
    // Extract name
    const nameNode = doc.getElementsByTagName('name')?.[0];
    const name = nameNode?.textContent?.trim();

    // Extract track points to compute distance
    const trkpts = doc.getElementsByTagName('trkpt');
    let totalDist = 0;
    let prevLat: number | null = null;
    let prevLon: number | null = null;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const calcDist = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    for (let i = 0; i < trkpts.length; i++) {
      const pt = trkpts[i];
      const lat = parseFloat(pt.getAttribute('lat') || '0');
      const lon = parseFloat(pt.getAttribute('lon') || '0');
      if (lat && lon) {
        if (prevLat !== null && prevLon !== null) {
          totalDist += calcDist(prevLat, prevLon, lat, lon);
        }
        prevLat = lat;
        prevLon = lon;
      }
    }

    return { name, distanceM: Math.round(totalDist), pointCount: trkpts.length };
  } catch (err) {
    return { pointCount: 0 };
  }
}

/**
 * Saves a track locally to device storage
 */
export async function saveLocalTrack(track: UserRecordedTrack): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_TRACKS_KEY);
    const existing: UserRecordedTrack[] = raw ? JSON.parse(raw) : [];
    const idx = existing.findIndex(t => t.id === track.id);
    if (idx >= 0) {
      existing[idx] = track;
    } else {
      existing.unshift(track);
    }
    await AsyncStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to save local track:', e);
  }
}

/**
 * Fetches all user tracks by combining:
 * 1. Cloud routes from Supabase (by submitter_id or user_id)
 * 2. Pending offline queue (pending_tracks)
 * 3. Local saved tracks (local_saved_tracks)
 * 4. Any discovered summitiq_track_*.gpx files on device storage
 */
export async function getAllUserTracks(userId?: string | null): Promise<UserRecordedTrack[]> {
  const trackMap = new Map<string, UserRecordedTrack>();

  // 1. Load Local Saved Tracks
  try {
    const localRaw = await AsyncStorage.getItem(LOCAL_TRACKS_KEY);
    if (localRaw) {
      const localList: UserRecordedTrack[] = JSON.parse(localRaw);
      for (const t of localList) {
        trackMap.set(t.id, t);
      }
    }
  } catch (e) {
    console.warn('Error loading local tracks:', e);
  }

  // 2. Load Pending Tracks from offline queue
  try {
    const pendingRaw = await AsyncStorage.getItem(PENDING_TRACKS_KEY);
    if (pendingRaw) {
      const pendingList: any[] = JSON.parse(pendingRaw);
      for (const p of pendingList) {
        const id = p.id ? String(p.id) : `pending_${Date.now()}_${Math.random()}`;
        const title = p.title || p.gpxData?.name || `Recorded Trek ${new Date(p.timestamp || Date.now()).toLocaleDateString()}`;
        const track: UserRecordedTrack = {
          id,
          title,
          distance: p.distance || 0,
          elevationGain: p.elevationGain || 0,
          durationSeconds: p.elapsedSeconds || 0,
          createdAt: p.timestamp || new Date().toISOString(),
          gpxUrl: p.gpxData?.path,
          localGpxUri: p.gpxData?.path,
          isPendingSync: true,
          isPendingApproval: false,
          difficulty: 'Moderate',
          source: 'pending',
        };
        trackMap.set(id, track);
      }
    }
  } catch (e) {
    console.warn('Error loading pending tracks:', e);
  }

  // 3. Scan FileSystem for recorded GPX files on device
  try {
    if (FileSystem.documentDirectory) {
      const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
      const gpxFiles = files.filter(f => f.startsWith('summitiq_track_') && f.endsWith('.gpx'));

      for (const fileName of gpxFiles) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        const fileId = `file_${fileName.replace('.gpx', '')}`;
        
        // Only parse if not already in trackMap
        let exists = false;
        for (const t of trackMap.values()) {
          if (t.localGpxUri?.includes(fileName) || t.gpxUrl?.includes(fileName)) {
            exists = true;
            break;
          }
        }

        if (!exists) {
          const info = await parseGpxFileInfo(fileUri);
          const timeMatch = fileName.match(/summitiq_track_(\d+)/);
          const timestamp = timeMatch ? new Date(parseInt(timeMatch[1], 10)).toISOString() : new Date().toISOString();
          const title = info.name || `Recorded Trail (${new Date(timestamp).toLocaleDateString()})`;

          const track: UserRecordedTrack = {
            id: fileId,
            title,
            distance: info.distanceM || 0,
            elevationGain: 0,
            durationSeconds: 0,
            createdAt: timestamp,
            gpxUrl: fileUri,
            localGpxUri: fileUri,
            isPendingSync: false,
            isPendingApproval: false,
            difficulty: 'Moderate',
            source: 'local',
          };
          trackMap.set(fileId, track);
          // Persist to local tracks so we don't need to re-parse next time
          saveLocalTrack(track);
        }
      }
    }
  } catch (e) {
    console.warn('Error scanning GPX files:', e);
  }

  // 4. Fetch Cloud Routes from Supabase if online
  if (userId) {
    try {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        // Try submitter_id first
        let { data, error } = await supabase
          .from('routes')
          .select('*')
          .eq('submitter_id', userId)
          .order('created_at', { ascending: false });

        // Fallback to user_id if submitter_id had schema issues
        if (error && error.message?.includes('submitter_id')) {
          const res = await supabase
            .from('routes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
          data = res.data;
          error = res.error;
        }

        if (!error && data && data.length > 0) {
          for (const item of data) {
            const id = String(item.id);
            const isPendingApproval = Boolean(item.description?.includes('[PENDING_APPROVAL]'));
            const cloudTrack: UserRecordedTrack = {
              id,
              title: item.title || item.name || 'Cloud Trek',
              distance: item.distance || item.distance_m || 0,
              elevationGain: item.elevation_gain || 0,
              durationSeconds: item.duration_seconds || 0,
              createdAt: item.created_at || new Date().toISOString(),
              gpxUrl: item.gpx_url,
              localGpxUri: item.gpx_url,
              isPendingSync: false,
              isPendingApproval,
              difficulty: item.difficulty_self_rating || 'Moderate',
              source: 'cloud',
            };
            trackMap.set(id, cloudTrack);
            // Cache locally so it's visible even offline!
            saveLocalTrack(cloudTrack);
          }
        }
      }
    } catch (e) {
      console.warn('Supabase routes fetch error:', e);
    }
  }

  // Convert map to sorted array (newest first)
  const allTracks = Array.from(trackMap.values());
  allTracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return allTracks;
}

/**
 * Deletes a recorded track from local storage and pending queues
 */
export async function deleteTrack(trackId: string): Promise<void> {
  try {
    // 1. Remove from local_saved_tracks
    const localRaw = await AsyncStorage.getItem(LOCAL_TRACKS_KEY);
    if (localRaw) {
      const localList: UserRecordedTrack[] = JSON.parse(localRaw);
      const filtered = localList.filter(t => t.id !== trackId);
      await AsyncStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(filtered));
    }

    // 2. Remove from pending_tracks
    const pendingRaw = await AsyncStorage.getItem(PENDING_TRACKS_KEY);
    if (pendingRaw) {
      const pendingList: any[] = JSON.parse(pendingRaw);
      const filtered = pendingList.filter(p => String(p.id) !== trackId);
      await AsyncStorage.setItem(PENDING_TRACKS_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error('Failed to delete track:', e);
  }
}
