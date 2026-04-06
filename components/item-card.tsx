import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from './ui/badge';
import { colors, radius, spacing } from '@/constants/theme';
import { type Platform } from '@/constants/platforms';
import { formatRelativeTime } from '@/utils/format';

interface ItemCardProps {
  id: string;
  title: string;
  platform: string;
  watched: boolean;
  created_at: string;
  onPress?: () => void;
}

export function ItemCard({ id, title, platform, watched, created_at, onPress }: ItemCardProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/item/${id}` as any);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.container, watched && styles.containerWatched]}
      activeOpacity={0.6}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Badge platform={platform as Platform} />
          {watched && (
            <View style={styles.watchedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.watchedText}>Watched</Text>
            </View>
          )}
        </View>
        <Text style={[styles.title, watched && styles.titleWatched]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.time}>{formatRelativeTime(created_at)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  containerWatched: {
    opacity: 0.6,
    backgroundColor: colors.backgroundSecondary,
  },
  content: { flex: 1, gap: spacing.xs },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  watchedBadge: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  watchedText: { fontSize: 11, color: colors.success, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '400', color: colors.text },
  titleWatched: { textDecorationLine: 'line-through', color: colors.textSecondary },
  time: { fontSize: 12, fontWeight: '400', color: colors.textTertiary },
});
