#!/usr/bin/env bash
# Obtain + install a Let's Encrypt certificate for the domain, and enable
# auto-renewal (certbot installs a systemd timer automatically).
#   ./init-letsencrypt.sh jntuaweb.jntua.ac.in [admin@jntua.ac.in]
set -euo pipefail
DOMAIN="${1:?usage: init-letsencrypt.sh <domain> [email]}"
EMAIL="${2:-admin@${DOMAIN#*.}}"

# certbot --nginx edits the server block to add ssl_certificate lines + 80→443.
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect
echo "==> Certificate installed. Testing auto-renewal…"
certbot renew --dry-run
echo "==> SSL ready. Nginx now serves HTTPS with auto-renewal."
