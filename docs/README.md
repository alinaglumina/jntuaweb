# JNTUAWEB v2 — Documentation

Complete documentation for the JNTU Anantapur portal (React 19 + Vite + Express +
MongoDB). Start with the project overview, then jump to what you need.

## Contents

| # | Document | For |
|---|---|---|
| 01 | [Project Documentation](./01-PROJECT.md) | Everyone — overview, stack, architecture |
| 02 | [Folder Structure](./02-FOLDER-STRUCTURE.md) | Developers — where things live |
| 03 | [Installation Guide](./03-INSTALLATION.md) | Developers — local setup |
| 04 | [Environment Variables](./04-ENVIRONMENT.md) | Developers / Ops — every `.env` key |
| 05 | [API Documentation](./05-API.md) → [full reference](./API_REFERENCE.md) | Developers — endpoints |
| 06 | [Database Documentation](./06-DATABASE.md) → [full design](./DATABASE_DESIGN.md) | Developers — schemas, indexes |
| 07 | [Admin User Guide](./07-ADMIN-GUIDE.md) | Content staff — using the admin |
| 08 | [Developer Guide](./08-DEVELOPER-GUIDE.md) | Developers — conventions, adding features |
| 09 | [Maintenance Guide](./09-MAINTENANCE.md) | Ops — running production |
| 10 | [Deployment Guide](./10-DEPLOYMENT.md) → [DigitalOcean runbook](./DEPLOY-DIGITALOCEAN.md) | Ops — going live |
| — | [Security Posture](./SECURITY.md) | Everyone — security controls |

## Quick starts
- **I want to run it locally** → [Installation](./03-INSTALLATION.md)
- **I want to add a content type** → [Developer Guide § resource registry](./08-DEVELOPER-GUIDE.md)
- **I manage content** → [Admin User Guide](./07-ADMIN-GUIDE.md)
- **I'm deploying** → [Deployment](./10-DEPLOYMENT.md)
- **Something's broken in prod** → [Maintenance § Troubleshooting](./09-MAINTENANCE.md)

## At a glance
- **Frontend:** React 19, Vite, React Router v7, Redux Toolkit, TanStack Query,
  Tailwind (dark mode), Framer Motion.
- **Backend:** Node, Express, MongoDB/Mongoose, JWT + refresh rotation, Helmet,
  CSRF, rate limiting, Winston.
- **41 models · config-driven CRUD for every resource · 14 RBAC roles · global
  search · SEO (sitemap/robots/JSON-LD) · automatic backups.**
- **Infra:** Docker, PM2, Nginx, GitHub Actions, DigitalOcean.

*This documentation reflects the codebase as built. When behavior and docs
diverge, the code is the source of truth — please update the docs.*
