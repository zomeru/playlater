import { ItemCard } from '@/components/item-card';
import { EmptyState } from '@/components/ui/empty-state';
import { FAB } from '@/components/ui/fab';
import { SwipeableItem } from '@/components/ui/swipeable-item';
import { PLATFORM_CONFIG, type Platform as PlatformType } from '@/constants/platforms';
import { colors, radius, spacing } from '@/constants/theme';
import { useItemsStore } from '@/stores/items-store';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type DateRange = 'all' | 'today' | 'week' | 'month';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, loading, fetchItems, deleteItem, toggleWatched } = useItemsStore();
  const [platformFilter, setPlatformFilter] = useState<PlatformType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<DateRange>('all');

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const onRefresh = useCallback(() => {
    fetchItems();
  }, [fetchItems]);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Delete Item', `Delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
    ]);
  };

  const filteredItems = useMemo(() => {
    const now = new Date();
    return items.filter((item) => {
      if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
      if (dateFilter !== 'all') {
        const itemDate = new Date(item.created_at);
        const diffMs = now.getTime() - itemDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (dateFilter === 'today' && diffDays > 1) return false;
        if (dateFilter === 'week' && diffDays > 7) return false;
        if (dateFilter === 'month' && diffDays > 30) return false;
      }
      return true;
    });
  }, [items, platformFilter, dateFilter]);

  const platforms: (PlatformType | 'all')[] = [
    'all',
    ...(Object.keys(PLATFORM_CONFIG) as PlatformType[]),
  ];
  const hasItems = items.length > 0;

  const renderItem = ({ item }: { item: (typeof items)[number] }) => (
    <SwipeableItem
      onWatched={() => toggleWatched(item.id)}
      onDelete={() => handleDelete(item.id, item.title)}
    >
      <ItemCard
        id={item.id}
        title={item.title}
        platform={item.platform}
        watched={item.watched}
        created_at={item.created_at}
      />
    </SwipeableItem>
  );

  if (loading && items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Platform.OS !== 'web' ? insets.top : 0, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Play Later</Text>
        {hasItems && (
          <Text style={styles.subtitle}>
            {filteredItems.length} of {items.length} item{items.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterBar}
        >
          {platforms.map((p) => {
            const isActive = platformFilter === p;
            const config = p === 'all' ? null : PLATFORM_CONFIG[p];
            return (
              <TouchableOpacity
                key={p}
                onPress={() => hasItems && setPlatformFilter(p)}
                disabled={!hasItems}
                style={[
                  styles.chip,
                  isActive &&
                    hasItems && {
                      backgroundColor: config ? `${config.color}15` : colors.accentLight,
                      borderColor: config ? config.color : colors.accent,
                    },
                  !hasItems && styles.chipDisabled,
                ]}
              >
                {config && (
                  <View
                    style={[
                      styles.chipDot,
                      { backgroundColor: hasItems ? config.color : colors.textTertiary },
                    ]}
                  />
                )}
                <Text
                  style={[
                    styles.chipText,
                    isActive &&
                      hasItems && {
                        color: config ? config.color : colors.accent,
                        fontWeight: '600',
                      },
                    !hasItems && styles.chipTextDisabled,
                  ]}
                >
                  {p === 'all' ? 'All' : config?.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.dateFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateFilterBar}
        >
          {(['all', 'today', 'week', 'month'] as DateRange[]).map((d) => {
            const isActive = dateFilter === d;
            const labels: Record<DateRange, string> = {
              all: 'All',
              today: 'Today',
              week: 'This Week',
              month: 'This Month',
            };
            return (
              <TouchableOpacity
                key={d}
                onPress={() => hasItems && setDateFilter(d)}
                disabled={!hasItems}
                style={[
                  styles.dateChip,
                  isActive && hasItems && { backgroundColor: colors.accent },
                  !hasItems && styles.dateChipDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.dateChipText,
                    isActive && hasItems && { color: colors.white },
                    !hasItems && styles.dateChipTextDisabled,
                  ]}
                >
                  {labels[d]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {!hasItems ? (
        <EmptyState
          title="Nothing saved yet"
          description="Save videos, shows, and movies to watch later. Tap + to add your first item."
          icon={<Ionicons name="bookmark-outline" size={48} color={colors.textTertiary} />}
        />
      ) : filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.list}>
          <EmptyState
            title="No items match filters"
            description="Try adjusting your platform or date range filters."
            icon={<Ionicons name="filter-outline" size={48} color={colors.textTertiary} />}
          />
        </View>
      )}

      <FAB onPress={() => router.push('/add')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 2 },
  filterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundTertiary,
  },
  chipDisabled: { opacity: 0.4 },
  chipDot: { width: 6, height: 6, borderRadius: 3 },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextDisabled: { color: colors.textTertiary },
  dateFilterContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateFilterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  dateChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundTertiary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipDisabled: { opacity: 0.4 },
  dateChipText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  dateChipTextDisabled: { color: colors.textTertiary },
  list: { padding: spacing.md, paddingBottom: 100, flex: 1 },
});
