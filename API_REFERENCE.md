# JNTUAWEB v2 — REST API Reference

Base URL: `/api`. All responses use the envelope `{ success, data, error }`.
Auth is a JWT in an httpOnly cookie. Admin routes require a session; some require a specific permission.

## Authentication
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/login` | — | `{ username, password }` → sets cookie |
| POST | `/auth/logout` | — | clears cookie |
| GET | `/auth/me` | session | current user |
| POST | `/auth/change-password` | session | `{ currentPassword, newPassword }` |

## Public (read-only)
`GET /slides`, `/gallery`, `/mous`, `/emagazines`, `/news`, `/honoris`,
`/administration`, `/directorate-content`, `/events`, `/downloads`, `/circulars`, `/menus`
— each supports `?q=`, `?page=`, `?limit=`, `?sort=`.
Single by key: `GET /administration/key/:roleKey`, `/directorate-content/key/:key`, `/page-content/key/:key`.

## Search
| GET | `/search?q=<term>&limit=5` | — | global search across notifications, news, circulars, downloads, events, faculty, MOUs, pages |

## Admin — generic CRUD (session + role)
For each resource: `GET /admin/<r>`, `GET /admin/<r>/:id`, `POST /admin/<r>`, `PUT /admin/<r>/:id`, `DELETE /admin/<r>/:id`.
Resources (21): `notifications, news, gallery, mous, emagazines, slides, faculty,
administration, directorate-content, honoris, senate, regulations, dacp, dafa-docs,
page-content, events, circulars, downloads, departments, students, menus`.
Resources with an upload field accept `multipart/form-data`.

**Requested feature → endpoint**
| Feature | Endpoint |
|---|---|
| Notices | `/admin/notifications` |
| Circulars | `/admin/circulars` |
| Downloads | `/admin/downloads` |
| News | `/admin/news` |
| Events | `/admin/events` |
| Gallery / Images | `/admin/gallery`, `/admin/media` |
| Faculty | `/admin/faculty` |
| Departments | `/admin/departments` |
| Students | `/admin/students` |
| Files | `/admin/media` |
| Menus (CMS nav) | `/admin/menus` |
| CMS pages | `/admin/page-content` |

## Admin — Media Library (session)
| GET | `/admin/media?folder=<id>` | list files + folders |
| POST | `/admin/media` | upload (multipart `file`) |
| POST | `/admin/media/folders` | create folder |
| DELETE | `/admin/media/:id` | delete file |
| DELETE | `/admin/media/folders/:id` | delete folder |

## Admin — Users (perm: `users:manage`)
`GET/POST /admin/users`, `PUT/DELETE /admin/users/:id`.

## Admin — Roles & Permissions (perm: `roles:manage`)
| GET | `/admin/permissions` | permission catalog |
| GET/POST | `/admin/roles` | list / create |
| PUT/DELETE | `/admin/roles/:id` | update / delete (system roles protected) |

## Admin — Dashboard & Logs
| GET | `/admin/dashboard` | session | counts per resource + recent activity |
| GET | `/admin/logs?actor=&action=&resource=` | perm `logs:read` | audit trail |

## Settings
| GET | `/settings` | — | key/value map |
| PUT | `/settings` | perm `settings:write` (admin) | upsert keys |

## Roles (seeded)
- **admin** → `['*']` (all permissions)
- **director** → content permissions, scoped to their directorate for section-based resources

## Audit logging
Every successful `POST/PUT/DELETE` under `/admin` and every `login/logout` is recorded
to the audit log (actor, action, resource, path, status, ip, timestamp).
