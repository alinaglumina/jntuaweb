# JNTUAWEB v2 — Project Documentation

## Overview
JNTUAWEB v2 is a full migration of the Jawaharlal Nehru Technological University
Anantapur (JNTUA) portal from a legacy PHP/MySQL application to a modern
JavaScript stack. It preserves the university's public site (43 pages), its large
admin surface (250+ manageable content sections), file library, examinations,
results, and directorate/unit content, while adding authentication, security,
search, SEO, and a config-driven admin.

## Technology stack
**Frontend** — React 19, Vite, React Router v7, Redux Toolkit (auth), TanStack
Query (server state), Tailwind CSS (semantic dark-mode tokens), Framer Motion,
React Hook Form, React Helmet Async.

**Backend** — Node.js, Express, MongoDB + Mongoose, JWT (httpOnly cookies) with
refresh-token rotation, bcrypt, Multer + sharp (uploads), Nodemailer, Winston,
Helmet, express-rate-limit, express-validator.

**Infra** — Docker / docker-compose, PM2 (cluster), Nginx (reverse proxy + TLS),
GitHub Actions (CI + deploy), DigitalOcean droplet or managed services.

## Architecture at a glance
- **Config-driven admin.** A single resource registry on each side
  (`server/src/config/resources.js`, `client/src/admin/resources.js`) describes
  every content type — model, searchable fields, roles, columns, form fields. One
  generic CRUD controller and one `<CrudSection>` render all of them, so adding a
  content type is a config change, not new screens.
- **Shared query definitions.** `client/src/api/queries.js` holds query defs used
  by hooks, route loaders, and prefetch-on-hover — guaranteeing identical cache
  keys everywhere.
- **Envelope responses.** Every API response is `{ success, data, error }`.
- **Soft delete everywhere.** A global Mongoose plugin adds trash/restore to all
  models; the admin has an Active/Trash toggle.
- **Layered security.** Helmet+CSP, CORS allowlist, CSRF double-submit tokens,
  rate limiting, input validation, sanitization, secure cookies, file magic-byte
  validation, audit logging.

## Key capabilities
Public site with mega-menu and dynamic directorate/unit/academic pages; a
config-driven admin portal with RBAC (14 roles) and audit logs; JWT auth with
refresh rotation, password reset, session revocation, forced first-login password
change; media library (PDF/Word/Excel/images/video/ZIP) with preview, download
tracking, replace, bulk actions; global search across 8 content categories with a
command palette; dark mode, accessibility, skeletons, prefetch-on-hover; SEO with
structured data, sitemap, robots; automatic backups.

## Related documents
Folder structure (`02`), Installation (`03`), Environment (`04`), API (`05` +
`API_REFERENCE.md`), Database (`06` + `DATABASE_DESIGN.md`), Admin guide (`07`),
Developer guide (`08`), Maintenance (`09`), Deployment (`10` +
`DEPLOY-DIGITALOCEAN.md`), Security (`SECURITY.md`).
