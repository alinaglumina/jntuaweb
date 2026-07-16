#!/usr/bin/env bash
# One-time provisioning for a fresh Ubuntu 22.04/24.04 DigitalOcean droplet.
# Installs Node 20, MongoDB 7, Nginx, PM2, certbot; sets up a firewall, swap,
# the app directory, and the scheduled-backup timer. Run as root (or with sudo).
#
#   curl -fsSL <raw>/deploy/setup-droplet.sh | bash      # or copy + run
set -euo pipefail
APP_DIR="/var/www/jntuaweb"
DOMAIN="${DOMAIN:-jntuaweb.jntua.ac.in}"

echo "==> Updating system"
apt-get update -y && apt-get upgrade -y

echo "==> Swap (1G — helps small droplets build the client)"
if [ ! -f /swapfile ]; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> Node 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "==> MongoDB 7"
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list
apt-get update -y && apt-get install -y mongodb-org
systemctl enable --now mongod

echo "==> Nginx + certbot + tools"
apt-get install -y nginx certbot python3-certbot-nginx git ufw

echo "==> PM2 (global)"
npm install -g pm2
pm2 startup systemd -u root --hp /root >/dev/null || true

echo "==> Firewall (SSH + HTTP + HTTPS only)"
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

echo "==> App directory"
mkdir -p "$APP_DIR"
echo "    Clone your repo into $APP_DIR, then:"
echo "      cd $APP_DIR/server && cp .env.production.example .env && \$EDITOR .env"
echo "      npm ci --omit=dev && npm run seed && pm2 start ecosystem.config.cjs && pm2 save"
echo "      cd $APP_DIR/client && npm ci && npm run build"
echo "      cp $APP_DIR/nginx/jntuaweb.conf /etc/nginx/sites-available/jntuaweb"
echo "      ln -sf /etc/nginx/sites-available/jntuaweb /etc/nginx/sites-enabled/jntuaweb"
echo "      nginx -t && systemctl reload nginx"
echo "      bash $APP_DIR/deploy/init-letsencrypt.sh $DOMAIN"
echo "      bash $APP_DIR/deploy/install-backup-timer.sh"
echo "==> Base provisioning complete."
