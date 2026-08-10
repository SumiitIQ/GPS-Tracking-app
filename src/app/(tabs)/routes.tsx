import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../../theme/Theme';
import { Typography } from '../../components/ui/Typography';

export default function RoutesScreen() {
  return (
    <View style={styles.container}>
      <Typography variant="headlineLg" color={Theme.colors.primary}>Routes</Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
