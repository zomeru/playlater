import { create } from 'zustand';
import { getDatabase } from '@/db/singleton';
import {
  fetchItems,
  addItem,
  updateItem,
  deleteItem,
  toggleWatched,
  searchItems,
  type WatchLaterItem as DbWatchLaterItem,
} from '@/db/queries';

export interface WatchLaterItem {
  id: string;
  title: string;
  platform: string;
  url: string | null;
  notes: string;
  watched: boolean;
  created_at: string;
}

function normalizeItem(item: DbWatchLaterItem): WatchLaterItem {
  return { ...item, watched: Boolean(item.watched) };
}

interface ItemsState {
  items: WatchLaterItem[];
  loading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: {
    title: string;
    platform: string;
    url: string | null;
    notes?: string;
  }) => Promise<void>;
  updateItem: (
    id: string,
    updates: Partial<Pick<WatchLaterItem, 'title' | 'platform' | 'url' | 'notes' | 'watched'>>
  ) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleWatched: (id: string) => Promise<void>;
  searchItems: (query: string) => Promise<WatchLaterItem[]>;
}

export const useItemsStore = create<ItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const db = getDatabase();
      if (!db) {
        set({ loading: false });
        return;
      }
      const items = await fetchItems(db);
      set({ items: items.map(normalizeItem), loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  addItem: async (item) => {
    try {
      const db = getDatabase();
      if (!db) return;
      await addItem(db, { ...item, notes: item.notes || '' });
      await get().fetchItems();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  updateItem: async (id, updates) => {
    try {
      const db = getDatabase();
      if (!db) return;
      const { watched, ...rest } = updates;
      const dbUpdates: Partial<DbWatchLaterItem> = { ...rest };
      if (typeof watched === 'boolean') {
        dbUpdates.watched = watched ? 1 : 0;
      }
      await updateItem(db, id, dbUpdates);
      await get().fetchItems();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  deleteItem: async (id) => {
    try {
      const db = getDatabase();
      if (!db) return;
      await deleteItem(db, id);
      await get().fetchItems();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  toggleWatched: async (id) => {
    try {
      const db = getDatabase();
      if (!db) return;
      await toggleWatched(db, id);
      await get().fetchItems();
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  searchItems: async (query) => {
    const db = getDatabase();
    if (!db) return [];
    const items = await searchItems(db, query);
    return items.map(normalizeItem);
  },
}));
