import * as SQLite from 'expo-sqlite';
import {
  WATCH_LATER_TABLE,
  WATCH_LATER_INDEXES,
  RECENT_SEARCHES_TABLE,
  RECENT_SEARCHES_INDEXES,
} from './schema';

export async function initializeDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    ${WATCH_LATER_TABLE}
    ${WATCH_LATER_INDEXES.join('\n')}
    ${RECENT_SEARCHES_TABLE}
    ${RECENT_SEARCHES_INDEXES.join('\n')}
  `);
}
