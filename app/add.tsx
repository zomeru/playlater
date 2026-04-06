import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform as RNPlatform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useItemsStore } from '@/stores/items-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { colors, spacing, radius } from '@/constants/theme';
import { detectPlatform, type Platform, PLATFORM_CONFIG } from '@/constants/platforms';

export default function AddItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addItem, loading } = useItemsStore();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [platform, setPlatform] = useState<Platform>('other');
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = useCallback((text: string) => {
    setUrl(text);
    if (text.trim()) {
      setPlatform(detectPlatform(text));
    } else {
      setPlatform('other');
    }
  }, []);

  const handleSave = async () => {
    if (!title.trim() && !url.trim()) {
      setError('Please enter a title or URL');
      return;
    }
    try {
      await addItem({
        title: title.trim() || url.trim(),
        platform,
        url: url.trim() || null,
        notes: notes.trim(),
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save item. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={RNPlatform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: RNPlatform.OS !== 'web' ? insets.top : 0 }]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Input
          label="URL (optional)"
          placeholder="https://youtube.com/watch?v=..."
          value={url}
          onChangeText={handleUrlChange}
          keyboardType="url"
          autoCapitalize="none"
          autoComplete="url"
        />
        <Input
          label="Title"
          placeholder="Enter a title for this item"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            setError(null);
          }}
          error={error || undefined}
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Platform</Text>
          <View style={styles.platformGrid}>
            {(Object.keys(PLATFORM_CONFIG) as Platform[]).map((key) => {
              const config = PLATFORM_CONFIG[key];
              const isSelected = platform === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setPlatform(key)}
                  style={[
                    styles.platformChip,
                    isSelected && {
                      backgroundColor: `${config.color}15`,
                      borderColor: config.color,
                    },
                  ]}
                >
                  <View style={[styles.platformDot, { backgroundColor: config.color }]} />
                  <Text
                    style={[
                      styles.platformText,
                      isSelected && { color: config.color, fontWeight: '600' },
                    ]}
                  >
                    {config.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Input
          label="Notes (optional)"
          placeholder="Add a note about this item..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <View style={styles.actions}>
          <Button title="Cancel" variant="secondary" onPress={() => router.back()} fullWidth />
          <Button title="Save" variant="primary" onPress={handleSave} loading={loading} fullWidth />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scroll: { padding: spacing.lg, gap: spacing.md },
  section: { marginBottom: spacing.md },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  platformGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  platformChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  platformDot: { width: 8, height: 8, borderRadius: 4 },
  platformText: { fontSize: 13, color: colors.textSecondary },
  actions: {
    flexDirection: 'column',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingBottom: spacing.md,
  },
});
