import React from 'react';
import { View, Text } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
      }}
    >
      {icon && <View style={{ marginBottom: spacing.md }}>{icon}</View>}
      <Text
        style={{
          fontSize: 20,
          fontWeight: '600',
          color: colors.text,
          textAlign: 'center',
          marginBottom: spacing.sm,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}
        >
          {description}
        </Text>
      )}
    </View>
  );
}
