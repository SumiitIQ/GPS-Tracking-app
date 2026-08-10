import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background Task Error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data as { locations: any[] };
    
    try {
      // Fetch existing tracks
      const existingStr = await AsyncStorage.getItem('bg_locations');
      const existing = existingStr ? JSON.parse(existingStr) : [];
      
      const newPoints = locations.map(loc => ({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        timestamp: loc.timestamp
      }));

      // Merge and save
      const merged = [...existing, ...newPoints];
      await AsyncStorage.setItem('bg_locations', JSON.stringify(merged));
      
      // Emit to foreground if app is active
      DeviceEventEmitter.emit('onBackgroundLocation', newPoints);
    } catch (e) {
      console.error('Failed to save background location:', e);
    }
  }
});
