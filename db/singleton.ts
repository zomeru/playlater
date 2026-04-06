import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function setDatabase(database: SQLite.SQLiteDatabase) {
  db = database;
}

export function getDatabase(): SQLite.SQLiteDatabase | null {
  return db;
}
