import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useItemsStore, type WatchLaterItem } from '@/stores/items-store';
import { useSearchStore } from '@/stores/search-store';
import { ItemCard } from '@/components/item-card';
import { EmptyState } from '@/components/ui/empty-state';
import { colors, spacing, radius } from '@/constants/theme';
import { type Platform as PlatformType } from '@/constants/platforms';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<WatchLaterItem[]>([]);
  const { searchItems } = useItemsStore();
  const { recentSearches, fetchRecent, addRecent, clearRecent } = useSearchStore();

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  useEffect(() => {
    if (query.trim()) {
      searchItems(query.trim()).then(setResults);
    } else {
      setResults([]);
    }
  }, [query, searchItems]);

  const handleRecentTap = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      addRecent(searchQuery);
    },
    [addRecent]
  );

  if (query.trim()) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: Platform.OS !== 'web' ? insets.top : 0, paddingBottom: insets.bottom },
        ]}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search saved items..."
            placeholderTextColor={colors.textTertiary}
            autoFocus
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemCard
                id={item.id}
                title={item.title}
                platform={item.platform as PlatformType}
                watched={Boolean(item.watched)}
                created_at={item.created_at}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            title="No results found"
            description={`No items match "${query}"`}
            icon={<Ionicons name="search-outline" size={48} color={colors.textTertiary} />}
          />
        )}
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
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Search saved items..."
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          returnKeyType="search"
        />
      </View>

      {recentSearches.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearRecent}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>
          {recentSearches.map((search) => (
            <TouchableOpacity
              key={search.id}
              style={styles.recentItem}
              onPress={() => handleRecentTap(search.query)}
            >
              <Ionicons name="time-outline" size={18} color={colors.textTertiary} />
              <Text style={styles.recentText}>{search.query}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <EmptyState
          title="Search your items"
          description="Your recent searches will appear here."
          icon={<Ionicons name="time-outline" size={48} color={colors.textTertiary} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 16, color: colors.text },
  list: { padding: spacing.md, paddingTop: 0 },
  section: { paddingHorizontal: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  clearText: { fontSize: 14, color: colors.accent, fontWeight: '500' },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  recentText: { fontSize: 15, color: colors.text },
});
