import * as Linking from 'expo-linking';

export async function openContent(url: string | null): Promise<void> {
  if (!url) return;
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}
