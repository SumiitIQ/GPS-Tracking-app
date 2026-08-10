import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processOfflineQueue = async (u: User) => {
      try {
        const existing = await AsyncStorage.getItem('pending_tracks');
        if (!existing) return;
        
        const tracks = JSON.parse(existing);
        const remaining = [];
        
        for (const track of tracks) {
          if (track.userId !== u.id) {
            remaining.push(track);
            continue;
          }
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gpx-routes')
            .upload(`${u.id}/${track.gpxData.fileName}`, track.gpxData.content, {
              contentType: 'application/gpx+xml',
              upsert: true
            });
            
          if (uploadError) {
            remaining.push(track);
            continue;
          }
  
          const { data: publicUrlData } = supabase.storage
            .from('gpx-routes')
            .getPublicUrl(`${u.id}/${track.gpxData.fileName}`);
          
          const { error: dbError } = await supabase.from('routes').insert({
            title: 'My Expedition (Offline Sync)',
            gpx_url: publicUrlData.publicUrl,
            distance: track.distance,
            elevation_gain: 0,
            submitter_id: u.id,
            created_at: track.timestamp
          });
          
          if (dbError) {
             remaining.push(track);
          }
        }
        
        if (remaining.length !== tracks.length) {
          await AsyncStorage.setItem('pending_tracks', JSON.stringify(remaining));
        } else if (remaining.length === 0) {
          await AsyncStorage.removeItem('pending_tracks');
        }
      } catch (e) {
        console.error(e);
      }
    };

    const ensureProfile = async (u: User) => {
      const { data } = await supabase.from('profiles').select('id').eq('id', u.id).single();
      if (!data) {
        await supabase.from('profiles').insert({
          id: u.id,
          display_name: u.email?.split('@')[0] || 'Trekker'
        });
      }
    };

    const handleAuth = async (u: User) => {
      await ensureProfile(u);
      const state = await NetInfo.fetch();
      if (state.isConnected) {
        await processOfflineQueue(u);
      }
    };


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
  }, []);

  useEffect(() => {
    const processOfflineQueue = async (u: User) => {
      try {
        const existing = await AsyncStorage.getItem('pending_tracks');
        if (!existing) return;
        
        const tracks = JSON.parse(existing);
        const remaining = [];
        
        for (const track of tracks) {
          if (track.userId !== u.id) {
            remaining.push(track);
            continue;
          }
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('gpx-routes')
            .upload(`${u.id}/${track.gpxData.fileName}`, track.gpxData.content, {
              contentType: 'application/gpx+xml',
              upsert: true
            });
            
          if (uploadError) {
            remaining.push(track);
            continue;
          }
  
          const { data: publicUrlData } = supabase.storage
            .from('gpx-routes')
            .getPublicUrl(`${u.id}/${track.gpxData.fileName}`);
          
          const { error: dbError } = await supabase.from('routes').insert({
            title: 'My Expedition (Offline Sync)',
            gpx_url: publicUrlData.publicUrl,
            distance: track.distance,
            elevation_gain: 0,
            submitter_id: u.id,
            created_at: track.timestamp
          });
          
          if (dbError) {
             remaining.push(track);
          }
        }
        
        if (remaining.length !== tracks.length) {
          await AsyncStorage.setItem('pending_tracks', JSON.stringify(remaining));
        } else if (remaining.length === 0) {
          await AsyncStorage.removeItem('pending_tracks');
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (!user) return;
    
    const unsubscribeNet = NetInfo.addEventListener(state => {
      if (state.isConnected && user) {
        processOfflineQueue(user);
      }
    });
    return () => {
      unsubscribeNet();
    };
  }, [user]);

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

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
