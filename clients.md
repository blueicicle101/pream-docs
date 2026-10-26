---
title: Connecting IPTV Players
description: Step-by-step instructions for connecting TiviMate, IPTV Smarters Pro, Apple TV, and VLC to Pream.
---

# 📺 Connecting IPTV Players

Pream provides standard **Xtream Codes API** and **M3U Plus** output endpoints. Any modern IPTV media player can connect to Pream just as it would connect to a standard upstream provider.

---

## 🔗 Output Gateway Connection Formats

Replace `http://192.168.1.100:8000` with your Pream server's actual IP address or domain name.

### 1. Xtream Codes API Format (Recommended)
This is the cleanest and fastest format, supporting full category trees, live EPG, VOD posters, and TV series season/episode browsing.

| Parameter | Value | Example |
| :--- | :--- | :--- |
| **Server URL** | `http://<SERVER_IP>:<PORT>` | `http://192.168.1.100:8000` |
| **Username** | `OUTPUT_USERNAME` | `pream` |
| **Password** | `OUTPUT_PASSWORD` | `pream` |

### 2. M3U Plus Playlist Format
Used for players that only support raw M3U playlist URLs:

```text
http://<SERVER_IP>:<PORT>/get.php?username=pream&password=pream&type=m3u_plus&output=ts
```

*Options:*
- `output=ts` (default MPEG-TS stream container)
- `output=m3u8` (HLS container format)

### 3. XMLTV Electronic Program Guide (EPG) URL
If your player requests an explicit EPG source URL:

```text
http://<SERVER_IP>:<PORT>/xmltv.php?username=pream&password=pream
```

---

## 📱 App Setup Guides

### 1. TiviMate (Android TV / FireStick)

TiviMate is the gold standard for Android TV and FireStick devices.

1. Open **TiviMate** and select **Add Playlist**.
2. Select **Xtream Codes**.
3. Enter the connection parameters:
   - **Server address**: `http://<YOUR_IP>:8000`
   - **Username**: Your `OUTPUT_USERNAME` (e.g. `pream`)
   - **Password**: Your `OUTPUT_PASSWORD` (e.g. `pream`)
4. Check **Include VOD** (Movies & Series).
5. Click **Next** and allow TiviMate to process channels and EPG.

> [!TIP]
> In TiviMate settings, enable **Auto-update playlist on app start** and set EPG update interval to **Every 24 hours**.

---

### 2. IPTV Smarters Pro (iOS, Android, Windows, Mac, Smart TVs)

1. Launch **IPTV Smarters Pro**.
2. Click **Add User** and choose **Login with Xtream Codes API**.
3. Fill in the fields:
   - **Any Name**: `Pream Gateway`
   - **Username**: Your `OUTPUT_USERNAME`
   - **Password**: Your `OUTPUT_PASSWORD`
   - **Server URL**: `http://<YOUR_IP>:8000`
4. Tap **Add User** and select your profile.

---

### 3. Apple TV (UHF, iSTB, GSE Smart IPTV)

#### Using UHF (Recommended for Apple TV & iOS):
1. Open **UHF** on Apple TV or iPhone.
2. Tap **Add Playlist** > **Xtream Codes API**.
3. Input:
   - **Host**: `http://<YOUR_IP>:8000`
   - **Username**: `OUTPUT_USERNAME`
   - **Password**: `OUTPUT_PASSWORD`
4. Tap **Connect** to load Live TV, Movies, and Series.

---

### 4. VLC Media Player (Desktop & Mobile)

VLC is ideal for quickly testing your playlist from a desktop PC:

1. Open VLC Media Player.
2. Go to **Media** > **Open Network Stream...** (or press `Ctrl+N` / `Cmd+K`).
3. Paste your Pream M3U URL:
   ```text
   http://192.168.1.100:8000/get.php?username=pream&password=pream&type=m3u_plus&output=ts
   ```
4. Click **Play**. Open the playlist sidebar (`Ctrl+L`) to browse channels.

---

## ⚡ Direct Provider URLs vs. HTTP 302 Redirects

- **M3U Playlists**: Pream writes the direct upstream provider URLs into the `#EXTINF` stream lines whenever available. This allows older Smart TVs and players with strict 302 redirect limits to stream directly with zero friction.
- **Xtream API Gateway**: Requests sent to `/live/...`, `/movie/...`, or `/series/...` issue instant `HTTP 302 Found` headers redirecting the player to the upstream stream.
