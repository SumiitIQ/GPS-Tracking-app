import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return null; // Layout handles the loading spinner
  }

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return <Redirect href="/(tabs)/record" />;
}
