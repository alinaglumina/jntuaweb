# Folder Structure

The repository is a two-package monorepo (`client` + `server`) with shared deployment tooling.

```
jntuaweb-v2/
├── client/                    # React 19 + Vite frontend
│   ├── public/                # static assets (robots.txt)
│   ├── src/
│   │   ├── admin/             # admin portal screens + CrudSection (18 files)
│   │   ├── api/               # React Query hooks + shared query defs
│   │   ├── components/        # UI kit + composite components (47 files)
│   │   ├── content/           # nav manifest + page content JSON
│   │   ├── hooks/             # useTheme, useDebounce, useRecentSearches…
│   │   ├── lib/               # axios instance, queryClient, prefetch
│   │   ├── pages/             # public pages (17 files)
│   │   ├── routes/            # route tree, guards, loaders, lazy defs
│   │   ├── store/             # Redux Toolkit (auth slice)
│   │   └── styles/            # Tailwind entry + design tokens
│   ├── Dockerfile
│   └── nginx.conf             # container web server
├── server/                    # Node + Express + MongoDB API
│   ├── src/
│   │   ├── config/            # env, db, resources registry, permissions
│   │   ├── controllers/       # request handlers (13 files)
│   │   ├── middleware/        # auth, csrf, validation, upload, audit (11 files)
│   │   ├── models/            # Mongoose schemas (43 files)
│   │   ├── plugins/           # global soft-delete plugin
│   │   ├── routes/            # route groups (auth, admin, public…)
│   │   ├── scripts/           # seed + ETL migration
│   │   ├── services/          # mailer, image optimize
│   │   ├── utils/             # helpers (ApiResponse, tokens, fileType…)
│   │   ├── app.js             # Express app assembly
│   │   └── server.js          # entry point
│   ├── ecosystem.config.cjs   # PM2
│   └── Dockerfile
├── deploy/                    # provisioning, SSL, backups
├── nginx/                     # production reverse proxy config
├── .github/workflows/         # CI + deploy pipelines
├── docs/                      # this documentation set
└── docker-compose.yml
```

## Conventions
- **Server** follows a layered structure: `routes → controllers → models`, with
  cross-cutting concerns in `middleware/`, reusable logic in `utils/`/`services/`,
  and configuration (env, DB, the resource registry, permissions) in `config/`.
- **Client** separates `pages/` (public), `admin/` (portal), `components/`
  (reusable UI kit + composites), and `api/` (data hooks). Routing, guards,
  loaders, and lazy definitions live under `routes/`.
- **The resource registry** (`server/src/config/resources.js` and
  `client/src/admin/resources.js`) is the single source of truth for CRUD content
  types — read it first when adding or changing a content section.
