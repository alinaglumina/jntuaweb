# JNTUAWEB v2 — React + Express + MongoDB

Modern rebuild of the JNTU Anantapur portal. Monorepo: `client/` (React 19 + Vite) and `server/` (Express + MongoDB).

## Quick start (local, without Docker)

**Prerequisites:** Node 20+, MongoDB running locally.

```bash
# 1) API
cd server
cp .env.example .env          # edit JWT_SECRET, MONGO_URI
npm install
npm run seed                  # creates super admin (SEED_ADMIN_USER / SEED_ADMIN_PASS)
npm run dev                   # http://localhost:5000

# 2) Web
cd ../client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

Log in at `/login` with the seeded admin, then change the password.

## Quick start (Docker)

```bash
cp server/.env.example server/.env   # set a strong JWT_SECRET
docker compose up --build            # web: :8080  ·  api: :5000  ·  mongo: :27017
docker compose exec api npm run seed
```

## Architecture

- **Response envelope** — every API returns `{ success, data, error }` (preserved from the legacy PHP app), unwrapped by the axios interceptor.
- **Auth** — JWT in an httpOnly cookie; `requireAuth` + `requireRole`/`requireDirectorate` guards.
- **State** — React Query for server data, Redux Toolkit for auth/UI only.
- **Generic CRUD** — `crudController(Model)` on the server + (Phase 5) a single `<CrudSection>` on the client drive all ~258 admin panels from config.
- **Models** — 22 Mongoose schemas mapped from the live MySQL dump + 33 JSON stores.

## Migration phases

1. Analysis ✅  2. Foundation ✅  3. Public site ✅ (43 routes)
4. Data ETL ✅ (MySQL + JSON → Mongo)  5. Admin portal ✅ (config-driven CRUD)  6. Hardening + deploy ✅

## Routing

Route definitions live in `client/src/routes/`:
- `index.jsx` — composes the tree with `createBrowserRouter`, attaches `errorElement`s.
- `PublicRoutes.jsx` — public pages nested under `RootLayout` (shared chrome).
- `AdminRoutes.jsx` — admin panels nested under the protected `AdminLayout`.
- `guards.jsx` — `ProtectedRoute` (auth) and `RoleRoute` (role), both session-aware.
- `lazy.jsx` — shared Suspense wrapper (every page is code-split).

| Type | Examples |
|---|---|
| Public | `/`, `/notifications`, `/about/genesis`, `/about/gallery` |
| Dynamic | `/directorates/:key`, `/units/:key`, `/academics/:slug`, `/admin/r/:resource` |
| Protected | everything under `/admin` (redirects to `/login`, preserving intended path) |
| Role-restricted | `/admin/media`, `/admin/users` (super admin → else `/admin/403`) |
| Nested | public pages under `RootLayout`; admin pages under `AdminLayout` |
| Errors | `errorElement` → 404 / 403 / 500 pages; catch-all `*` in both trees |

Route-level loaders (`routes/loaders.js`) prefetch data into the React Query
cache before a route renders, so pages mount with data already present and
back/forward is instant. Loaders and `useQuery` hooks share the same key/fetcher
definitions in `api/queries.js`, guaranteeing cache-key parity. A `<NavProgress>`
bar (driven by `useNavigation`) shows while loaders run. Loaders use
`prefetchQuery` (non-throwing), so a failed fetch degrades to the component's own
empty/error state rather than the route error page.

Breadcrumbs are derived automatically from the matched route chain: each route declares `handle.crumb`, and `<Breadcrumbs>` reads them via `useMatches()`. No per-page wiring.

Session is restored on load (`useSessionBootstrap`); guards wait for it before deciding, so a hard refresh on `/admin` no longer flashes to `/login`.

## Admin portal (Phase 5)

Sign in at `/login` → redirected to `/admin`. The portal is **config-driven**: every
management panel is rendered by one `<CrudSection>` component from
`client/src/admin/resources.js`. Adding a panel = adding a config entry (matching a
server registry key in `server/src/config/resources.js`). Includes list/search,
create/edit (with file uploads), delete, a folder-aware **Media Library**, and
**Users** management. Role-aware: super admins see everything; directors see a
filtered set scoped to their directorate.

## Data migration (Phase 4)

Migrate the legacy MySQL dump + 33 JSON stores into MongoDB and copy the asset folders:

```bash
cd server
# drop sources into server/migrate-src/ (dump.sql, data/, uploads/, files/) — see its README
npm run migrate:dry     # validate everything, write nothing
PUBLIC_ASSET_BASE=https://your-domain npm run migrate   # full run (needs MongoDB)
```

Idempotent (upserts by natural keys). Rewrites legacy asset URLs to `PUBLIC_ASSET_BASE`.

## Documentation

Full documentation set in [`docs/`](./docs/README.md): project overview, folder
structure, installation, environment variables, API, database, admin user guide,
developer guide, maintenance, deployment, and security.

## Deployment (DigitalOcean)

Full runbook in `DEPLOY-DIGITALOCEAN.md`. Droplet + PM2 + Nginx (recommended) or
Docker Compose. Includes: `deploy/setup-droplet.sh` (Node/Mongo/Nginx/PM2/ufw/swap),
`deploy/init-letsencrypt.sh` (SSL + auto-renewal), a daily **automatic backup**
(`deploy/backup.sh` → mongodump + uploads → timestamped archive, 14-day retention,
optional DigitalOcean Spaces off-site) wired as a systemd timer, `restore.sh`,
tag-triggered GitHub Actions deploy, and production env templates. `validateEnv()`
refuses to boot on insecure production config.

## SEO

- **Meta tags / Open Graph / Twitter cards / canonical** — the `Seo` component
  sets title, description, keywords, canonical, OG and Twitter tags per route, and
  can auto-merge admin-managed `SeoMeta`.
- **Structured data (JSON-LD)** — site-wide `EducationalOrganization` +
  `WebSite` (with a sitelinks `SearchAction`), plus a `NewsArticle` helper for
  content pages.
- **Breadcrumb schema** — `BreadcrumbList` JSON-LD emitted from the route trail
  for breadcrumb rich results.
- **XML sitemap** — `GET /sitemap.xml` (Node) lists core routes + dynamic
  department pages with lastmod/priority/changefreq.
- **robots.txt** — `GET /robots.txt` allows crawling, blocks `/admin`, `/api`,
  `/search`, and points to the sitemap (plus a static fallback in `client/public`).
- Nginx proxies `/sitemap.xml` and `/robots.txt` to the Node backend.

## Global Search

Site-wide search across **Pages, News, Downloads, Notices, Faculty, Departments,
Documents (DAFA/Senate/DACP) and Results**. `GET /api/search?q=` returns results
grouped by category with per-item links (internal routes, or external file/portal
URLs where applicable) and regex-escaped queries. On the client: a **command
palette** (⌘/Ctrl+K or `/`) with debounced live results, arrow-key navigation and
grouped sections, a header search trigger, and a full `/search` results page. Matched terms are
**highlighted**; the palette shows **recent** (local) and **popular** (server-tracked)
searches when empty. The admin has its own **command palette** (⌘/Ctrl+K) that jumps
to any section and searches records across CRUD resources (`GET /api/admin/search`).

## File Management

Media Library supports **PDF, Word, Excel, PowerPoint, images, video, ZIP** and
more (extension allowlist + magic-byte validation + image compression). Features:
**preview** (universal `FilePreview` — inline image/PDF/video, Office Online embed
for docs, download card otherwise), **download tracking** (`GET /media/:id/download`
increments a per-file counter, then streams), **replace** (swap a file's binary,
keeping the same record + URL), and **delete** (removes the record *and* the file
from disk). Files can be attached to any content via the resource upload fields.
Also: **drag-and-drop multi-upload** with live progress, **multi-select bulk
delete/move**, and a **download report** (top files + totals).

## Performance

- **Memoization** — `React.memo` on the generic `Table`; `useMemo`/`useCallback`
  for derived data and observers across hot paths.
- **Caching** — React Query (`staleTime` 60s, `gcTime` 5m, no focus-refetch) +
  `Cache-Control: public, max-age=60, stale-while-revalidate=300` on public reads.
- **Image compression** — uploads are downscaled (≤1600px) and re-encoded via
  `sharp` (mozjpeg / png / webp), in place, best-effort.
- **API optimization** — `.lean()` reads, list projection helper, response
  compression, pagination to cap payloads.
- **Database indexing** — single + compound indexes per collection (see
  DATABASE_DESIGN.md); TTL index on refresh tokens.
- **Pagination** — server-side `page`/`limit`; the admin `CrudSection` paginates
  (25/page) with `placeholderData` to avoid flicker.
- **Infinite scroll** — the Notification Centre uses `useInfiniteQuery` +
  `IntersectionObserver` against the paginated, category-filtered endpoint.
- **Debouncing** — `useDebounce` on admin search (queries after typing stops).
- **Code splitting** — lazy routes + Vite `manualChunks` (vendor / data / motion /
  charts); framer-motion & recharts split out shrank the main bundle ~27%.
- **Tree shaking** — ESM imports + `sideEffects: ["**/*.css"]` so Rollup drops
  unused code.

## UI / UX

- **Dark mode** — `darkMode: 'class'` + semantic CSS-variable tokens (`canvas`,
  `surface`, `content`, `muted`, `line`, `brand`). A `ThemeToggle` persists the
  choice; an inline script applies it pre-paint (no flash). Core shell + surfaces
  are token-driven; remaining components follow the same pattern.
- **Accessibility** — skip-to-content link, `<main>`/`<header>` landmarks,
  focus-visible rings, `aria-label`s on icon buttons, `aria-live` toasts,
  `prefers-reduced-motion` honoured globally and in motion primitives.
- **Loading skeletons** — `Skeleton*` primitives replace spinners in tables,
  dashboards, lists and galleries (less layout shift, feels faster).
- **Image optimization** — `<Img>` (native lazy-load, async decode, aspect-ratio
  to prevent CLS, blur/skeleton placeholder, error fallback).
- **SEO** — `<Seo>` component sets title/description/canonical/OG/Twitter and can
  auto-merge admin-managed `SeoMeta` per route; base meta + theme-color in HTML.
- **Fast loading** — route-level code-splitting + loaders, font `preconnect`.
- **Prefetch-on-hover** — hovering/focusing a nav link warms both the route's data
  (same `api/queries.js` defs the loader uses → identical cache keys) and its lazy
  JS chunk, so the click is instant. Deduped, best-effort, works for mouse,
  keyboard (`onFocus`) and touch.
- **Reusable layouts** — `Container`, `Section`, `Stack`, `Grid` primitives and
  `RootLayout` / `AdminLayout` shells.
- **Animations** — `FadeIn` / `Stagger` primitives that no-op under reduced motion.

## Authentication

- **JWT** access token (15 min, httpOnly cookie) + **refresh token** (7 days,
  httpOnly, stored hashed with rotation + revocation).
- **Session expiry** is transparent: a 401 triggers a one-shot refresh + retry in
  the axios interceptor; if refresh fails the app forces re-login.
- **Forgot / reset password** with hashed, time-limited tokens (email via SMTP,
  logged in dev). **Change password** revokes other sessions.
- **RBAC** — roles → permission strings, enforced by `requirePermission`.
- **Login history** — every attempt (success/failure) recorded with IP + device;
  users see their history + active sessions at `/admin/login-history`, can **revoke**
  any session or sign out all others, and first-login users (`mustChangePwd`) are
  forced through the change-password screen before accessing the admin.

## Admin CMS

A full content-management back office at `/admin`:
Dashboard (counts, activity, charts), Page Builder (content blocks), News/Notices/
Downloads/Events/Gallery/Video Gallery, Menu + Header/Footer management, SEO,
Roles & Permissions, Users, Website Settings, Audit Logs, Contact Messages,
Enquiries, Backup (JSON export), Profile, and Password Change. Screens are built
on the shared UI kit; simple resources use the generic CrudSection, richer
features have dedicated screens.

## Trash / Restore

Every admin panel has an **Active / Trash** toggle. Deletes are soft by default
(items go to Trash); from Trash you can **Restore** or **Delete forever**. Backed
by the soft-delete API: `?deleted=only`, `POST /admin/<r>/:id/restore`, and
`DELETE /admin/<r>/:id?hard=1`.

## Environment variables

See `server/.env.example` and `client/.env.example`.
