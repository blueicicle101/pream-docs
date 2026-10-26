---
title: Docker & Podman Deployment
description: Comprehensive deployment guide for running Pream in production using Docker, Docker Compose, Rootless Podman, systemd Quadlets, and reverse proxies.
---

# 🐳 Docker & Podman Deployment Guide

Pream is architected to run as a single, lightweight, self-contained container. It requires no external database servers (uses SQLite in WAL mode) and has a minimal memory footprint (~50 MB idle, ~100 MB under heavy parallel sync).

---

## 📋 System Requirements

| Metric | Minimum | Recommended |
|---|---|---|
| **CPU** | 1 vCPU / Core | 2 vCPU / Cores |
| **RAM** | 256 MB | 512 MB – 1 GB |
| **Storage** | 100 MB free space | 1 GB+ (for large catalogs & posters) |
| **Network** | 10 Mbps | 100 Mbps+ (for fast provider syncing) |
| **Container Engine** | Docker 20.10+ / Podman 4.0+ | Docker 25+ / Podman 5+ |

> [!NOTE]
> **Zero Bandwidth Overhead**: Because Pream issues standard `HTTP 302 Found` redirects directly to upstream providers, video streams **never traverse your server**. Pream will not consume your server's upload bandwidth or CPU for video transcoding.

---

## 🚀 Quick Start with Docker

### 1. Using Docker Compose (Recommended)

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/pream.git
   cd pream
   ```

2. Create your configuration file:
   ```bash
   cp .env.example .env
   ```
   *Edit `.env` to configure your credentials and optional TMDB/Telegram integrations.*

3. Start Pream in the background:
   ```bash
   docker compose up -d
   ```

4. Verify container status and health:
   ```bash
   docker compose ps
   docker compose logs -f
   ```

5. Access the Web Dashboard:
   Open **`http://localhost:8000`** in your browser.
   - **Default Admin Login**: `admin` / `pream`
   - **Default Output Credentials**: `pream` / `pream`

---

### 2. Using Standalone `docker run`

To run Pream without Docker Compose:

```bash
# Build the image locally
docker build -t pream:latest .

# Run container with persistent data volume
docker run -d \
  --name pream \
  --restart unless-stopped \
  -p 8000:8000 \
  -v $(pwd)/data:/app/data \
  --env-file .env \
  pream:latest
```

---

## 🦭 Running with Podman (Rootless & SELinux Ready)

Podman is a daemonless, rootless container engine standard on Enterprise Linux (RHEL, Fedora, CentOS, Rocky Linux, AlmaLinux). Pream is 100% Podman-ready out of the box.

### 1. Rootless `podman run` with SELinux Support

On SELinux systems (Fedora, RHEL, CentOS), bind-mounted volumes **must include the `:Z` flag** so Podman automatically applies the appropriate private container SELinux label (`container_file_t`):

```bash
# 1. Build image with Podman
podman build -t pream:latest .

# 2. Run container rootless with :Z volume flag
podman run -d \
  --name pream \
  --restart unless-stopped \
  -p 8000:8000 \
  -v ./data:/app/data:Z \
  --env-file .env \
  pream:latest
```

> [!IMPORTANT]
> **Why `:Z` matters for Podman**: Without `:Z`, SELinux will block the container process from opening or writing to `./data/pream.db`, resulting in `sqlite3.OperationalError: unable to open database file`. The `:Z` flag grants the container exclusive access to the directory.

---

### 2. Using `podman compose` / `podman-compose`

Pream's `docker-compose.yml` already includes the `:Z` mount flag:

```yaml
services:
  pream:
    build: .
    container_name: pream
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data:Z
    env_file:
      - path: .env
        required: false
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

Run with Podman:
```bash
podman compose up -d
# or using podman-compose:
podman-compose up -d
```

---

### 3. Running as a systemd User Service (Autostart on Boot)

To automatically launch Pream on system boot without logging in, configure a systemd service.

#### Option A: Modern Podman Quadlet (Podman 4.4+)

Create `~/.config/containers/systemd/pream.container`:

```ini
[Unit]
Description=Pream IPTV Gateway Container
After=network-online.target

[Container]
Image=pream:latest
ContainerName=pream
PublishPort=8000:8000
Volume=%h/pream/data:/app/data:Z
EnvironmentFile=%h/pream/.env
HealthCmd=curl -f http://localhost:8000/health || exit 1
HealthInterval=30s
HealthRetries=3

[Service]
Restart=always

[Install]
WantedBy=default.target
```

Reload and start:
```bash
systemctl --user daemon-reload
systemctl --user enable --now pream
```

Enable user lingering so the service starts on boot:
```bash
loginctl enable-linger $USER
```

#### Option B: Using `podman generate systemd`

```bash
# 1. Start the container
podman run -d --name pream -p 8000:8000 -v ./data:/app/data:Z --env-file .env pream:latest

# 2. Generate systemd unit file
mkdir -p ~/.config/systemd/user/
podman generate systemd --new --files --name pream --dest ~/.config/systemd/user/

# 3. Enable and start
systemctl --user daemon-reload
systemctl --user enable --now container-pream.service

