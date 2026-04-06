import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { colors } from '@/constants/theme';
import { initializeDatabase } from '@/db/init';
import { setDatabase } from '@/db/singleton';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    SystemUI.setBackgroundColorAsync(colors.backgroundSecondary);
    async function setup() {
      try {
        const SQLite = await import('expo-sqlite');
        const db = await SQLite.openDatabaseAsync('playlater.db');
        await initializeDatabase(db);
        setDatabase(db);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    }
    setup();
  }, []);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.backgroundSecondary },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="add"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Add to Play Later',
              headerStyle: { backgroundColor: colors.backgroundSecondary },
            }}
          />
          <Stack.Screen
            name="item/[id]"
            options={{
              title: 'Item Details',
              headerBackTitle: 'Back',
              headerStyle: { backgroundColor: colors.backgroundSecondary },
            }}
          />
        </Stack>
        <StatusBar style="auto" backgroundColor={colors.white} />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
