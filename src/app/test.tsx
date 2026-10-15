import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export default function Test() {
  return (
    <View style={{flex: 1}}>
      <Image source={require('../../assets/images/kalsubai.jpg')} style={{width: 200, height: 200}} />
    </View>
  );
}
