---
title: Managing Upstream Sources
description: Complete guide on configuring Xtream and M3U sources, testing provider accounts, and configuring multi-threaded sync.
---

# 📥 Managing Sources

Pream allows you to connect multiple upstream IPTV providers, merge their catalogs, normalize their metadata, and configure priority-based failover.

Navigate to **Sources** (`/sources`) in the top navigation bar to view and manage your providers.

---

## 🔌 Supported Input Source Types

### 1. Xtream Codes API
Xtream Codes is the industry standard for IPTV providers. It offers structured JSON endpoints for Live TV, VOD Movies, TV Series, and account information.

**Required Configuration:**
- **Source Name**: A human-readable identifier (e.g. `MegaIPTV`, `BackupStream`).
- **Provider URL**: Base server address (e.g. `http://provider.example.com:8080`). Pream automatically trims trailing slashes and handles subpaths.
- **Username & Password**: Your provider credentials.
- **Content Types**: Choose which catalogs to ingest:
  - `Live TV`
  - `VOD Movies`
  - `TV Series`
- **Priority**: Integer value (lower number = higher priority). Used when multiple providers offer the same stream or category.
- **User-Agent (Optional)**: Set a sticky User-Agent if your provider pins accounts to specific client strings (e.g. `IPTVSmartersPro/2.2.2`). Leave blank for Pream to rotate realistic media player user-agents automatically.

---

### 2. M3U / M3U8 Playlists
Used for providers or custom sources providing an M3U or M3U8 web playlist.

**Required Configuration:**
- **Source Name**: Identifier for the playlist.
- **Playlist URL**: Direct HTTP/HTTPS link to the `.m3u` or `.m3u8` file.
- **Content Types**: Ingests Live TV streams and associated metadata (`tvg-id`, `tvg-name`, `tvg-logo`, `group-title`).

---

## 🧪 Built-In "Test Source" Feature

Before saving or updating a provider, you can verify connectivity, credentials, and account details in real-time.

1. Open the **Add Source** or **Edit Source** modal.
2. Fill in the provider URL and credentials.
3. Click the **Test Source** button.

```
┌─────────────────────────────────────────────────────────────┐
│ Connection & Account Test                 [ Test Source ]  │
├─────────────────────────────────────────────────────────────┤
│ 🟢 Account Active (Verified in 320ms)                       │
│ • Status: Active (Trial / Premium)                          │
│ • Expiration: 2026-12-31 23:59 UTC (142 days remaining)    │
│ • Max Connections: 2 (Active connections: 0)                │
└─────────────────────────────────────────────────────────────┘
```

Pream authenticates directly with upstream `player_api.php`, inspects the account status, and displays:
- **Authentication Result**: Validates credentials without saving invalid accounts.
- **Expiry Badge**: Shows exact days remaining and formatted expiration timestamp on hover.
- **Max Connections**: Displays your provider's simultaneous stream allowance.

---

## 🔄 Parallel Background Refresh Engine

Ingesting large providers with tens of thousands of channels, movies, and episodes can take time. Pream is built to handle this seamlessly in the background without freezing the UI or interrupting active streams.

### Architecture Highlights:
1. **Parallel Worker Threads (`SOURCE_SCAN_THREADS`)**:
   - Configured in `.env` (default: `SOURCE_SCAN_THREADS=2`).
   - Multiple sources are scanned concurrently in background threads.
2. **In-Memory Rule Filtering**:
   - Active rules are applied directly in memory *while building* stream objects prior to database insertion.
   - Hidden channels or excluded categories are filtered before they touch SQLite, minimizing disk I/O.
3. **Database Concurrency Lock**:
   - Write operations are protected by a dedicated write lock to prevent SQLite busy conflicts during high-volume ingestions.
4. **Multi-Worker Task Progress Bar**:
   - The status bar in the footer tracks multiple parallel worker progress bars side-by-side during multi-threaded refresh, displaying each worker's active item counts and completion percentage.

---

## 🗑️ Safe Source Removal with Catalog Purge Warning

When you remove a configured source from Pream:
- Pream queries the database and displays a **Catalog Breakdown Warning Modal** before deletion.
- The modal calculates and details the exact number of **Live Channels**, **VOD Movies**, and **TV Series** associated with the source.
- Confirming the deletion safely cascades and purges all associated catalog records and cached media from SQLite, keeping your library completely clean without orphan entries.

---

## ⏱️ Scheduling Automatic Refreshes

Automatic sync schedules are defined via standard 5-field cron syntax:
- Configure in `.env` using `REFRESH_CRON=0 4 * * *` (default: 4:00 AM daily).
- Or change it at runtime under **Settings** > **Automated Refresh Schedule**.

You can also trigger an immediate sync at any time by going to **Settings** > **Actions** and clicking **Refresh Sources**.
