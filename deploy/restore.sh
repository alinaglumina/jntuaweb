#!/usr/bin/env bash
# Restore a backup archive produced by backup.sh.
#   ./restore.sh /var/backups/jntuaweb/jntuaweb_2026-07-11_020000.tar.gz
# WARNING: this drops and re-imports the target database.
set -euo pipefail
ARCHIVE="${1:?usage: restore.sh <archive.tar.gz>}"
[ -f /etc/jntua-backup.env ] && . /etc/jntua-backup.env
MONGO_URI="${MONGO_URI:-mongodb://127.0.0.1:27017/jntuaweb}"
UPLOADS_DIR="${UPLOADS_DIR:-/var/www/jntuaweb/server/uploads}"
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT

echo "[restore] extracting $ARCHIVE…"
tar -xzf "$ARCHIVE" -C "$WORK"

read -r -p "[restore] This will DROP the current database. Continue? [y/N] " yes
[ "$yes" = "y" ] || { echo "aborted"; exit 1; }

echo "[restore] restoring MongoDB…"
mongorestore --uri="$MONGO_URI" --gzip --drop "$WORK/mongo" >/dev/null

if [ -d "$WORK/uploads" ]; then
  echo "[restore] restoring uploads…"
  mkdir -p "$UPLOADS_DIR"; cp -a "$WORK/uploads/." "$UPLOADS_DIR/"
fi
echo "[restore] done."
