import React, { forwardRef } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: object;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerStyle, style, ...props }, ref) => {
    return (
      <View style={{ marginBottom: spacing.md, ...containerStyle }}>
        {label && (
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.textSecondary,
              marginBottom: spacing.xs,
            }}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={{
            backgroundColor: colors.backgroundTertiary,
            borderRadius: radius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.text,
            borderWidth: 1,
            borderColor: error ? colors.danger : colors.border,
            ...(style as object),
          }}
          placeholderTextColor={colors.textTertiary}
          {...props}
        />
        {error && (
          <Text style={{ fontSize: 12, color: colors.danger, marginTop: spacing.xs }}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';
