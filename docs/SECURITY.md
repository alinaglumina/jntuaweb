# JNTUAWEB v2 — Security Posture

A summary of the controls in place. Layered defense across transport, session, input, and storage.

## Headers & transport — Helmet
`helmet()` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options`, `Referrer-Policy`, hides `X-Powered-By`, and enables a **Content-Security-Policy** in production (`default-src 'self'`, scoped script/style/font/img/frame/connect sources). HSTS is added at the Nginx layer. `trust proxy` is set for correct client IPs behind Nginx.

## Rate limiting
- Global: 300 req/min per IP on `/api`.
- Mutations: 60 req/min (single shared limiter instance).
- Login: 10 / 15 min. Password reset & forgot: 5 / hour. Public contact/enquiry: 5 / 10 min.

## Input validation
- **express-validator** chains on auth endpoints (login, reset, change-password, profile) → 400 with a clear message.
- **Mongoose schema validation** (required, enum, match, length) on every model; `CastError`/`ValidationError`/duplicate-key mapped to 400/409 (not 500).
- **express-mongo-sanitize** strips `$`/`.` keys (NoSQL injection); **hpp** guards HTTP parameter pollution.

## XSS protection
- Write-time: `sanitize-html` on all request bodies — HTML fields keep a safe allowlist, everything else is stripped of tags.
- Render-time: `DOMPurify` (`SafeHtml`) on any admin-authored HTML shown on the site.
- CSP as a backstop against injected scripts.

## CSRF protection
Double-submit token: a non-httpOnly `jntua_csrf` cookie is issued on safe requests; the SPA echoes it in `X-CSRF-Token` on every mutation, and the server rejects mismatches with 403. Protects state-changing requests even with `SameSite=None` cookies (needed for cross-origin deploys). Bootstrap endpoints (login/refresh/forgot/reset) are exempt (pre-session or token-based).

## CORS
`cors({ origin: CLIENT_ORIGIN, credentials: true })` — a single configured origin (never a wildcard with credentials).

## Secure cookies
Auth access + refresh tokens and the CSRF token are cookies with `httpOnly` (auth), `secure` (prod), and `sameSite` (`none` in prod over HTTPS, `lax` in dev). Refresh cookie is path-scoped to `/api/auth`.

## Password encryption
`bcrypt` (cost 12). Hashes are `select:false` (never returned). Reset & refresh tokens are stored **hashed** (SHA-256) at rest, so a DB leak can't be replayed.

## File validation
- Extension allowlist + size limit (multer).
- **Magic-byte sniffing**: the first bytes of raster/PDF uploads must match the extension, so a script renamed `.png` is rejected and deleted.
- Uploaded images are downscaled + re-encoded (`sharp`), which also strips embedded metadata/payloads.

## Environment variables
`validateEnv()` runs at startup and **refuses to boot in production** if `JWT_SECRET`/`REFRESH_TOKEN_SECRET` are missing, too short, identical, if `COOKIE_SECURE!=='true'`, or if `CLIENT_ORIGIN` is unset. Secrets live only in `.env` (templates provided; never committed).

## Audit logs
Every successful admin mutation and every auth event (login success/failure, logout) is recorded to `AuditLog` (actor, action, resource, path, status, IP, timestamp). Login attempts are additionally recorded to `LoginHistory` with device/IP. Both viewable in the admin.

## Session security
Short-lived access token (15 min) + rotating refresh token (7 days, hashed, revocable). Change-password and password-reset revoke all sessions; users can revoke individual sessions or "sign out everywhere else".

## Residual items to own at deploy
- Provision real, distinct 64-char secrets and set `COOKIE_SECURE=true`.
- Terminate TLS + enable HSTS at Nginx (config provided in `nginx/`).
- Configure SMTP so password-reset emails actually send.
- Consider a WAF/CDN in front for volumetric protection.
