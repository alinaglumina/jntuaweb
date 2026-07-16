# Deploying JNTUAWEB v2 on DigitalOcean

Two supported paths. **Droplet + PM2 + Nginx** (recommended for a university site — cheapest, full control) or **Docker Compose** (everything in containers). Both end with HTTPS and automatic backups.

---

## Option A — Droplet + PM2 + Nginx (recommended)

### 1. Create the droplet
- Ubuntu 24.04 LTS, Basic / Regular, **2 GB RAM minimum** (the client build needs headroom; the setup script also adds 1 GB swap).
- Add your SSH key. Note the public IP.
- Point your DNS **A record** (`jntuaweb.jntua.ac.in`) at the droplet IP before requesting SSL.

### 2. Provision (one time)
```bash
ssh root@YOUR_DROPLET_IP
git clone https://github.com/<you>/jntuaweb.git /var/www/jntuaweb
DOMAIN=jntuaweb.jntua.ac.in bash /var/www/jntuaweb/deploy/setup-droplet.sh
```
This installs Node 20, MongoDB 7, Nginx, PM2, certbot, sets up the firewall (SSH/HTTP/HTTPS only) and swap, and prints the remaining app steps.

### 3. Configure + start the API
```bash
cd /var/www/jntuaweb/server
cp .env.production.example .env
# Generate real secrets:
#   openssl rand -hex 32   → JWT_SECRET
#   openssl rand -hex 32   → REFRESH_TOKEN_SECRET  (must differ)
nano .env                       # set secrets, SITE_URL, CLIENT_ORIGIN, SMTP, seed admin
npm ci --omit=dev
npm run migrate                 # import legacy data (or npm run seed for a fresh admin)
pm2 start ecosystem.config.cjs && pm2 save
```
`validateEnv()` refuses to boot if secrets are missing/weak or `COOKIE_SECURE!=='true'` — that's expected, fix `.env` and retry.

### 4. Build the client + wire Nginx
```bash
cd /var/www/jntuaweb/client
cp .env.production.example .env   # set VITE_SITE_URL
npm ci && npm run build
sudo cp /var/www/jntuaweb/nginx/jntuaweb.conf /etc/nginx/sites-available/jntuaweb
sudo ln -sf /etc/nginx/sites-available/jntuaweb /etc/nginx/sites-enabled/jntuaweb
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

### 5. Enable HTTPS (SSL)
```bash
bash /var/www/jntuaweb/deploy/init-letsencrypt.sh jntuaweb.jntua.ac.in admin@jntua.ac.in
```
certbot obtains the cert, rewrites the Nginx block to serve 443 + redirect 80→443, and installs an auto-renewal timer. HSTS is already set in the Nginx config.

### 6. Turn on automatic backups
```bash
sudo bash /var/www/jntuaweb/deploy/install-backup-timer.sh
```
Runs `deploy/backup.sh` **daily at 02:00**: `mongodump` + the uploads directory → one timestamped `.tar.gz` in `/var/backups/jntuaweb`, pruned after 14 days. To push copies off-site to **DigitalOcean Spaces**, install aws-cli, configure it with your Spaces keys, and set `SPACES_BUCKET`/`SPACES_ENDPOINT` in `/etc/jntua-backup.env`. Restore any time with `deploy/restore.sh <archive>`.

### 7. Deploys after the first
Push a `v*` tag (or run the workflow manually) — `.github/workflows/deploy.yml` SSHes in, pulls, `npm ci`, rebuilds the client, reloads PM2, and reloads Nginx. Add repo secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

---

## Option B — Docker Compose

```bash
ssh root@YOUR_DROPLET_IP
git clone https://github.com/<you>/jntuaweb.git /var/www/jntuaweb && cd /var/www/jntuaweb
cp server/.env.production.example server/.env    # edit secrets etc.
export SITE_URL=https://jntuaweb.jntua.ac.in
docker compose up -d --build
```
This starts `mongo`, `api` (:5000, health-checked), and `web` (:8080). Put Nginx **on the host** in front for TLS (proxy `/` → `web:8080`, `/api` → `api:5000`), then run `init-letsencrypt.sh`. Back up the `mongo_data` and `uploads_data` volumes with `deploy/backup.sh` (point `MONGO_URI` at the container: `mongodb://127.0.0.1:27017/jntuaweb` with the port published).

> Managed alternative: use **DigitalOcean Managed MongoDB** and set `MONGO_URI` to its connection string — then you can drop the `mongo` service and let DO handle its backups.

---

## What's included

| Concern | File |
|---|---|
| API container | `server/Dockerfile` |
| Client container (Nginx) | `client/Dockerfile`, `client/nginx.conf` |
| Full stack | `docker-compose.yml` |
| Reverse proxy + TLS + security headers | `nginx/jntuaweb.conf` |
| Process manager (cluster mode, auto-restart) | `server/ecosystem.config.cjs` |
| CI (lint, build, docker build) | `.github/workflows/ci.yml` |
| Deploy (SSH, tag-triggered) | `.github/workflows/deploy.yml` |
| Env templates | `server/.env.production.example`, `client/.env.production.example` |
| Droplet provisioning | `deploy/setup-droplet.sh` |
| SSL issuance + auto-renewal | `deploy/init-letsencrypt.sh` |
| Automatic backups | `deploy/backup.sh`, `deploy/restore.sh`, `deploy/jntua-backup.{service,timer}`, `deploy/install-backup-timer.sh` |

## Post-deploy checklist
- [ ] DNS A record resolves to the droplet
- [ ] `.env` secrets are real 64-char values, `COOKIE_SECURE=true`, `SITE_URL`/`CLIENT_ORIGIN` set
- [ ] `https://…` loads with a valid certificate (padlock)
- [ ] `https://…/api/health` returns ok
- [ ] `https://…/sitemap.xml` and `/robots.txt` resolve
- [ ] `systemctl list-timers jntua-backup.timer` shows the next run
- [ ] First backup archive appears in `/var/backups/jntuaweb`
- [ ] Admin login works; change the seeded password on first login
