# Database Documentation

MongoDB via Mongoose. Full schema/index/relationship detail is in
[`DATABASE_DESIGN.md`](./DATABASE_DESIGN.md). This is the orientation.

## Collections (41 models)
Content (Notification, News, Slide, GalleryItem, Mou, EMagazine, HonorisCausa,
ContentBlock, PageContent, DirectorateContent…), academics (Department, Faculty,
Regulation, Download, Admission, Examination, Result), documents (DafaDoc,
SenateDoc, DacpFile), communication (ContactMessage, Enquiry, Video, SeoMeta),
system (User, Role, AuditLog, LoginHistory, RefreshToken, SearchLog, MediaFile,
MediaFolder, Menu, Setting) and more.

## Cross-cutting design
- **Envelope + soft delete.** A global plugin adds `isDeleted`/`deletedAt` to
  every schema, with `softDelete()`/`restore()` and query middleware that hides
  deleted docs by default (`.withDeleted()` / `.onlyDeleted()` to include).
- **Timestamps.** `createdAt`/`updatedAt` on all models.
- **Indexes.** Single + compound indexes per collection for common filters/sorts;
  TTL index on `RefreshToken.expiresAt`; unique index on `SearchLog.term`.
- **Security at rest.** Password hashes (`select:false`); refresh & reset tokens
  stored **hashed** (SHA-256).

## Relationships
Mostly reference-by-id with role/directorate scoping enforced in the app layer
(`sectionField` on the resource registry). Media files reference optional folders.
Audit logs and login history reference the acting user.

## Operations
- Indexes auto-create on connect.
- Inspect: `mongosh jntuaweb` → `db.<c>.getIndexes()` / `.explain()`.
- Backup/restore: `deploy/backup.sh` / `deploy/restore.sh` (mongodump/mongorestore).
- ETL from the legacy MySQL dump: `npm run migrate` (`migrate:dry` to preview).
