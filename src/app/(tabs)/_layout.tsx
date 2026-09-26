import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.floatingNavContainer, { paddingBottom: insets.bottom + 10 }]}>
      <ImageBackground source={require('../../../assets/images/home_assets/bottom_bg.jpg')} style={styles.bottomNavBg} imageStyle={{ borderRadius: 40 }}>
        <BlurView intensity={70} tint="dark" style={styles.bottomNavInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            // Custom mapping for icons
            if (route.name === 'record') {
              return (
                <View key={route.key} style={styles.navCenterItem}>
                  <TouchableOpacity onPress={onPress} style={styles.fabBtn}>
                    <MaterialCommunityIcons name="image-filter-hdr" size={28} color="#fff" />
                    <View style={styles.fabGlow} />
                  </TouchableOpacity>
                </View>
              );
            }

            let iconName = 'ellipse';
            let IconComponent = Ionicons;
            
            if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
            if (route.name === 'explore') iconName = isFocused ? 'compass' : 'compass-outline';
            if (route.name === 'navigate') iconName = isFocused ? 'map' : 'map-outline';
            if (route.name === 'activity') iconName = isFocused ? 'person' : 'person-outline';

            const color = isFocused ? '#79d773' : '#a0a0a0';

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.navItem}>
                <Ionicons name={iconName as any} size={24} color={color} />
                <Text style={[styles.navText, { color }]}>{options.title}</Text>
                {isFocused && <View style={styles.navActiveDot} />}
              </TouchableOpacity>
            );
          })}
        </BlurView>
      </ImageBackground>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="record" options={{ title: 'Record' }} />
      <Tabs.Screen name="navigate" options={{ title: 'Map' }} />
      <Tabs.Screen name="activity" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  floatingNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 90, // Includes padding
    justifyContent: 'flex-end',
    zIndex: 50,
  },
  bottomNavBg: {
    width: '100%',
    height: 70,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomNavInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 40,
    overflow: 'hidden',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: '100%',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  navActiveDot: {
    width: 16,
    height: 2,
    backgroundColor: '#79d773',
    borderRadius: 1,
    marginTop: 4,
    position: 'absolute',
    bottom: 10,
  },
  navCenterItem: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  fabBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1b5e20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
    marginTop: -30, // Make it float above
  },
  fabGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 32,
    shadowColor: '#79d773',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  }
});
