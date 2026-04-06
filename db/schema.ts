export const WATCH_LATER_TABLE = `
  CREATE TABLE IF NOT EXISTS watch_later (
    id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    title       TEXT    NOT NULL,
    platform    TEXT    NOT NULL DEFAULT 'other',
    url         TEXT    DEFAULT NULL,
    notes       TEXT    DEFAULT '',
    watched     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`;

export const WATCH_LATER_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_wl_created_at ON watch_later(created_at DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_wl_watched ON watch_later(watched);`,
];

export const RECENT_SEARCHES_TABLE = `
  CREATE TABLE IF NOT EXISTS recent_searches (
    id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    query      TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`;

export const RECENT_SEARCHES_INDEXES = [
  `CREATE INDEX IF NOT EXISTS idx_rs_created_at ON recent_searches(created_at DESC);`,
];
