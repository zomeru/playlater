import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '@/constants/theme';
import { PLATFORM_CONFIG, type Platform as PlatformType } from '@/constants/platforms';
import Constants from 'expo-constants';
import { useItemsStore } from '@/stores/items-store';
import { useSearchStore } from '@/stores/search-store';
import { seedDatabase } from '@/db/seed';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [autoOpen, setAutoOpen] = useState(false);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [defaultPlatform, setDefaultPlatform] = useState<PlatformType>('other');
  const [seeding, setSeeding] = useState(false);
  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const { fetchItems } = useItemsStore();
  const { fetchRecent } = useSearchStore();
  const isDev = __DEV__;

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
        <Text style={styles.title}>Settings</Text>
      </View>

      <Text style={styles.sectionTitle}>Preferences</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            Alert.alert(
              'Default Platform',
              'Choose a default platform for new items:',
              (Object.keys(PLATFORM_CONFIG) as PlatformType[]).map((key) => ({
                text: PLATFORM_CONFIG[key].name,
                onPress: () => setDefaultPlatform(key),
              }))
            );
          }}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
              <Ionicons name="grid-outline" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Default Platform</Text>
              <Text style={styles.settingValue}>{PLATFORM_CONFIG[defaultPlatform].name}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.successLight }]}>
              <Ionicons name="open-outline" size={20} color={colors.success} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.settingTitle}>Auto-Open Apps</Text>
              <Text style={styles.settingDescription} numberOfLines={2}>
                Automatically open content in their respective apps
              </Text>
            </View>
          </View>
          <Switch
            value={autoOpen}
            onValueChange={setAutoOpen}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
            style={{ flexShrink: 0 }}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="hand-left-outline" size={20} color={colors.warning} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.settingTitle}>Haptic Feedback</Text>
              <Text style={styles.settingDescription}>Vibrate on interactions</Text>
            </View>
          </View>
          <Switch
            value={hapticFeedback}
            onValueChange={setHapticFeedback}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
            style={{ flexShrink: 0 }}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Integrations</Text>
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() =>
            Alert.alert(
              'Coming Soon',
              'Tavily search integration will allow you to discover new content to save. Stay tuned!',
              [{ text: 'OK' }]
            )
          }
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="search-outline" size={20} color="#7C3AED" />
            </View>
            <View>
              <Text style={styles.settingTitle}>Tavily Search</Text>
              <Text style={styles.settingDescription}>Discover content to save (Coming Soon)</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {isDev && (
        <>
          <Text style={styles.sectionTitle}>Development</Text>
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.settingRow}
              disabled={seeding}
              onPress={async () => {
                Alert.alert(
                  'Seed Database',
                  'This will delete all existing data and add 30 sample items. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Seed',
                      style: 'default',
                      onPress: async () => {
                        setSeeding(true);
                        try {
                          const count = await seedDatabase();
                          await fetchItems();
                          await fetchRecent();
                          Alert.alert('Done', `Seeded ${count} items`);
                        } catch {
                          Alert.alert('Error', 'Failed to seed database');
                        }
                        setSeeding(false);
                      },
                    },
                  ]
                );
              }}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.accentLight }]}>
                  <Ionicons name="server-outline" size={20} color={colors.accent} />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Seed Database</Text>
                  <Text style={styles.settingDescription}>
                    {seeding ? 'Seeding...' : 'Reset and populate with 30 sample items'}
                  </Text>
                </View>
              </View>
              {seeding ? (
                <Text style={{ fontSize: 13, color: colors.textTertiary }}>...</Text>
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      <Text style={styles.sectionTitle}>About</Text>
      <View style={styles.section}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
              <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
            </View>
            <View>
              <Text style={styles.settingTitle}>Version</Text>
              <Text style={styles.settingValue}>{appVersion}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>PlayLater</Text>
        <Text style={styles.footerSubtext}>Your watch-later hub</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: spacing.xl },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  title: { fontSize: 28, fontWeight: '700', color: colors.text },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    minHeight: 56,
    gap: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingTitle: { fontSize: 16, fontWeight: '500', color: colors.text },
  settingDescription: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  settingValue: { fontSize: 14, color: colors.textSecondary, marginTop: 1 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 52 },
  footer: { alignItems: 'center', marginTop: spacing.xl, gap: 2 },
  footerText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  footerSubtext: { fontSize: 13, color: colors.textTertiary },
});
