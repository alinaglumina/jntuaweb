# Installation Guide (Local Development)

## Prerequisites
- **Node.js 20+** and npm
- **MongoDB 7** running locally (`mongodb://127.0.0.1:27017`) — or a connection
  string to Atlas / a managed instance
- Git

## 1. Clone
```bash
git clone https://github.com/<you>/jntuaweb.git
cd jntuaweb
```

## 2. Backend
```bash
cd server
cp .env.example .env            # then edit — see docs/04-ENVIRONMENT.md
npm install
```
Seed an admin (fresh DB) **or** import legacy data:
```bash
npm run seed                    # creates the admin from SEED_ADMIN_* vars
# or
npm run migrate:dry             # preview the legacy import (no writes)
npm run migrate                 # run the ETL import
```
Start the API:
```bash
npm run dev                     # nodemon on http://localhost:5000
```
Health check: `curl http://localhost:5000/api/health`.

## 3. Frontend
```bash
cd ../client
cp .env.example .env            # set VITE_API_BASE=http://localhost:5000/api
npm install
npm run dev                     # Vite on http://localhost:5173
```

## 4. Verify
- Visit `http://localhost:5173` — the public site loads.
- Go to `/admin`, sign in with the seeded admin, and you'll be prompted to change
  the password on first login.

## Common issues
| Symptom | Cause / fix |
|---|---|
| API exits immediately | `.env` missing/weak secrets — in dev this is lenient, but check `MONGO_URI` reachability. |
| `CastError … 400` in dev tests | An id that isn't a valid ObjectId — use a 24-hex id. |
| CSRF 403 on a mutation | The `jntua_csrf` cookie is issued on the first GET; ensure the app loaded a page before mutating. |
| Client can't reach API | `VITE_API_BASE` wrong, or API not running / CORS `CLIENT_ORIGIN` mismatch. |

## Scripts reference
**Server:** `dev`, `start`, `seed`, `migrate`, `migrate:dry`, `lint`.
**Client:** `dev`, `build`, `preview`, `lint`.
