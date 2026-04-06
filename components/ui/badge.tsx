import React from 'react';
import { View, Text } from 'react-native';
import { PLATFORM_CONFIG, type Platform } from '@/constants/platforms';

interface BadgeProps {
  platform: Platform;
  size?: 'sm' | 'md';
}

export function Badge({ platform, size = 'sm' }: BadgeProps) {
  const config = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.other;
  const px = size === 'sm' ? 8 : 12;
  const py = size === 'sm' ? 3 : 5;
  const fontSize = size === 'sm' ? 11 : 13;

  return (
    <View
      style={{
        backgroundColor: `${config.color}15`,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: px,
        paddingVertical: py,
        borderRadius: 6,
      }}
    >
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: config.color }} />
      <Text
        style={{
          fontSize,
          fontWeight: '600',
          color: config.color,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}
      >
        {config.name}
      </Text>
    </View>
  );
}
