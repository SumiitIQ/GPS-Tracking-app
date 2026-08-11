import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Theme } from '../../theme/Theme';

interface TypographyProps extends TextProps {
  variant?: keyof typeof Theme.typography;
  color?: string;
  children: React.ReactNode;
}

export function Typography({ variant = 'bodyMd', color = Theme.colors.onSurface, style, children, ...props }: TypographyProps) {
  const typoStyle = Theme.typography[variant];
  return (
    <Text style={[typoStyle, { color }, style]} {...props}>
      {children || ' '}
    </Text>
  );
}
