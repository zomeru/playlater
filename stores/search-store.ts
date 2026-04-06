import { create } from 'zustand';
import { getDatabase } from '@/db/singleton';
import {
  addRecentSearch,
  fetchRecentSearches,
  clearRecentSearches,
  type RecentSearch,
} from '@/db/queries';

interface SearchState {
  recentSearches: RecentSearch[];
  loading: boolean;
  fetchRecent: () => Promise<void>;
  addRecent: (query: string) => Promise<void>;
  clearRecent: () => Promise<void>;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  recentSearches: [],
  loading: false,

  fetchRecent: async () => {
    set({ loading: true });
    try {
      const db = getDatabase();
      if (!db) {
        set({ loading: false });
        return;
      }
      const searches = await fetchRecentSearches(db);
      set({ recentSearches: searches, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addRecent: async (query) => {
    try {
      const db = getDatabase();
      if (!db) return;
      await addRecentSearch(db, query);
      await get().fetchRecent();
    } catch {
      // Silently fail
    }
  },

  clearRecent: async () => {
    try {
      const db = getDatabase();
      if (!db) return;
      await clearRecentSearches(db);
      set({ recentSearches: [] });
    } catch {
      // Silently fail
    }
  },
}));
