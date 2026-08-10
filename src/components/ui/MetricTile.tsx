import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Theme } from '../../theme/Theme';
import { Typography } from './Typography';

interface MetricTileProps {
  label: string;
  value: string;
  unit: string;
  style?: ViewStyle;
}

export function MetricTile({ label, value, unit, style }: MetricTileProps) {
  return (
    <View style={[styles.container, style]}>
      <Typography variant="labelCaps" color={Theme.colors.outline}>
        {label}
      </Typography>
      <View style={styles.valueContainer}>
        <Typography variant="metricLg" color={Theme.colors.primary}>
          {value}
        </Typography>
        <Typography variant="metricSm" color={Theme.colors.onSurfaceVariant} style={styles.unit}>
          {unit}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderColor: 'rgba(197, 198, 202, 0.3)', // outlineVariant/30
    borderWidth: 1,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.sm,
    justifyContent: 'space-between',
    aspectRatio: 1, // square as in bento grid
  },
  valueContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Theme.spacing.base,
  },
  unit: {
    marginLeft: 2,
  },
});
