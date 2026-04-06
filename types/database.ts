export type Platform = 'youtube' | 'netflix' | 'hulu' | 'disney' | 'prime' | 'other';

export interface WatchLaterItem {
  id: string;
  title: string;
  platform: Platform;
  url: string | null;
  notes: string;
  watched: boolean;
  created_at: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  created_at: string;
}
