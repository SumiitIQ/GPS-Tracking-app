import React from 'react';
import { Tabs } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'index', icon: 'home', label: 'Home' },
    { name: 'explore', icon: 'map', label: 'Explore' },
    { name: 'record', icon: 'add', label: '', isCenter: true },
    { name: 'activity', icon: 'list', label: 'Activity' },
    { name: 'profile', icon: 'person', label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabRow}>
        {tabs.map((tab, idx) => {
          // find matching route
          const routeIdx = state.routes.findIndex((r: any) => r.name === tab.name);
          const isFocused = state.index === routeIdx;

          const onPress = () => {
            if (routeIdx === -1) return;
            const event = navigation.emit({
              type: 'tabPress',
              target: state.routes[routeIdx].key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(tab.name);
            }
          };

          if (tab.isCenter) {
            return (
              <TouchableOpacity key={tab.name} style={styles.centerBtn} onPress={onPress} activeOpacity={0.85}>
                <View style={styles.centerCircle}>
                  <Ionicons name="add" size={28} color="#fff" />
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity key={tab.name} style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
              <Ionicons
                name={isFocused ? tab.icon as any : (tab.icon + '-outline') as any}
                size={22}
                color={isFocused ? '#2D7D78' : '#9CA3AF'}
              />
              {isFocused && tab.label ? (
                <View style={styles.activeDot} />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="record" />
      <Tabs.Screen name="activity" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E0D8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2D7D78',
    marginTop: 3,
  },
  centerBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#D4522A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#D4522A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -16,
  },
});
