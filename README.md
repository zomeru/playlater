# PlayLater

An offline-first watch-later hub for mobile. Save YouTube videos, Netflix shows, and other streaming content in one tap — no backend, no auth, no cloud sync.

## Features

- **Add items** — paste a URL or type a title; platform is auto-detected
- **Home list** — scrollable list with platform badge, watched status, and filter chips
- **Filters** — filter by platform and date range (today / week / month / all)
- **Swipe actions** — swipe right to mark watched, swipe left to delete
- **Item detail** — view details, open in app via deep link, mark watched, delete
- **Local search** — search by title/URL with recent search history
- **Settings** — default platform toggle, auto-open toggle
- **Offline persistence** — all data in SQLite, survives restarts

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | Expo (SDK 54) + Expo Router |
| Language | TypeScript |
| Database | expo-sqlite (SQLite, offline-only) |
| State | Zustand |
| Styling | Tailwind CSS v4 + Uniwind |
| Gestures | react-native-gesture-handler + reanimated |
| Package manager | Bun |

## Getting Started

```bash
bun install
bun expo start
```

Open in iOS Simulator, Android Emulator, or Expo Go.

## Project Structure

```
app/                  # Expo Router screens
  (tabs)/             # Tab navigator (Home, Search, Settings)
  add.tsx             # Add item modal
  item/[id].tsx       # Item detail screen
components/
  ui/                 # Reusable primitives (badge, button, fab, input, swipeable)
  item-card.tsx       # Saved item card
constants/            # Design tokens and platform config
db/                   # SQLite schema, init, queries
stores/               # Zustand stores
utils/                # Platform detection, deep links, formatters
docs/
  initial-app/
    planning.md       # Architecture and design decisions
    tasks/            # Task-by-task implementation notes (task-1.md … task-13.md)
```

## Database Schema

Two SQLite tables:

- `watch_later` — saved items (id, title, platform, url, notes, watched, created_at)
- `recent_searches` — search history (id, query, created_at)

Supported platform values: `youtube`, `netflix`, `hulu`, `disney`, `prime`, `other`

## Roadmap (post-MVP)

- Tavily Search API integration for metadata enrichment
- Cloud sync
- Thumbnails / previews
- Categories and folders