# 4. Enable user lingering for boot persistence
loginctl enable-linger $USER
```

---

## ⚙️ Environment Variables Reference

All runtime variables can be set in your `.env` file or passed directly as container environment flags (`-e VAR=value`).

| Variable | Default | Description |
|---|---|---|
| `ADMIN_USERNAME` | `admin` | Username for accessing the Web UI. |
| `ADMIN_PASSWORD` | `pream` | Password for accessing the Web UI. |
| `OUTPUT_USERNAME` | `pream` | Username used by IPTV clients (TiviMate, VLC, Smarters) to authenticate. |
| `OUTPUT_PASSWORD` | `pream` | Password used by IPTV clients to authenticate. |
| `TMDB_API_KEY` | *(empty)* | Optional TMDB v3 API key for movie/series posters, ratings, and plot summaries. |
| `TELEGRAM_BOT_TOKEN` | *(empty)* | Telegram Bot API token for notifications and failure alerts. |
| `TELEGRAM_CHAT_ID` | *(empty)* | Telegram Chat/Channel ID receiving reports (e.g. `-100123456789`). |
| `DATABASE_URL` | `sqlite:///./data/pream.db` | SQLAlchemy database URL. Stored in `/app/data/pream.db`. |
| `REFRESH_CRON` | `0 4 * * *` | 5-field cron expression for automatic daily source sync (4:00 AM UTC). |
| `GROUP_BY_SOURCE` | `false` | When `true`, category names are prefixed with provider name (e.g. `[Provider] Sports`). |
| `SOURCE_SCAN_THREADS` | `2` | Number of concurrent worker threads scanning provider sources in parallel. |
| `STREAM_HEALTH` | `true` | Enables automated stream connectivity and latency testing. |
| `STREAM_HEALTH_COUNT` | `4` | Number of random sample streams tested per provider during health check (max: 5). |
| `STREAM_FAILOVER` | `true` | Automatically issues HTTP 302 redirects to healthy backup providers if primary fails. |
| `STREAM_HISTORY` | `true` | Records client playback access logs with automatic 30-day retention. |
| `HOST` | `0.0.0.0` | Container bind address. |
| `PORT` | `8000` | Port listened to inside the container. |
| `SERVER_NAME` | `Pream` | Display name rendered in navigation, footer, and M3U headers. |

---

## 🔒 Reverse Proxy Configurations (HTTPS)

For external access and secure streaming to mobile devices or smart TVs, place Pream behind an SSL reverse proxy.

### 1. Caddy (Simplest Setup with Automatic SSL)

Add this block to your `Caddyfile`:

```caddy
pream.yourdomain.com {
    reverse_proxy localhost:8000 {
        # Streaming buffer optimizations
        flush_interval -1
    }
}
```

---

### 2. Nginx

Create `/etc/nginx/sites-available/pream.conf`:

```nginx
server {
    listen 80;
    server_name pream.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pream.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/pream.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pream.yourdomain.com/privkey.pem;

    # Performance and security headers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable proxy buffering for instant redirects and SSE progress updates
        proxy_buffering off;
        proxy_http_version 1.1;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

---

### 3. Traefik (Docker Compose Integration)

Add labels to your `docker-compose.yml`:

```yaml
services:
  pream:
    build: .
    container_name: pream
    restart: unless-stopped
    volumes:
      - ./data:/app/data:Z
    env_file:
      - .env
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pream.rule=Host(`pream.yourdomain.com`)"
      - "traefik.http.routers.pream.entrypoints=websecure"
      - "traefik.http.routers.pream.tls.certresolver=myresolver"
      - "traefik.http.services.pream.loadbalancer.server.port=8000"
```

---

## 💾 Backups, Restores & Volume Migration

### Method 1: Built-in Encrypted JSON Backup (Recommended)
1. In the Web UI, navigate to **Settings** > **Backup & Restore**.
2. Click **Export Backup** to download an authenticated, encrypted `.json` snapshot of all system settings, configured sources, and rules.
3. This backup can be imported across any instance (Bare-Metal, Docker, or Podman) without stopping containers.

### Method 2: Host Volume Snapshot
To create an offline cold snapshot of your SQLite database:

```bash
# 1. Stop container cleanly to flush WAL journals
docker compose stop
# or: podman stop pream

# 2. Archive data directory
tar -czvf pream_data_backup_$(date +%F).tar.gz ./data/

# 3. Restart container
docker compose start
# or: podman start pream
```

---

## 🩺 Container Health Diagnostics & Monitoring

### Check Container Health Status
```bash
# Docker
docker inspect --format='{{json .State.Health}}' pream | jq

# Podman
podman healthcheck run pream
```

### Inspect Container Logs
```bash
# Follow live logs
docker compose logs -f
# or with Podman:
podman logs -f pream
```

### Common Fixes:
1. **`Database is locked` / `unable to open database file` on Podman**:
   - Ensure the volume has the `:Z` suffix: `-v ./data:/app/data:Z`.
2. **Missing `.env` File**:
   - If the container fails on startup with `env_file not found`, run `cp .env.example .env`.
3. **Graceful Shutdown**:
   - Pream handles `SIGTERM` and `SIGINT` signals cleanly, flushing SQLite transactions and stopping background scheduler threads.

