# Developer Guide

## Mental model
Two packages: `client` (React SPA) and `server` (Express API). The API answers
`/api/*` and returns `{ success, data, error }`. In production Nginx serves the
built client and proxies `/api`, `/uploads`, `/sitemap.xml`, `/robots.txt` to Node.

## The resource registry (read this first)
Most content types are **config, not code**. Two registries describe them:

- **Server** `server/src/config/resources.js` — each key →
  `{ model, upload:[field,subdir], searchable, roles, sectionField }`. A generic
  `crudController` + the admin router iterate it for list/create/update/delete,
  uploads, soft-delete/restore, and search.
- **Client** `client/src/admin/resources.js` — each key →
  `{ label, group, icon, roles, columns, fields:[…] }`. One `<CrudSection>`
  renders any of them.

### Adding a new content type
1. Create the Mongoose model in `server/src/models/` and export it from
   `models/index.js`.
2. Add a server registry entry (model + searchable + roles).
3. Add a client registry entry (label, group, icon, columns, form fields).
4. That's it — CRUD, search, trash/restore, and the admin screen exist
   automatically. No new routes or components required.

## Data fetching
- Shared query defs live in `client/src/api/queries.js`. **Always** define a query
  there if it's used by more than one place — hooks, route loaders, and
  prefetch-on-hover all import the same def so cache keys match exactly.
- Mutations use TanStack Query `useMutation` and invalidate the relevant keys.
- The axios instance (`client/src/lib/axios.js`) auto-refreshes on 401 and
  attaches the CSRF token on mutations.

## Auth flow
Access token (15 min, httpOnly `jntua_token`) + rotating refresh token (7 days,
httpOnly `jntua_rt`, hashed at rest). On 401 the client silently refreshes; if
that fails it emits `auth:expired`. Guards: `ProtectedRoute`, `RoleRoute`.

## Conventions
- **Responses:** use `ok(res, data, status)` / throw `ApiError.badRequest(...)`.
  The error handler maps CastError/ValidationError/duplicate-key to 400/400/409.
- **Soft delete:** all models get `isDeleted`/`deletedAt` + `softDelete()`/
  `restore()` via the global plugin; queries hide deleted docs unless
  `.withDeleted()`.
- **Security:** mutations require CSRF; validate inputs (express-validator);
  sanitize HTML; never trust file extensions (magic-byte check runs on upload).
- **Styling:** use semantic Tailwind tokens (`bg-surface`, `text-content`,
  `border-line`, `text-muted`, `bg-canvas`) so dark mode works. Institutional
  colors (`navy`, `crimson`, `gold`) are fixed brand identity.

## Local workflow
```bash
# terminal 1
cd server && npm run dev
# terminal 2
cd client && npm run dev
```
Lint: `npm run lint` in each package. Build the client with `npm run build`.

## Testing without a live DB
The codebase is verified in CI via schema `validateSync`, Express boot tests with
stubbed model methods, and `vite build`. When boot-testing an authed route, sign a
JWT with the test secret, set the `jntua_token` cookie, GET once to obtain the
`jntua_csrf` cookie, then echo it in `X-CSRF-Token` on mutations. Use a valid
24-hex ObjectId for stub ids to avoid CastErrors.

## CI/CD
`.github/workflows/ci.yml` runs lint + build + docker build on push/PR.
`.github/workflows/deploy.yml` deploys on a `v*` tag via SSH (pull, install,
rebuild client, reload PM2 + Nginx).

## Where things live
| Task | Location |
|---|---|
| Add an API endpoint | `server/src/routes/*` + a controller |
| Add a page | `client/src/pages/*` + a route in `client/src/routes/PublicRoutes.jsx` |
| Add a reusable component | `client/src/components/ui/*` (export from the barrel) |
| Change the nav | `client/src/content/nav.js` |
| Adjust permissions | `server/src/config/permissions.js` |
