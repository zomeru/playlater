import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, type ViewStyle } from 'react-native';
import { colors, radius } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<string, ViewStyle> = {
  primary: { backgroundColor: colors.accent },
  secondary: {
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructive: { backgroundColor: colors.danger },
  ghost: { backgroundColor: 'transparent' },
};

const textColors: Record<string, string> = {
  primary: colors.white,
  secondary: colors.text,
  destructive: colors.white,
  ghost: colors.accent,
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: radius.md,
        opacity: disabled ? 0.5 : 1,
        ...variantStyles[variant],
        ...(fullWidth ? { width: '100%' as const } : {}),
      }}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} />
      ) : (
        <>
          {icon}
          <Text style={{ fontSize: 16, fontWeight: '600', color: textColors[variant] }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
