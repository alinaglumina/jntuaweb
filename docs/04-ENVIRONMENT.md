# Environment Variables

Two `.env` files: `server/.env` and `client/.env`. Templates:
`*.env.example` (dev) and `*.env.production.example` (prod). **Never commit real
`.env` files.**

## Server (`server/.env`)

### Core
| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | `development` locally. Enables prod validation + CSP. |
| `PORT` | `5000` | API listen port. |
| `CLIENT_ORIGIN` | `https://jntuaweb.jntua.ac.in` | CORS allowlist origin (no trailing slash). |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/jntuaweb` | Local, Atlas, or managed URI. |
| `SITE_URL` | `https://jntuaweb.jntua.ac.in` | Canonical origin for sitemap/SEO. |

### Auth & cookies
| Variable | Example | Notes |
|---|---|---|
| `JWT_SECRET` | 64 hex chars | Access-token secret. `openssl rand -hex 32`. |
| `REFRESH_TOKEN_SECRET` | 64 hex chars | **Must differ** from `JWT_SECRET`. |
| `ACCESS_TOKEN_TTL` | `15m` | Short-lived access token. |
| `REFRESH_TOKEN_TTL` / `REFRESH_TOKEN_DAYS` | `7d` / `7` | Refresh validity (string + numeric). |
| `RESET_TOKEN_MINUTES` | `60` | Password-reset link validity. |
| `COOKIE_NAME` / `REFRESH_COOKIE_NAME` | `jntua_token` / `jntua_rt` | Cookie names. |
| `COOKIE_SECURE` | `true` | **Required `true` in production** (HTTPS). |

### Uploads & mail
| Variable | Example | Notes |
|---|---|---|
| `UPLOAD_DIR` | `uploads` | Upload directory (relative to server). |
| `MAX_UPLOAD_MB` | `25` | Per-file size cap. |
| `PUBLIC_ASSET_BASE` | `https://jntuaweb.jntua.ac.in` | Base for stored asset URLs. |
| `SMTP_HOST/PORT/USER/PASS` | — | SMTP for password-reset mail; if unset, mail is logged (dev). |
| `MAIL_FROM` | `JNTUA Web <no-reply@jntua.ac.in>` | From header. |

### Seeding (one-time)
`SEED_ADMIN_USER`, `SEED_ADMIN_PASS`, `SEED_ADMIN_EMAIL` — used only by `npm run seed`.

### Production safety
`validateEnv()` runs at startup and **refuses to boot** if, in production,
`JWT_SECRET`/`REFRESH_TOKEN_SECRET` are missing/short/identical, `COOKIE_SECURE`
isn't `true`, or `CLIENT_ORIGIN` is unset.

## Client (`client/.env`)
| Variable | Example | Notes |
|---|---|---|
| `VITE_API_BASE` | `http://localhost:5000/api` | API base URL. In prod, `/api` (same origin via Nginx). |
| `VITE_SITE_URL` | `https://jntuaweb.jntua.ac.in` | Canonical/OG base, baked into the build. |

### Backup env (`/etc/jntua-backup.env` on the droplet)
`MONGO_URI`, `UPLOADS_DIR`, `BACKUP_DIR`, `RETENTION_DAYS`, and optionally
`SPACES_BUCKET`/`SPACES_ENDPOINT` for off-site copies. See `deploy/backup.sh`.
