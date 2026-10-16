import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [offlineMode, setOfflineMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<'metric' | 'imperial'>('metric');
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'trail' | 'night'>('light');

  const [unitModalVisible, setUnitModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const handleClearCache = () => {
    Alert.alert(
      'Clear Map Cache',
      'Are you sure you want to clear temporary map tiles and search cache? Downloaded routes will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => Alert.alert('Cache Cleared', '14.2 MB freed up.') }
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F2ED" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* MAP & NAVIGATION SECTION */}
        <Text style={styles.sectionTitle}>MAP & NAVIGATION</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.borderBottom]}
            onPress={() => router.push('/offline-maps')}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="map-outline" size={20} color="#2D7D78" />
              </View>
              <Text style={styles.rowLabel}>Offline Maps Manager</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, styles.borderBottom]}
            onPress={() => setUnitModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="speedometer-outline" size={20} color="#2D7D78" />
              </View>
              <Text style={styles.rowLabel}>Units</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>{selectedUnit === 'metric' ? 'Metric (km/m)' : 'Imperial (mi/ft)'}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="cloud-offline-outline" size={20} color="#2D7D78" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Offline Mode Only</Text>
                <Text style={styles.rowSub}>Save battery & mobile data</Text>
              </View>
            </View>
            <Switch
              value={offlineMode}
              onValueChange={setOfflineMode}
              trackColor={{ false: '#E5E0D8', true: '#2D7D78' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* APPEARANCE */}
        <Text style={styles.sectionTitle}>APPEARANCE</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => setThemeModalVisible(true)}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="color-palette-outline" size={20} color="#2D7D78" />
              </View>
              <Text style={styles.rowLabel}>App Theme</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue}>
                {selectedTheme === 'light' ? 'Light' : selectedTheme === 'trail' ? 'Trail Mode' : 'Night'}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* PREFERENCES */}
        <Text style={styles.sectionTitle}>PREFERENCES</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="notifications-outline" size={20} color="#2D7D78" />
              </View>
              <View>
                <Text style={styles.rowLabel}>Notifications</Text>
                <Text style={styles.rowSub}>Weather alerts & trail sync</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: '#E5E0D8', true: '#2D7D78' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <TouchableOpacity
            style={styles.row}
            onPress={handleClearCache}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="trash-bin-outline" size={20} color="#D4522A" />
              </View>
              <Text style={[styles.rowLabel, { color: '#D4522A' }]}>Clear Map Cache</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* ABOUT NIRDESH */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="information-circle-outline" size={20} color="#2D7D78" />
              </View>
              <Text style={styles.rowLabel}>Version</Text>
            </View>
            <Text style={styles.rowValue}>1.0.0 (Production Build)</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#2D7D78" />
              </View>
              <Text style={styles.rowLabel}>GPS Coordinate Precision</Text>
            </View>
            <Text style={styles.rowValue}>High Accuracy (RTK-Ready)</Text>
          </View>
        </View>
      </ScrollView>

      {/* UNITS MODAL */}
      <Modal visible={unitModalVisible} transparent animationType="fade" onRequestClose={() => setUnitModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Measurement Unit</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedUnit('metric'); setUnitModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>Metric (Kilometers, Meters)</Text>
              {selectedUnit === 'metric' && <Ionicons name="checkmark-circle" size={20} color="#2D7D78" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedUnit('imperial'); setUnitModalVisible(false); }}
            >
              <Text style={styles.modalOptionText}>Imperial (Miles, Feet)</Text>
              {selectedUnit === 'imperial' && <Ionicons name="checkmark-circle" size={20} color="#2D7D78" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* THEME MODAL (Screen 20 in mockup) */}
      <Modal visible={themeModalVisible} transparent animationType="fade" onRequestClose={() => setThemeModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Theme</Text>
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedTheme('light'); setThemeModalVisible(false); }}
            >
              <View>
                <Text style={styles.modalOptionText}>Light</Text>
                <Text style={styles.modalOptionSub}>Default warm cream palette</Text>
              </View>
              {selectedTheme === 'light' && <Ionicons name="checkmark-circle" size={20} color="#2D7D78" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedTheme('trail'); setThemeModalVisible(false); }}
            >
              <View>
                <Text style={styles.modalOptionText}>Trail Mode</Text>
                <Text style={styles.modalOptionSub}>High contrast for bright sunlight</Text>
              </View>
              {selectedTheme === 'trail' && <Ionicons name="checkmark-circle" size={20} color="#2D7D78" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => { setSelectedTheme('night'); setThemeModalVisible(false); }}
            >
              <View>
                <Text style={styles.modalOptionText}>Night</Text>
                <Text style={styles.modalOptionSub}>Low light conditions</Text>
              </View>
              {selectedTheme === 'night' && <Ionicons name="checkmark-circle" size={20} color="#2D7D78" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F2ED' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  scroll: { padding: 20, paddingBottom: 60 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    letterSpacing: 0.8, marginBottom: 8, marginTop: 12, marginLeft: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F5F2ED' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EDF6F5',
    alignItems: 'center', justifyContent: 'center',
  },
  rowLabel: { fontSize: 15, fontWeight: '500', color: '#1C1C1E' },
  rowSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowValue: { fontSize: 14, color: '#6B7280' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalContent: {
    width: '100%', backgroundColor: '#FFFFFF',
    borderRadius: 20, padding: 24, gap: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 4 },
  modalOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F2ED',
  },
  modalOptionText: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  modalOptionSub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
