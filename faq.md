---
title: Frequently Asked Questions & Troubleshooting
description: Solutions for common IPTV setup questions, database locking, player 302 redirect issues, and provider errors.
---

# ❓ Frequently Asked Questions & Troubleshooting

---

## 🔒 Playback & Client Issues

### Why does my Smart TV app fail to play streams or get stuck on a black screen?
**Cause:**
Many older native Smart TV players (such as Samsung Tizen or LG webOS players) have difficulty resolving `HTTP 302 Found` redirects or reject them when transitioning from HTTP to HTTPS upstream feeds. Additionally, some providers reject connections if the TV player reveals its own native User-Agent during the redirect.

**Solutions in Pream:**
1. **Use M3U Output**: Pream automatically embeds direct upstream provider URLs in the M3U playlist format (`/get.php?type=m3u_plus`), bypassing HTTP 302 redirects altogether.
2. **Use TiviMate or IPTV Smarters Pro**: Modern players running on Android TV, Apple TV, or FireStick resolve redirects natively without issues.

---

### Why does clicking a TV Series show "No episodes found"?
**Cause:**
Some Xtream providers store series information separately and require an explicit `action=get_series_info&series_id=...` API call with a valid IPTV player User-Agent. If requests are sent without standard player headers, the provider may drop the request or return an empty season list.

**Solutions in Pream:**
Pream includes an on-demand fallback fetcher for the Central Library episodes modal. When you click an episode list, Pream queries the upstream provider with realistic player headers, parses both dictionary and array season formats, and caches the episodes into SQLite.

---

### Why are my streams buffering or stuttering?
**Explanation:**
Pream does **not** proxy video stream data through your server; it uses direct URLs or HTTP 302 redirects so your player streams directly from the provider.
- If a stream buffers, check your client's internet connection or verify the provider's server status using the **Test Source** or **Stream Health Check** features in Pream.
- If one provider is slow, run the **Stream Health Check** from **Settings** > **Actions** to automatically promote faster providers to Priority `#1`.

---

## 🗄️ Database & Ingestion

### What should I do if I see `database is locked` during a large source refresh?
**Explanation:**
SQLite supports concurrent readers but only one active writer at a time. When refreshing sources with 50,000+ streams, bulk database write operations occur.

**How Pream Handles This:**
1. **WAL Mode**: Pream configures `PRAGMA journal_mode = WAL` and `PRAGMA busy_timeout = 30000`, allowing readers (IPTV clients and UI page views) to proceed concurrently without blocking.
2. **Visual Ingestion Overlay**: If you navigate to the Rules page while an ingestion is writing to the database, Pream displays a friendly *"Database Ingestion in Progress"* card with an automatic retry countdown rather than returning an HTTP 500 error.
3. **Database Concurrency Lock**: Background ingestion tasks are synchronized with a dedicated lock to ensure operations never collide.

---

## 🛡️ Authentication & Providers

### Upstream provider returns HTTP 401 or 403. How can I fix this?
1. Open **Sources** and click the **Edit** icon for the provider.
2. Verify that your username, password, and provider server URL are entered correctly without extra spaces.
3. Click the **Test Source** button to view the exact error returned by the provider.
4. If your provider blocks specific client headers, try configuring a **Sticky User-Agent** (such as `IPTVSmartersPro/2.2.2` or `TiviMate/4.7.0`) in the source settings.

---

### How do I reset my Web UI admin password?
Your admin login credentials are controlled by the `.env` file:
1. Open `.env` in any text editor.
2. Update `ADMIN_USERNAME` and `ADMIN_PASSWORD`:
   ```ini
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=my_new_secret_password
   ```
3. Restart Pream:
   - **Docker**: `docker compose restart pream`
   - **Python**: Restart your terminal process or `python run_server.py`.

---

### How do I change the credentials my IPTV players use?
In your `.env` file, change:
```ini
OUTPUT_USERNAME=myclient
OUTPUT_PASSWORD=mystreamkey
```
Restart the server, then update the login details in your IPTV app (TiviMate, Smarters, etc.).
