---
title: Getting Started & Deployment
description: Quick installation guide for deploying Pream with Docker Compose or running locally with Python.
---

# 🚀 Getting Started & Deployment

Pream can be deployed in minutes using **Docker Compose** (recommended for production) or run directly on bare-metal systems with **Python 3.11+**.

---

## 🐳 Option 1: Docker Compose (Recommended)

Docker is the quickest and cleanest way to run Pream. The official setup persists all SQLite databases and configurations across container restarts.

> [!TIP]
> For in-depth production deployment options including **Rootless Podman**, **SELinux (:Z)**, **systemd Quadlet auto-start**, and **Reverse Proxy (Nginx/Caddy)** setups, see the dedicated [Docker & Podman Deployment Guide](/deployment).

### Step 1: Create Directory & Download Compose File
Create a dedicated folder on your server:

```bash
mkdir -p pream && cd pream
```

Create a `docker-compose.yml` file:

```yaml
services:
  pream:
    image: ghcr.io/pream-project/pream:latest  # Or build from source: build: .
    container_name: pream
    restart: unless-stopped
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
```

### Step 2: Configure Environment Variables
Create your `.env` configuration file:

```bash
cp .env.example .env
```

Edit `.env` with your desired credentials:

```ini
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_strong_admin_password
OUTPUT_USERNAME=pream
OUTPUT_PASSWORD=your_client_stream_password
```

### Step 3: Launch Pream
Start the container in detached mode:

```bash
docker compose up -d
```

### Step 4: Access the Web Dashboard
Open your browser and navigate to:
```
http://<your-server-ip>:8000
```
Log in using your configured `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

---

## 🐍 Option 2: Local Python Development

If you are developing locally on Windows, Linux, or macOS:

### Prerequisites
- Python **3.11** or **3.12+**
- `git`

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/pream.git
cd pream
```

### Step 2: Set Up Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate on Linux / macOS:
source venv/bin/activate

# Activate on Windows PowerShell:
.\venv\Scripts\Activate.ps1
```

### Step 3: Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Configure `.env`
```bash
cp .env.example .env
```

### Step 5: Start the Server
Run the unified server startup script:

```bash
python run_server.py
```

Or run Uvicorn directly with live reload:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## ⚙️ Environment Variables Reference

All runtime and startup parameters are configured via `.env` or passed as system environment variables:

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| **`ADMIN_USERNAME`** | `admin` | Username required to access the Web UI dashboard and admin endpoints. |
| **`ADMIN_PASSWORD`** | `pream` | Password required to access the Web UI dashboard and admin endpoints. |
| **`OUTPUT_USERNAME`** | `pream` | Username used by IPTV clients (TiviMate, Smarters) to authenticate with Pream. |
| **`OUTPUT_PASSWORD`** | `pream` | Password used by IPTV clients (TiviMate, Smarters) to authenticate with Pream. |
| **`DATABASE_URL`** | `sqlite:///./data/pream.db` | SQLAlchemy database connection URI. Uses SQLite by default. |
| **`HOST`** | `0.0.0.0` | Bind IP address for the web server (`0.0.0.0` binds to all network interfaces). |
| **`PORT`** | `8000` | HTTP port on which Pream listens. |
| **`SERVER_NAME`** | `Pream` | Custom brand name displayed in the Web UI navbar and M3U headers. |
| **`REFRESH_CRON`** | `0 4 * * *` | Standard 5-field cron expression for automatic source refresh (default: 4:00 AM daily). |
| **`GROUP_BY_SOURCE`** | `false` | When `true`, automatically prefixes all categories with source names (e.g. `[Provider] Sports`). |
| **`SOURCE_SCAN_THREADS`** | `2` | Number of concurrent worker threads used during parallel source ingestion. |
| **`STREAM_HEALTH`** | `true` | Enables or disables the stream health checking and auto-prioritization engine. |
| **`STREAM_HEALTH_COUNT`** | `4` | Number of random streams tested per source during health checks (allowed range: 1 to 5). |
| **`TMDB_API_KEY`** | `""` | Free v3 API key from [themoviedb.org](https://www.themoviedb.org/settings/api) for poster and genre enrichment. |
| **`TELEGRAM_BOT_TOKEN`** | `""` | Telegram Bot token for sending refresh reports and failure alerts. |
| **`TELEGRAM_CHAT_ID`** | `""` | Telegram Chat ID or channel handle (`-100...` or `@channel`) receiving alerts. |

---

## 🔒 Security Best Practices

> [!IMPORTANT]
> **Change Default Credentials**: Always modify `ADMIN_PASSWORD` and `OUTPUT_PASSWORD` before exposing Pream to local or public networks.

1. **Reverse Proxy (Recommended)**: For remote access over the public internet, place Pream behind Nginx, Caddy, or Traefik with an SSL certificate (Let's Encrypt).
2. **Firewall Rules**:
   - Port `8000`: Accessible to client devices on your local network (LAN / VPN).
   - If hosting in the cloud, restrict admin Web UI access to your home IP address using a VPN or reverse proxy basic auth.
