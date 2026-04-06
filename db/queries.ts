import * as SQLite from 'expo-sqlite';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WatchLaterItem {
  id: string;
  title: string;
  platform: string;
  url: string | null;
  notes: string;
  watched: number; // 0 or 1 in DB
  created_at: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  created_at: string;
}

// ─── Watch Later Items ───────────────────────────────────────────────────────

export async function fetchItems(db: SQLite.SQLiteDatabase): Promise<WatchLaterItem[]> {
  return await db.getAllAsync<WatchLaterItem>('SELECT * FROM watch_later ORDER BY created_at DESC');
}

export async function addItem(
  db: SQLite.SQLiteDatabase,
  item: { title: string; platform: string; url: string | null; notes: string }
): Promise<void> {
  await db.runAsync(
    'INSERT INTO watch_later (title, platform, url, notes, watched) VALUES (?, ?, ?, ?, 0)',
    [item.title, item.platform, item.url, item.notes]
  );
}

export async function updateItem(
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<{
    title: string;
    platform: string;
    url: string | null;
    notes: string;
    watched: number;
  }>
): Promise<void> {
  const setClauses: string[] = [];
  const values: SQLite.SQLiteBindValue[] = [];

  if (updates.title !== undefined) {
    setClauses.push('title = ?');
    values.push(updates.title);
  }
  if (updates.platform !== undefined) {
    setClauses.push('platform = ?');
    values.push(updates.platform);
  }
  if (updates.url !== undefined) {
    setClauses.push('url = ?');
    values.push(updates.url);
  }
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    values.push(updates.notes);
  }
  if (updates.watched !== undefined) {
    setClauses.push('watched = ?');
    values.push(updates.watched);
  }

  if (setClauses.length === 0) return;

  values.push(id);
  await db.runAsync(`UPDATE watch_later SET ${setClauses.join(', ')} WHERE id = ?`, values);
}

export async function deleteItem(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM watch_later WHERE id = ?', [id]);
}

export async function toggleWatched(db: SQLite.SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync(
    'UPDATE watch_later SET watched = CASE WHEN watched = 1 THEN 0 ELSE 1 END WHERE id = ?',
    [id]
  );
}

export async function searchItems(
  db: SQLite.SQLiteDatabase,
  query: string
): Promise<WatchLaterItem[]> {
  const searchTerm = `%${query}%`;
  return await db.getAllAsync<WatchLaterItem>(
    'SELECT * FROM watch_later WHERE title LIKE ? OR url LIKE ? ORDER BY created_at DESC',
    [searchTerm, searchTerm]
  );
}

export async function getItemById(
  db: SQLite.SQLiteDatabase,
  id: string
): Promise<WatchLaterItem | undefined> {
  const rows = await db.getAllAsync<WatchLaterItem>('SELECT * FROM watch_later WHERE id = ?', [id]);
  return rows[0];
}

// ─── Recent Searches ─────────────────────────────────────────────────────────

export async function addRecentSearch(db: SQLite.SQLiteDatabase, query: string): Promise<void> {
  await db.runAsync('DELETE FROM recent_searches WHERE query = ?', [query]);
  await db.runAsync('INSERT INTO recent_searches (query) VALUES (?)', [query]);
  // Keep only last 20 searches
  await db.runAsync(
    `DELETE FROM recent_searches WHERE id NOT IN (
      SELECT id FROM recent_searches ORDER BY created_at DESC LIMIT 20
    )`
  );
}

export async function fetchRecentSearches(
  db: SQLite.SQLiteDatabase,
  limit: number = 10
): Promise<RecentSearch[]> {
  return await db.getAllAsync<RecentSearch>(
    'SELECT * FROM recent_searches ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

export async function clearRecentSearches(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM recent_searches');
}
