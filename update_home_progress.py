import re

with open('src/app/(tabs)/index.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add auth and useFocusEffect imports
content = content.replace('import { MaterialIcons, Ionicons } from \'@expo/vector-icons\';', 'import { MaterialIcons, Ionicons } from \'@expo/vector-icons\';\nimport { useAuth } from \'../../context/AuthContext\';\nimport { useFocusEffect } from \'expo-router\';\nimport { useCallback } from \'react\';')

# Add state variables for progress inside HomeScreen
state_injection = '''  const router = useRouter();
  const { user } = useAuth();
  const [totalDistance, setTotalDistance] = useState(0);
  const [totalElevation, setTotalElevation] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (user?.id) {
        fetchUserStats();
      }
    }, [user?.id])
  );

  const fetchUserStats = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select('distance, elevation_gain')
      .eq('submitter_id', user?.id);
    
    if (data && !error) {
      let dist = 0;
      let elev = 0;
      data.forEach(route => {
        dist += (route.distance || 0);
        elev += (route.elevation_gain || 0);
      });
      // convert m to km for distance
      setTotalDistance(dist / 1000);
      setTotalElevation(elev);
    }
  };'''

content = content.replace('  const router = useRouter();', state_injection)

# Replace the static numbers with dynamic ones
old_progress = '''            <View style={styles.progressGrid}>
              <MetricTile label="TOTAL DIST" value="120" unit="km" style={styles.flexHalf} />
              <MetricTile label="ELEVATION GAIN" value="4,500" unit="m" style={styles.flexHalf} />
            </View>'''

new_progress = '''            <View style={styles.progressGrid}>
              <MetricTile label="TOTAL DIST" value={totalDistance.toFixed(1)} unit="km" style={styles.flexHalf} />
              <MetricTile label="ELEVATION GAIN" value={Math.round(totalElevation).toString()} unit="m" style={styles.flexHalf} />
            </View>'''

content = content.replace(old_progress, new_progress)

with open('src/app/(tabs)/index.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated Progress in Home Screen')
