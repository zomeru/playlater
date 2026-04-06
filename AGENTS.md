# AGENTS.md — AI Instructions for PlayLater

## Project Overview

PlayLater is an **offline-first, mobile-only** watch-later app built with Expo Router, expo-sqlite, Zustand, and Tailwind CSS v4 (via Uniwind). There is no backend, no auth, and no cloud sync. All data lives in SQLite on-device.

---

## Package Manager

Always use **Bun**, never npm or yarn.

```bash
bun install           # install deps
bun add <pkg>         # add a package
bun expo start        # start dev server
bun run format        # run Prettier
```

---

## Repository Map

```
app/
  _layout.tsx              # Root layout: DB init, GestureHandlerRootView, Stack navigator
  (tabs)/
    _layout.tsx            # Tab bar config (Saved / Search / Settings)
    index.tsx              # Home screen — item list with platform + date filters
    search.tsx             # Search screen — local title/URL search + recent searches
    settings.tsx           # Settings screen — toggles (mostly placeholder)
  add.tsx                  # Add item modal — URL input, auto-detect platform, save
  item/[id].tsx            # Item detail — open URL, toggle watched, delete

components/
  item-card.tsx            # Saved item card (uses useRouter internally)
  ui/
    badge.tsx              # Platform badge (colored pill with dot + name)
    button.tsx             # Button (primary / secondary / destructive / ghost)
    empty-state.tsx        # Empty list illustration with title + description
    fab.tsx                # Floating action button (+ to open /add)
    input.tsx              # Labeled text input with optional error message
    swipeable-item.tsx     # Left-swipe gesture wrapper revealing Watched + Delete
    icon-symbol.ios.tsx    # SF Symbols icon shim (iOS only)

constants/
  platforms.ts             # Platform type, PLATFORM_CONFIG map, detectPlatform()
  theme.ts                 # colors, spacing, radius design tokens

db/
  schema.ts                # SQL CREATE TABLE / INDEX strings only (no logic)
  init.ts                  # initializeDatabase(db) — runs schema via execAsync
  singleton.ts             # Module-level db ref: setDatabase() / getDatabase()
  singleton.web.ts         # Web stub for singleton
  init.web.ts              # Web stub for init
  queries.ts               # All SQLite CRUD functions (native)
  queries.web.ts           # Web stubs for queries
  expo-sqlite.web.js       # Web polyfill shim
  seed.ts                  # Dev-only seed data (not called in production)

stores/
  items-store.ts           # Zustand store for watch_later items
  search-store.ts          # Zustand store for recent searches

types/
  database.ts              # Canonical WatchLaterItem and RecentSearch interfaces

utils/
  deep-links.ts            # openContent(url) — wraps Linking.openURL
  format.ts                # formatRelativeTime(), truncate()

hooks/
  use-color-scheme.ts      # System color scheme hook (native)
  use-color-scheme.web.ts  # Web variant
  use-theme-color.ts       # Resolves a color for light/dark mode
```

---

## TypeScript Types

### Core types (`types/database.ts`)

```typescript
type Platform = 'youtube' | 'netflix' | 'hulu' | 'disney' | 'prime' | 'other';

interface WatchLaterItem {
  id: string;           // hex UUID (randomblob)
  title: string;
  platform: Platform;
  url: string | null;
  notes: string;
  watched: boolean;     // boolean in the store; INTEGER 0/1 in SQLite
  created_at: string;  // ISO datetime string
}

interface RecentSearch {
  id: string;
  query: string;
  created_at: string;
}
```

### Important: two `WatchLaterItem` definitions

There are **two** definitions in use — do not confuse them:

| File | `watched` type | Purpose |
|------|---------------|---------|
| `db/queries.ts` | `number` (0 or 1) | Raw SQLite row shape |
| `stores/items-store.ts` | `boolean` | Normalized store shape |

`normalizeItem()` in `items-store.ts` converts the DB integer to a boolean. **Always use the store type (`boolean`) in components.**

---

## Database Layer (`db/`)

### Singleton pattern

The database is opened asynchronously in `app/_layout.tsx` on mount:

```typescript
const db = await SQLite.openDatabaseAsync('playlater.db');
await initializeDatabase(db);
setDatabase(db);          // stores in module-level ref in db/singleton.ts
```

