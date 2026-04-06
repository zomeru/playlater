import { getDatabase } from '@/db/singleton';
import { addItem } from '@/db/queries';

const SAMPLE_ITEMS = [
  {
    title: 'React Native Performance Tips 2024',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    notes: 'Great optimization techniques',
  },
  {
    title: 'Building Apps with Expo Router v4',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=abc123',
    notes: '',
  },
  {
    title: 'SQLite vs Realm for Mobile Apps',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=def456',
    notes: 'Compare for future projects',
  },
  {
    title: 'TypeScript Advanced Patterns',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=ghi789',
    notes: '',
  },
  {
    title: 'UI Animation Masterclass',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=jkl012',
    notes: 'Reanimated examples',
  },
  {
    title: 'Stranger Things S5E1',
    platform: 'netflix',
    url: 'https://netflix.com/title/80057281',
    notes: 'Season finale',
  },
  {
    title: 'The Crown - Full Series',
    platform: 'netflix',
    url: 'https://netflix.com/title/80025678',
    notes: '',
  },
  {
    title: 'Black Mirror: USS Callister',
    platform: 'netflix',
    url: 'https://netflix.com/title/80145678',
    notes: 'Favorite episode',
  },
  {
    title: 'Squid Game Season 2',
    platform: 'netflix',
    url: 'https://netflix.com/title/81234567',
    notes: '',
  },
  {
    title: 'The Witcher: Blood Origin',
    platform: 'netflix',
    url: 'https://netflix.com/title/80987654',
    notes: 'Prequel series',
  },
  {
    title: 'The Bear S3E5',
    platform: 'hulu',
    url: 'https://hulu.com/watch/the-bear',
    notes: 'Intense episode',
  },
  {
    title: 'Only Murders in the Building',
    platform: 'hulu',
    url: 'https://hulu.com/watch/only-murders',
    notes: '',
  },
  {
    title: 'Shogun - Complete Series',
    platform: 'hulu',
    url: 'https://hulu.com/watch/shogun',
    notes: 'Historical drama',
  },
  {
    title: "The Handmaid's Tale Final Season",
    platform: 'hulu',
    url: 'https://hulu.com/watch/handmaids',
    notes: '',
  },
  { title: 'Fargo Season 5', platform: 'hulu', url: 'https://hulu.com/watch/fargo', notes: '' },
  {
    title: 'Andor Season 2',
    platform: 'disney',
    url: 'https://disneyplus.com/series/andor',
    notes: 'Star Wars series',
  },
  {
    title: 'The Mandalorian S4',
    platform: 'disney',
    url: 'https://disneyplus.com/series/mandalorian',
    notes: '',
  },
  {
    title: 'Loki Season 3 Announcement',
    platform: 'disney',
    url: 'https://disneyplus.com/series/loki',
    notes: 'Wait for release',
  },
  {
    title: 'Ahsoka - Complete',
    platform: 'disney',
    url: 'https://disneyplus.com/series/ahsoka',
    notes: '',
  },
  {
    title: 'X-Men 97 Episodes',
    platform: 'disney',
    url: 'https://disneyplus.com/series/xmen-97',
    notes: 'Animated series',
  },
  {
    title: 'The Boys Season 5',
    platform: 'prime',
    url: 'https://primevideo.com/detail/the-boys',
    notes: 'Final season',
  },
  {
    title: 'Fallout TV Series',
    platform: 'prime',
    url: 'https://primevideo.com/detail/fallout',
    notes: 'Game adaptation',
  },
  {
    title: 'Reacher Season 3',
    platform: 'prime',
    url: 'https://primevideo.com/detail/reacher',
    notes: '',
  },
  {
    title: 'Invincible Animated S3',
    platform: 'prime',
    url: 'https://primevideo.com/detail/invincible',
    notes: '',
  },
  {
    title: 'The Lord of the Rings: Rings of Power',
    platform: 'prime',
    url: 'https://primevideo.com/detail/rings-of-power',
    notes: 'Season 2',
  },
  {
    title: 'TED Talk: The Power of Vulnerability',
    platform: 'other',
    url: 'https://ted.com/talks/vulnerability',
    notes: 'Inspiring talk',
  },
  {
    title: 'MasterClass: Cooking Fundamentals',
    platform: 'other',
    url: 'https://masterclass.com/cooking',
    notes: '',
  },
  {
    title: 'Coursera: Machine Learning Specialization',
    platform: 'other',
    url: 'https://coursera.org/learn/machine-learning',
    notes: 'Andrew Ng course',
  },
  {
    title: 'Vimeo: Short Film The Present',
    platform: 'other',
    url: 'https://vimeo.com/thepresent',
    notes: 'Award-winning short',
  },
  {
    title: 'Twitch VOD: Speedrun Marathon',
    platform: 'other',
    url: 'https://twitch.tv/videos/speedrun',
    notes: '',
  },
];

export async function seedDatabase(): Promise<number> {
  const db = getDatabase();
  if (!db) return 0;

  await db.execAsync('DELETE FROM watch_later');
  await db.execAsync('DELETE FROM recent_searches');

  let count = 0;
  for (const item of SAMPLE_ITEMS) {
    try {
      await addItem(db, { ...item, notes: item.notes || '' });
      count++;
    } catch {
      // skip
    }
  }
  return count;
}
