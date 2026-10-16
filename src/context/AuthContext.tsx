import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveLocalTrack, UserRecordedTrack, PENDING_TRACKS_KEY } from '../lib/userTracks';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const processOfflineQueue = useCallback(async (u: User) => {
    try {
      const existing = await AsyncStorage.getItem(PENDING_TRACKS_KEY);
      if (!existing) return;

      const tracks = JSON.parse(existing);
      const remaining = [];

      for (const track of tracks) {
        // If track belongs to another specific user ID, leave it
        if (track.userId && track.userId !== u.id && track.userId !== 'local_user') {
          remaining.push(track);
          continue;
        }

        const fileName = track.gpxData?.fileName || `track_${track.id}.gpx`;
        const content = track.gpxData?.content || '';

        if (!content) {
          continue; // skip corrupt track
        }

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gpx-routes')
          .upload(`${u.id}/${fileName}`, content, {
            contentType: 'application/gpx+xml',
            upsert: true,
          });

        if (uploadError) {
          remaining.push(track);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('gpx-routes')
          .getPublicUrl(`${u.id}/${fileName}`);

        const trackTitle = track.title || 'My Expedition';
        const { data: routeInsert, error: dbError } = await supabase
          .from('routes')
          .insert({
            title: trackTitle,
            gpx_url: publicUrlData.publicUrl,
            distance: track.distance || 0,
            elevation_gain: track.elevationGain || 0,
            submitter_id: u.id,
            created_at: track.timestamp || new Date().toISOString(),
          })
          .select()
          .single();

        if (dbError) {
          remaining.push(track);
        } else {
          // Update local cache with synced cloud URL
          const syncedLocalTrack: UserRecordedTrack = {
            id: routeInsert?.id ? String(routeInsert.id) : String(track.id),
            title: trackTitle,
            distance: track.distance || 0,
            elevationGain: track.elevationGain || 0,
            durationSeconds: track.elapsedSeconds || 0,
            createdAt: track.timestamp || new Date().toISOString(),
            gpxUrl: publicUrlData.publicUrl,
            localGpxUri: track.gpxData?.path,
            isPendingSync: false,
            isPendingApproval: false,
            difficulty: 'Moderate',
            source: 'cloud',
          };
          await saveLocalTrack(syncedLocalTrack);
        }
      }

      if (remaining.length !== tracks.length) {
        if (remaining.length === 0) {
          await AsyncStorage.removeItem(PENDING_TRACKS_KEY);
        } else {
          await AsyncStorage.setItem(PENDING_TRACKS_KEY, JSON.stringify(remaining));
        }
      }
    } catch (e) {
      console.error('processOfflineQueue error:', e);
    }
  }, []);

  const ensureProfile = async (u: User) => {
    try {
      const { data } = await supabase.from('profiles').select('id').eq('id', u.id).single();
      if (!data) {
        await supabase.from('profiles').insert({
          id: u.id,
          display_name: u.email?.split('@')[0] || 'Trekker',
        });
      }
    } catch (e) {
      console.warn('ensureProfile notice:', e);
    }
  };

  const handleAuth = useCallback(async (u: User) => {
    await ensureProfile(u);
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      await processOfflineQueue(u);
    }
  }, [processOfflineQueue]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) handleAuth(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) handleAuth(session.user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuth]);

  useEffect(() => {
    if (!user) return;
    const unsubscribeNet = NetInfo.addEventListener(state => {
      if (state.isConnected && user) {
        processOfflineQueue(user);
      }
    });
    return () => {
      unsubscribeNet();
    };
  }, [user, processOfflineQueue]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const syncOfflineQueue = async () => {
    if (user) {
      await processOfflineQueue(user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, syncOfflineQueue }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
