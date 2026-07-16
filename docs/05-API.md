# API Documentation

Base URL: `/api`. All responses use the envelope `{ success, data, error }`.
Auth is via httpOnly cookies; mutations require the `X-CSRF-Token` header (the
client attaches it automatically). Full per-endpoint detail is in
[`API_REFERENCE.md`](./API_REFERENCE.md).

## Route groups
| Prefix | Purpose | Auth |
|---|---|---|
| `/api/auth` | login, refresh, logout, me, change/forgot/reset password, profile, login history, session revoke | mixed |
| `/api/notifications` | public notice/news list + detail; admin create/update/delete | public read, admin write |
| `/api/settings` | site settings | public read, admin write |
| `/api/search`, `/api/search/popular` | global search + popular terms | public |
| `/api/admin/*` | config-driven CRUD for every resource, media library, users, roles, audit logs, dashboard, backup, admin search | authenticated (RBAC) |
| `/api/*` (public) | slides, gallery, mous, e-magazines, news, honoris, administration, content, seo, media download, contact/enquiry | public |
| `/sitemap.xml`, `/robots.txt` | SEO (served at root, not under `/api`) | public |

## Auth endpoints (summary)
`POST /auth/login` · `POST /auth/refresh` · `POST /auth/logout` · `GET /auth/me`
· `POST /auth/change-password` · `PUT /auth/profile` · `POST /auth/forgot-password`
· `POST /auth/reset-password` · `GET /auth/login-history` ·
`DELETE /auth/sessions/:id` · `POST /auth/sessions/revoke-others`.

## Config-driven CRUD
Every registered resource exposes, under `/api/admin/<resource>`:
`GET /` (list — `?q=`, `?page=`, `?limit=`, `?deleted=only`), `POST /`,
`PUT /:id`, `DELETE /:id` (soft; `?hard=1` to purge), `POST /:id/restore`.
Resources are defined in `server/src/config/resources.js` — see the Developer
Guide.

## Media
`POST /admin/media` (upload), `PUT /admin/media/:id/replace`,
`POST /admin/media/bulk-delete`, `POST /admin/media/bulk-move`,
`GET /admin/media/report`, `DELETE /admin/media/:id`, and public
`GET /media/:id/download` (tracked).

## Search
`GET /api/search?q=&limit=` → results grouped across Pages, News, Downloads,
Notices, Faculty, Departments, Documents, Results. `GET /api/admin/search?q=`
searches across CRUD resources (authed, role-scoped).

## Conventions
- **Errors:** `400` validation/cast, `401` unauthenticated, `403` forbidden/CSRF,
  `404` not found, `409` duplicate key, `429` rate-limited.
- **Rate limits:** global 300/min; mutations 60/min; login 10/15min; reset 5/hr.
- **Pagination:** list endpoints return `{ items, total, page, limit }`.
