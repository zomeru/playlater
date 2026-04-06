// Web stub — no-op for MVP
export interface WatchLaterItem {
  id: string;
  title: string;
  platform: string;
  url: string | null;
  notes: string;
  watched: number;
  created_at: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  created_at: string;
}

export async function fetchItems() {
  return [];
}
export async function addItem() {}
export async function updateItem() {}
export async function deleteItem() {}
export async function toggleWatched() {}
export async function searchItems() {
  return [];
}
export async function getItemById() {
  return undefined;
}
export async function addRecentSearch() {}
export async function fetchRecentSearches() {
  return [];
}
export async function clearRecentSearches() {}