All store actions call `getDatabase()` first and guard with `if (!db) return`. The DB is not available synchronously — do not assume it exists at module load time.

### Query functions (`db/queries.ts`)

All functions take `db: SQLite.SQLiteDatabase` as the first argument (obtained via `getDatabase()`).

| Function | Description |
|----------|-------------|
| `fetchItems(db)` | All items, `ORDER BY created_at DESC` |
| `addItem(db, {title, platform, url, notes})` | Inserts with `watched = 0` |
| `updateItem(db, id, updates)` | Partial update — only non-undefined fields |
| `deleteItem(db, id)` | Hard delete |
| `toggleWatched(db, id)` | SQL `CASE WHEN watched = 1 THEN 0 ELSE 1 END` |
| `searchItems(db, query)` | `LIKE %query%` on `title` and `url` |
| `getItemById(db, id)` | Single row lookup |
| `addRecentSearch(db, query)` | Deduplicates by query, then inserts, then caps at 20 |
| `fetchRecentSearches(db, limit?)` | Default limit 10, `ORDER BY created_at DESC` |
| `clearRecentSearches(db)` | Deletes all recent search rows |

### Web stubs

`db/queries.web.ts`, `db/init.web.ts`, and `db/singleton.web.ts` are Metro-resolved on web. They return empty arrays / no-ops so the app renders without crashing on web. If you add a query to `queries.ts`, add a matching stub to `queries.web.ts`.

---

## State Management (`stores/`)

### `useItemsStore` — `stores/items-store.ts`

```typescript
interface ItemsState {
  items: WatchLaterItem[];   // normalized (watched: boolean)
  loading: boolean;
  error: string | null;

  fetchItems(): Promise<void>;
  addItem(item: { title, platform, url, notes? }): Promise<void>;
  updateItem(id, updates: Partial<Pick<...>>): Promise<void>;
  deleteItem(id): Promise<void>;
  toggleWatched(id): Promise<void>;
  searchItems(query): Promise<WatchLaterItem[]>;  // does NOT update store.items
}
```

**Mutation pattern**: every mutating action calls the corresponding `db/queries.ts` function, then calls `get().fetchItems()` to re-fetch and update `store.items`. No optimistic updates.

**`searchItems`** is special — it returns results directly without touching `store.items`. The Search screen manages its own local result state.

### `useSearchStore` — `stores/search-store.ts`

```typescript
interface SearchState {
  recentSearches: RecentSearch[];
  loading: boolean;
  fetchRecent(): Promise<void>;
  addRecent(query): Promise<void>;   // deduplicates + caps at 20 via DB
  clearRecent(): Promise<void>;
}
```

---

## Platform Detection

`detectPlatform(url: string): Platform` lives in **`constants/platforms.ts`** (not `utils/`).

Detection is URL substring matching (case-insensitive):

| Match | Platform |
|-------|---------|
| `youtube.com`, `youtu.be` | `youtube` |
| `netflix.com` | `netflix` |
| `hulu.com` | `hulu` |
| `disneyplus.com`, `disneyplus.` | `disney` |
| `primevideo.com`, `amazon.com/video` | `prime` |
| anything else | `other` |

`PLATFORM_CONFIG` maps each platform to `{ name, color, icon }`. The `icon` field contains SF Symbols names (used on iOS only via `icon-symbol.ios.tsx`). Colors are used for badge tints and filter chip highlights.

---

## Navigation

Expo Router file-based routing. Stack navigator wraps everything; tabs are nested inside.

```
Stack
├── (tabs)          headerShown: false
│   ├── index       "Saved"   (bookmark-outline)
│   ├── search      "Search"  (search-outline)
│   └── settings    "Settings" (settings-outline)
├── add             presentation: 'modal', title: "Add to Play Later"
└── item/[id]       title: "Item Details", headerBackTitle: "Back"
```

The root layout sets `unstable_settings = { anchor: '(tabs)' }` so deep-link navigation goes to tabs first.

Navigate to detail: `router.push('/item/${id}')`. Navigate to add: `router.push('/add')`. Go back: `router.back()`.

---

## Components

### `SwipeableItem` — `components/ui/swipeable-item.tsx`

