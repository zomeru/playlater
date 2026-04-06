import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/theme';

interface FABProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: object;
}

export function FAB({ onPress, icon = 'add', style }: FABProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]} activeOpacity={0.8}>
      <Ionicons name={icon} size={28} color={colors.white} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 8,
  },
});
