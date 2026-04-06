import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useItemsStore } from '@/stores/items-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { openContent } from '@/utils/deep-links';
import { colors, spacing, radius } from '@/constants/theme';
import { type Platform as PlatformType } from '@/constants/platforms';
import { Ionicons } from '@expo/vector-icons';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, toggleWatched, deleteItem } = useItemsStore();
  const [item, setItem] = useState<(typeof items)[number] | null>(null);

  useEffect(() => {
    const found = items.find((i) => i.id === id);
    if (found) setItem(found);
  }, [id, items]);

  const handleOpen = async () => {
    if (item?.url) await openContent(item.url);
  };

  const handleToggleWatched = async () => {
    if (!item) return;
    await toggleWatched(item.id);
    setItem((prev) => (prev ? { ...prev, watched: !prev.watched } : null));
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert('Delete Item', `Delete "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteItem(item.id);
          router.back();
        },
      },
    ]);
  };

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>Item not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        { paddingTop: Platform.OS !== 'web' ? insets.top : 0, paddingBottom: insets.bottom },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Badge platform={item.platform as PlatformType} size="md" />
        {item.watched && (
          <View style={styles.watchedRow}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.watchedText}>Watched</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{item.title}</Text>

      {item.url && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>URL</Text>
          <Text style={styles.url} selectable numberOfLines={3}>
            {item.url}
          </Text>
        </View>
      )}

      {item.notes ? (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Notes</Text>
          <Text style={styles.notes}>{item.notes}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Added</Text>
        <Text style={styles.date}>
          {new Date(item.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      <View style={styles.actions}>
        {item.url && (
          <Button
            title="Open in App"
            variant="primary"
            onPress={handleOpen}
            fullWidth
            icon={<Ionicons name="open-outline" size={20} color={colors.white} />}
          />
        )}
        <Button
          title={item.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
          variant="secondary"
          onPress={handleToggleWatched}
          fullWidth
          icon={
            <Ionicons
              name={item.watched ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={item.watched ? colors.textSecondary : colors.success}
            />
          }
        />
        <Button
          title="Delete"
          variant="destructive"
          onPress={handleDelete}
          fullWidth
          icon={<Ionicons name="trash-outline" size={20} color={colors.white} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.lg, gap: spacing.md },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  watchedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  watchedText: { fontSize: 13, color: colors.success, fontWeight: '500' },
  title: { fontSize: 22, fontWeight: '600', color: colors.text, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  url: { fontSize: 14, fontWeight: '400', color: colors.accent },
  notes: { fontSize: 16, fontWeight: '400', color: colors.text, lineHeight: 24 },
  date: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
