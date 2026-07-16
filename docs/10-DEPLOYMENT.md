# Deployment Guide

The complete, step-by-step runbook for DigitalOcean is
[`DEPLOY-DIGITALOCEAN.md`](./DEPLOY-DIGITALOCEAN.md). Summary:

## Paths
- **Droplet + PM2 + Nginx** (recommended): provision with
  `deploy/setup-droplet.sh`, configure `.env`, seed/migrate, `pm2 start`, build the
  client, wire Nginx, then `deploy/init-letsencrypt.sh` for HTTPS.
- **Docker Compose**: `docker compose up -d --build` (mongo + api + web), Nginx on
  the host for TLS.

## Included tooling
- Containers: `server/Dockerfile`, `client/Dockerfile`, `docker-compose.yml`.
- Reverse proxy + TLS + security headers: `nginx/jntuaweb.conf`.
- Process manager: `server/ecosystem.config.cjs` (PM2 cluster).
- CI/CD: `.github/workflows/ci.yml`, `deploy.yml` (tag-triggered).
- SSL: `deploy/init-letsencrypt.sh` (certbot + auto-renewal).
- Automatic backups: `deploy/backup.sh` + systemd timer (`install-backup-timer.sh`),
  `deploy/restore.sh`.

## Post-deploy checklist
DNS resolves · real secrets + `COOKIE_SECURE=true` + `SITE_URL`/`CLIENT_ORIGIN`
set · HTTPS valid · `/api/health` ok · `/sitemap.xml` + `/robots.txt` resolve ·
backup timer scheduled · first backup archive present · admin login + forced
password change works.

See also [`SECURITY.md`](./SECURITY.md) for the security posture.
