# Maintenance Guide

For the team running the production server.

## Routine
| Task | How |
|---|---|
| Check API health | `curl https://<site>/api/health` → `{ success: true }` |
| View API logs | `pm2 logs jntua-api` (or `journalctl -u nginx` for the web tier) |
| Process status | `pm2 status` — should show `online`, cluster instances |
| Restart API | `pm2 reload ecosystem.config.cjs` (zero-downtime) |
| Reload Nginx | `sudo nginx -t && sudo systemctl reload nginx` |
| Disk usage | `df -h`; uploads live under `server/uploads`, backups under `/var/backups/jntuaweb` |

## Backups
- **Automatic:** a systemd timer runs `deploy/backup.sh` daily at 02:00 —
  mongodump + uploads → timestamped `.tar.gz`, 14-day retention, optional off-site
  copy to DigitalOcean Spaces.
- **Check the timer:** `systemctl list-timers jntua-backup.timer`.
- **Run one now:** `sudo /var/www/jntuaweb/deploy/backup.sh`.
- **Restore:** `sudo /var/www/jntuaweb/deploy/restore.sh <archive.tar.gz>`
  (drops and re-imports the DB — confirm the prompt).
- **Verify restores periodically** on a staging box; an untested backup isn't a
  backup.

## TLS / SSL
Certbot auto-renews via its own systemd timer. Verify:
`sudo certbot renew --dry-run`. Certificates live under `/etc/letsencrypt/`.

## Deploying updates
Tag a release (`git tag v1.2.0 && git push --tags`) to trigger the deploy
workflow, or manually:
```bash
cd /var/www/jntuaweb && git pull origin main
cd server && npm ci --omit=dev && pm2 reload ecosystem.config.cjs
cd ../client && npm ci && npm run build
sudo nginx -t && sudo systemctl reload nginx
```

## Database
- Indexes are defined in the models and created automatically on connect.
- To inspect: `mongosh jntuaweb` then `db.<collection>.getIndexes()`.
- For heavy queries, check `db.<collection>.find(...).explain('executionStats')`.
- Consider a MongoDB **text index** (or Atlas Search) if search volume grows.

## Security upkeep
- Rotate `JWT_SECRET`/`REFRESH_TOKEN_SECRET` periodically (invalidates sessions).
- Run `npm audit` on both packages during maintenance windows.
- Review **Audit Logs** and **Login History** in the admin for anomalies.
- Keep the OS patched: `apt-get update && apt-get upgrade`.

## Monitoring suggestions
- Uptime check hitting `/api/health`.
- Alert on PM2 restarts (`pm2 monit` / a process exporter).
- Alert on disk > 80% (uploads + backups grow over time).

## Troubleshooting
| Symptom | Likely cause | Action |
|---|---|---|
| 502 Bad Gateway | API down | `pm2 status`, `pm2 logs`, restart |
| API won't start in prod | env validation failed | check secrets, `COOKIE_SECURE`, `CLIENT_ORIGIN` |
| Uploads 413 | file over limit | raise `client_max_body_size` (Nginx) + `MAX_UPLOAD_MB` |
| CSRF 403 everywhere | client not sending token | ensure a GET issued the `jntua_csrf` cookie; check cookie domain |
| Office preview blank | file URL not public | Office Online must reach `PUBLIC_ASSET_BASE` over HTTPS |
| Cert expired | renewal failed | `certbot renew`, check port 80 open for the challenge |
