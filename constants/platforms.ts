export type Platform = 'youtube' | 'netflix' | 'hulu' | 'disney' | 'prime' | 'other';

export interface PlatformConfig {
  name: string;
  color: string;
  icon: string;
}

export const PLATFORM_CONFIG: Record<Platform, PlatformConfig> = {
  youtube: { name: 'YouTube', color: '#FF0000', icon: 'play.circle.fill' },
  netflix: { name: 'Netflix', color: '#E50914', icon: 'film.fill' },
  hulu: { name: 'Hulu', color: '#1CE783', icon: 'tv.fill' },
  disney: { name: 'Disney+', color: '#113CCF', icon: 'sparkles' },
  prime: { name: 'Prime Video', color: '#00A8E1', icon: 'play.rectangle.fill' },
  other: { name: 'Other', color: '#6B7280', icon: 'link' },
};

export function detectPlatform(url: string): Platform {
  if (!url) return 'other';
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('netflix.com')) return 'netflix';
  if (lower.includes('hulu.com')) return 'hulu';
  if (lower.includes('disneyplus.com') || lower.includes('disneyplus.')) return 'disney';
  if (lower.includes('primevideo.com') || lower.includes('amazon.com/video')) return 'prime';
  return 'other';
}
