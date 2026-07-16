#!/usr/bin/env bash
# Installs the daily backup as a systemd timer (02:00 server time).
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"
cp "$D/jntua-backup.service" /etc/systemd/system/
cp "$D/jntua-backup.timer"   /etc/systemd/system/
[ -f /etc/jntua-backup.env ] || cat > /etc/jntua-backup.env <<'ENV'
MONGO_URI=mongodb://127.0.0.1:27017/jntuaweb
UPLOADS_DIR=/var/www/jntuaweb/server/uploads
BACKUP_DIR=/var/backups/jntuaweb
RETENTION_DAYS=14
# Off-site (optional) — DigitalOcean Spaces via aws-cli:
# SPACES_BUCKET=s3://your-space
# SPACES_ENDPOINT=https://blr1.digitaloceanspaces.com
ENV
systemctl daemon-reload
systemctl enable --now jntua-backup.timer
echo "==> Backup timer installed. Next run:"; systemctl list-timers jntua-backup.timer --no-pager || true