Wraps any child with a left-swipe gesture that reveals two action buttons:
- **Watched** (green, left action) — calls `onWatched()`
- **Delete** (red, right action) — calls `onDelete()`

Only left swipe is implemented (negative `translationX`). Uses `react-native-gesture-handler`'s `Gesture.Pan()` + `GestureDetector` with `Animated.View`. `ACTION_WIDTH = 80`. Requires `GestureHandlerRootView` at the root (already in `app/_layout.tsx`).

Props: `{ children, onWatched: () => void, onDelete: () => void }`

### `ItemCard` — `components/item-card.tsx`

Displays a single saved item row. Uses `useRouter` internally (navigates to `/item/${id}` on press unless `onPress` is overridden).

Props: `{ id, title, platform, watched, created_at, onPress? }`

Watched items render with `opacity: 0.6`, `backgroundColor: colors.backgroundSecondary`, and strikethrough title.

### `Badge` — `components/ui/badge.tsx`

Platform pill badge. Looks up `PLATFORM_CONFIG[platform]` for color and name. Falls back to `PLATFORM_CONFIG.other`.

Props: `{ platform: Platform, size?: 'sm' | 'md' }` — default `'sm'`

### `Button` — `components/ui/button.tsx`

Props: `{ title, onPress, variant?, loading?, disabled?, fullWidth?, icon? }`

Variants: `primary` (blue fill), `secondary` (grey border), `destructive` (red fill), `ghost` (transparent, accent text).

### `Input` — `components/ui/input.tsx`

Labeled text input. Props include `label`, `error` (renders red message below), plus all standard `TextInput` props.

### `FAB` — `components/ui/fab.tsx`

Fixed `+` button at bottom-right. Props: `{ onPress }`.

### `EmptyState` — `components/ui/empty-state.tsx`

Props: `{ title, description, icon? }`

---

## Styling Reality

The codebase uses **`StyleSheet.create`** with constants from `constants/theme.ts` as the primary styling approach. Tailwind `className` via Uniwind is set up but not yet used in existing screens. When editing existing files, match the style of that file. When creating new components, prefer `className` via Taiwind/Uniwind.

Design tokens:

```typescript
// constants/theme.ts
colors.background           // '#FFFFFF'
colors.backgroundSecondary  // '#F8F9FA'  ← page/screen backgrounds
colors.backgroundTertiary   // '#F3F4F6'
colors.text                 // '#1A1A1A'
colors.textSecondary        // '#6B7280'
colors.textTertiary         // '#9CA3AF'
colors.accent               // '#3B82F6'  ← primary blue
colors.accentLight          // '#DBEAFE'
colors.success              // '#10B981'
colors.successLight         // '#D1FAE5'
colors.danger               // '#EF4444'
colors.dangerLight          // '#FEE2E2'
colors.border               // '#E5E7EB'
colors.borderLight          // '#F3F4F6'

spacing.xs = 4, .sm = 8, .md = 16, .lg = 24, .xl = 32, ['2xl'] = 48
radius.sm = 8, .md = 12, .lg = 16, .xl = 20, .full = 9999
```

Platform chip active tint: `${config.color}15` (6% opacity tint via hex).

---

## Path Aliases

`@/` maps to the project root. All internal imports use this alias.

```typescript
import { useItemsStore } from '@/stores/items-store';
import { colors } from '@/constants/theme';
import { detectPlatform } from '@/constants/platforms';
```

---

## Gotchas

1. **`watched` type mismatch** — SQLite stores `0`/`1`; the store normalizes to `boolean`. Never pass a `number` to a component expecting `boolean`. The `normalizeItem()` function in `items-store.ts` handles this.

2. **DB not ready on first render** — `getDatabase()` returns `null` until the async setup in `_layout.tsx` completes. All store actions guard with `if (!db) return`. Don't call DB functions directly from components.

3. **`detectPlatform` is in `constants/platforms.ts`** — not in `utils/`. Import it from there.

4. **`searchItems` doesn't update store state** — it returns results as a Promise. The Search screen (`app/(tabs)/search.tsx`) manages a local `results` state array separately from the store.

5. **`SwipeableItem` only swipes left** — right-to-left reveals the action panel. There is no right-swipe gesture implemented.

