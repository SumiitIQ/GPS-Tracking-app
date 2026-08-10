import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Theme } from '../../theme/Theme';
import { Typography } from '../../components/ui/Typography';

export default function RecordScreen() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <View style={styles.container}>
      {/* Top Navigation / Status */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="my-location" size={24} color={Theme.colors.tertiaryFixedDim} />
          <View>
            <Typography variant="labelCaps" color={Theme.colors.outline}>GPS ACCURACY</Typography>
            <Typography variant="metricSm" color={Theme.colors.onSurface}>High (3m)</Typography>
          </View>
        </View>
        <View style={styles.headerCenter}>
          <Typography variant="headlineMd" color={Theme.colors.primary}>Recording Trek</Typography>
        </View>
        <View style={styles.headerRight}>
          <View style={{ alignItems: 'flex-end' }}>
            <Typography variant="labelCaps" color={Theme.colors.outline}>BATTERY</Typography>
            <Typography variant="metricSm" color={Theme.colors.onSurface}>84%</Typography>
          </View>
          <MaterialIcons name="battery-full" size={24} color={Theme.colors.primary} />
        </View>
      </View>

      {/* Map Area */}
      <View style={styles.mapContainer}>
        <ImageBackground 
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7ckf5ZdcjBzvGVgIcSdWZGOuZuoSjVT1gLoE5EF-1lSrl3AqNQziApqLBgaBEpXOyxvCqioODCr6VUwIJTDdVgscDjsJs7k5Xpwl9ugGFOm14D-TXBlptT934VuznCcEG-FVgi9gBz_K2xbC9bqbde5aFdFMdl5TAVFPQKrtknVM0han4F9E0sc7ljAz_339QvHODc2LBZ3l_wA4uMgUxNpQGwG6x21jq0fAuhpq_fIrjg6ZJop7T-A' }} 
          style={StyleSheet.absoluteFill}
        />
        
        {/* Live Route Indicator Overlay */}
        <View style={styles.routeIndicator}>
          <View style={styles.pulseDot} />
          <Typography variant="metricSm" color={Theme.colors.onSurface}>Following Route: Kalsubai Ridge</Typography>
        </View>

        {/* Center Reticle */}
        <View style={styles.reticleContainer}>
          <MaterialIcons name="add-location" size={40} color={Theme.colors.secondary} />
        </View>
      </View>

      {/* Bottom Sheet (Draggable Metrics) */}
      <View style={[styles.bottomSheet, !isExpanded && styles.bottomSheetCollapsed]}>
        <TouchableOpacity 
          style={styles.dragHandleArea} 
          onPress={() => setIsExpanded(!isExpanded)}
          activeOpacity={1}
        >
          <View style={styles.dragHandle} />
        </TouchableOpacity>

        <View style={styles.sheetContent}>
          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Typography variant="labelCaps" color={Theme.colors.outline} style={{ marginBottom: 4 }}>ELAPSED TIME</Typography>
            <Typography variant="displayLg" color={Theme.colors.primary}>01:12:45</Typography>
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Typography variant="labelCaps" color={Theme.colors.outline}>DISTANCE</Typography>
              <View style={styles.metricRow}>
                <Typography variant="metricLg" color={Theme.colors.primary}>3.42</Typography>
                <Typography variant="metricSm" color={Theme.colors.outline} style={{ marginLeft: 4 }}>km</Typography>
              </View>
            </View>
            <View style={styles.metricCard}>
              <Typography variant="labelCaps" color={Theme.colors.outline}>ELEVATION</Typography>
              <View style={styles.metricRow}>
                <Typography variant="metricLg" color={Theme.colors.tertiaryFixedDim}>+240</Typography>
                <Typography variant="metricSm" color={Theme.colors.outline} style={{ marginLeft: 4 }}>m</Typography>
              </View>
            </View>
            <View style={[styles.metricCard, { width: '100%' }]}>
              <Typography variant="labelCaps" color={Theme.colors.outline}>PACE</Typography>
              <View style={styles.metricRow}>
                <Typography variant="metricLg" color={Theme.colors.primary}>18:20</Typography>
                <Typography variant="metricSm" color={Theme.colors.outline} style={{ marginLeft: 4 }}>/km</Typography>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.pauseBtn} activeOpacity={0.8}>
              <MaterialIcons name="pause" size={24} color={Theme.colors.onSecondary} />
              <Typography variant="headlineMd" color={Theme.colors.onSecondary} style={{ marginLeft: 8 }}>Pause</Typography>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pinBtn} activeOpacity={0.8}>
              <MaterialIcons name="push-pin" size={28} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 50,
    backgroundColor: 'rgba(247, 249, 252, 0.85)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 198, 202, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 50, // rough safe area top
    paddingBottom: Theme.spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceContainer,
  },
  routeIndicator: {
    position: 'absolute',
    top: 130,
    alignSelf: 'center',
    backgroundColor: 'rgba(247, 249, 252, 0.85)',
    borderColor: Theme.colors.outlineVariant,
    borderWidth: 1,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Theme.colors.tertiaryFixedDim,
  },
  reticleContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    zIndex: 40,
    backgroundColor: Theme.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(117, 119, 122, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
    transform: [{ translateY: 0 }],
  },
  bottomSheetCollapsed: {
    transform: [{ translateY: 300 }],
  },
  dragHandleArea: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  dragHandle: {
    width: 32,
    height: 4,
    backgroundColor: Theme.colors.outlineVariant,
    borderRadius: 2,
  },
  sheetContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingBottom: Theme.spacing.marginDesktop + 40, // extra for safe area
    gap: Theme.spacing.md,
  },
  timeDisplay: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(197, 198, 202, 0.3)',
    paddingBottom: Theme.spacing.sm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  metricCard: {
    backgroundColor: Theme.colors.surfaceContainerLowest,
    borderColor: Theme.colors.outlineVariant,
    borderWidth: 1,
    padding: Theme.spacing.sm,
    borderRadius: Theme.radius.lg,
    justifyContent: 'space-between',
    height: 88,
    flex: 1,
    minWidth: '45%',
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
    marginTop: Theme.spacing.xs,
  },
  pauseBtn: {
    flex: 1,
    backgroundColor: Theme.colors.secondary,
    borderRadius: Theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  pinBtn: {
    width: 64,
    height: 64,
    backgroundColor: Theme.colors.surfaceContainerHigh,
    borderColor: Theme.colors.outlineVariant,
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
