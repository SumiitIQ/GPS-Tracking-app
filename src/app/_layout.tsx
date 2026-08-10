import '../lib/backgroundTask';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { 
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { 
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold 
} from '@expo-google-fonts/jetbrains-mono';

function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not signed in and not in auth group, redirect to auth
      router.replace('/(auth)');
    } else if (user && inAuthGroup) {
      // Signed in and in auth group, redirect to tabs
      router.replace('/(tabs)/' as any);
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return <Slot />;
}

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator color="#3b82f6" size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
