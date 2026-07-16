#!/usr/bin/env bash
# Automatic backup: dumps MongoDB + the uploads directory into a single
# timestamped archive, prunes old archives, and (optionally) ships a copy to
# DigitalOcean Spaces. Designed to run from cron/systemd on the droplet.
#
#   ./backup.sh            # run a backup now
# Configure via /etc/jntua-backup.env (see keys below) or environment vars.
set -euo pipefail

# ── Config (override via env or /etc/jntua-backup.env) ──────────────────────
[ -f /etc/jntua-backup.env ] && . /etc/jntua-backup.env
MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/jntuaweb}"
UPLOADS_DIR="${UPLOADS_DIR:-/var/www/jntuaweb/server/uploads}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/jntuaweb}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
SPACES_BUCKET="${SPACES_BUCKET:-}"          # e.g. s3://jntua-backups  (optional)
SPACES_ENDPOINT="${SPACES_ENDPOINT:-https://blr1.digitaloceanspaces.com}"

STAMP="$(date +%Y-%m-%d_%H%M%S)"
WORK="$(mktemp -d)"
ARCHIVE="${BACKUP_DIR}/jntuaweb_${STAMP}.tar.gz"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$BACKUP_DIR"
echo "[backup] $(date) → $ARCHIVE"

# 1) Mongo dump
echo "[backup] dumping MongoDB…"
mongodump --uri="$MONGO_URI" --gzip --out="$WORK/mongo" >/dev/null

# 2) Uploads (skip gracefully if absent)
if [ -d "$UPLOADS_DIR" ]; then
  echo "[backup] copying uploads…"
  mkdir -p "$WORK/uploads"
  cp -a "$UPLOADS_DIR/." "$WORK/uploads/" 2>/dev/null || true
fi

# 3) Single archive
tar -czf "$ARCHIVE" -C "$WORK" .
echo "[backup] wrote $(du -h "$ARCHIVE" | cut -f1)"

# 4) Off-site copy to DigitalOcean Spaces (needs aws-cli configured with DO keys)
if [ -n "$SPACES_BUCKET" ] && command -v aws >/dev/null; then
  echo "[backup] uploading to Spaces…"
  aws --endpoint-url "$SPACES_ENDPOINT" s3 cp "$ARCHIVE" "${SPACES_BUCKET}/" >/dev/null && echo "[backup] off-site copy done"
fi

# 5) Retention: delete local archives older than N days
find "$BACKUP_DIR" -name 'jntuaweb_*.tar.gz' -mtime "+${RETENTION_DAYS}" -delete
echo "[backup] pruned archives older than ${RETENTION_DAYS} days"
echo "[backup] done."
