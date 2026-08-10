import React from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { Theme } from '../../theme/Theme';
import { Typography } from '../../components/ui/Typography';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  
  return (
    <View style={styles.container}>
      <Typography variant="headlineLg" color={Theme.colors.primary}>Profile</Typography>
      <View style={{ marginTop: 20 }}>
        <Button title="Sign Out" onPress={signOut} color={Theme.colors.secondary} />
      </View>
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