6. **`ItemCard` uses `useRouter`** — it is not a pure presentational component despite being in `components/`.

7. **Icons** — `Ionicons` from `@expo/vector-icons` is used everywhere in screens and components. The `icon` field in `PLATFORM_CONFIG` contains SF Symbols names for `icon-symbol.ios.tsx`, which is a separate, iOS-only path.

8. **`Platform` name collision** — React Native exports `Platform` (the OS detection utility). `constants/platforms.ts` exports `Platform` (the union type). In files that need both, alias one: `import { type Platform as PlatformType } from '@/constants/platforms'`.

9. **Web stubs must stay in sync** — after adding a query to `db/queries.ts`, add a matching no-op to `db/queries.web.ts` to prevent Metro bundler errors on web.

---

## Common Task Recipes

### Add a new saved-item field

1. Add column to `WATCH_LATER_TABLE` in `db/schema.ts`
2. Add field to `WatchLaterItem` in `types/database.ts`
3. Update `WatchLaterItem` in `db/queries.ts` and `stores/items-store.ts`
4. Update `addItem` / `updateItem` in `db/queries.ts` to read/write the field
5. Update the store's `addItem` / `updateItem` action if the field needs normalization
6. Expose in UI (add.tsx, item/[id].tsx, item-card.tsx as needed)

### Add a new platform

1. Add the value to the `Platform` union in `types/database.ts` and `constants/platforms.ts`
2. Add a detection rule in `detectPlatform()` in `constants/platforms.ts`
3. Add an entry to `PLATFORM_CONFIG` in `constants/platforms.ts` (name, color, icon)

### Add a new screen

1. Create the file under `app/` following Expo Router conventions
2. Register it in `app/_layout.tsx` (Stack.Screen) or `app/(tabs)/_layout.tsx` (Tabs.Screen)
3. For modals, use `presentation: 'modal'` in Stack.Screen options

### Add a new query

1. Write the async function in `db/queries.ts` (takes `db` as first arg)
2. Add a stub in `db/queries.web.ts` that returns an empty result or no-ops
3. Call it from a Zustand store action (never call `db/queries.ts` directly from components)

---

## What NOT to Add (MVP Scope)

- No backend, API routes, or server functions
- No auth or user accounts
- No cloud sync or remote storage
- No thumbnails or image fetching from network
- No Tavily Search API (placeholder only — `settings.tsx` has the toggle UI but no logic)
- No categories or folders
- No optimistic updates in stores

---

## Testing

No test suite. Verify changes manually in the iOS Simulator (`bun expo start --ios`) or Android Emulator.

---

## Keeping AGENTS.md Up to Date

**After every code change, update this file to reflect what changed.** This file is the primary source of truth for any AI working in this codebase — stale instructions cause incorrect edits.

### What to update and when

| Change made | Section(s) to update |
|-------------|---------------------|
| New file created | Repository Map |
| File deleted or renamed | Repository Map |
| New type / interface added or changed | TypeScript Types |
| New DB column or table | Database Layer — schema + query table |
| New query function | Database Layer — query function table; also add web stub note if applicable |
| Store action added, removed, or changed | State Management — interface block for that store |
| New platform added | Platform Detection — match table + PLATFORM_CONFIG note |
| New component created | Components — add a subsection with props and behavior |
| Component props or behavior changed | Components — update the relevant subsection |
| New screen added | Navigation — update the route tree |
| New design token added | Styling Reality — update the token block |
| New gotcha discovered | Gotchas — append a numbered entry |
| New import alias added | Path Aliases |
| A task recipe changes | Common Task Recipes — update the relevant recipe |
| A constraint is lifted (e.g. cloud sync added) | What NOT to Add — remove or update the entry |

### Rules

- Keep descriptions **concrete and current** — describe what the code actually does, not what was planned.
- If a gotcha is fixed, remove it from the Gotchas list.
- If a file is renamed, update every mention of the old name in this document.
- Do not add aspirational or future-tense content — only document what is implemented.
- After updating this file, do a quick scan of the Repository Map to confirm every file under `app/`, `components/`, `db/`, `stores/`, `utils/`, `constants/`, `hooks/`, and `types/` is listed.
