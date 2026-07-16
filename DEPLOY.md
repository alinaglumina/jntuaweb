# JNTUAWEB v2 — Deployment Guide

Two supported targets. **Docker Compose** is simplest; the **droplet + PM2 + Nginx**
path matches the DigitalOcean setup.

## Prerequisites
- A domain pointing at the server, TLS via certbot.
- MongoDB (bundled `mongo` container, or a managed URI e.g. Atlas).
- The legacy exports for the one-time data migration (see `server/migrate-src/README.md`).

---

## Option A — Docker Compose (recommended)

```bash
git clone <repo> && cd jntuaweb-v2
cp server/.env.production.example server/.env      # fill in JWT_SECRET, PUBLIC_ASSET_BASE, etc.
docker compose up -d --build                       # web :8080, api :5000, mongo :27017

# one-time: seed the super admin, then migrate real data
docker compose exec api npm run seed
# copy legacy exports into server/migrate-src/ first, then:
docker compose exec api npm run migrate
```
Put Nginx (host) or a load balancer in front of `web` (:8080) for TLS.

---

## Option B — DigitalOcean droplet (PM2 + Nginx)

```bash
# 1) System
sudo apt update && sudo apt install -y nginx
# install Node 20 (nodesource) and MongoDB (or use Atlas)
sudo npm i -g pm2

# 2) Code
sudo mkdir -p /var/www/jntuaweb && cd /var/www/jntuaweb
git clone <repo> .

# 3) API
cd server
cp .env.production.example .env         # edit values (COOKIE_SECURE=true)
npm ci --omit=dev
npm run seed
# drop legacy exports into migrate-src/, then:
PUBLIC_ASSET_BASE=https://your-domain npm run migrate
pm2 start ecosystem.config.cjs && pm2 save && pm2 startup

# 4) Client
cd ../client
npm ci && npm run build                 # outputs client/dist

# 5) Nginx
sudo cp ../nginx/jntuaweb.conf /etc/nginx/sites-available/jntuaweb
sudo ln -s /etc/nginx/sites-available/jntuaweb /etc/nginx/sites-enabled/
sudo certbot --nginx -d your-domain     # provisions TLS + enables the 443 block
sudo nginx -t && sudo systemctl reload nginx
```

### CI/CD
`.github/workflows/ci.yml` runs lint + build + docker build on every push.
`.github/workflows/deploy.yml` deploys on a version tag (or manually) via SSH —
set repo secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`.

---

## Hostinger shared hosting note
The API needs a Node runtime and MongoDB, which shared cPanel hosting can't provide.
Host the **API + Mongo** on a small droplet (or Atlas for the DB) and point
`PUBLIC_ASSET_BASE` / the client build at it. The static `client/dist` can live on
Hostinger if you set `VITE_API_BASE` to the droplet's API URL and enable CORS for it.

## Post-deploy checklist
- [ ] `COOKIE_SECURE=true` and site served over HTTPS
- [ ] `JWT_SECRET` is a fresh 64-char random value
- [ ] Changed the seeded admin password (`/admin/account/password`)
- [ ] `PUBLIC_ASSET_BASE` matches the public origin
- [ ] `curl https://your-domain/api/health` returns `{"success":true,...}`
- [ ] Uploaded a test file in the Media Library and confirmed it serves
