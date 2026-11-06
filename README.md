# Synexc CMS — backend

API for the Synexc CMS: blogs, case studies, announcements, website content (hero slides, testimonials, FAQs,
partner logos, team, timeline, certifications, key stats, gallery), site settings, and access control
(users, roles, permissions). Same stack and folder layout as the HRM backend.

**Stack:** Node · Express 5 · TypeScript · Prisma 7 (PostgreSQL, `@prisma/adapter-pg`) · Joi · JWT in httpOnly cookies · multer + S3 for uploads.

## Setup

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL, JWT_SECRET, AWS_*, FRONTEND_URL
npx prisma migrate dev --name init   # creates the tables (first run only — review the SQL it generates)
npm run seed                  # permissions, roles, first admin, site settings (safe to re-run)
npm run dev                   # http://localhost:3000
```

`FRONTEND_URL` is a comma-separated list of allowed browser origins — the CMS **and** the public website,
e.g. `http://localhost:5173,https://www.synexc.com`.

The seed creates `admin@synexc.com`. Set `SEED_ADMIN_PASSWORD` in `.env`, or leave it empty and a random
password is printed **once** — change it after the first login.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with reload (`tsx --watch`) |
| `npm run build` / `npm start` | Generate Prisma client + compile to `dist/` / run it |
| `npm run seed` | Idempotent seed (never overwrites edited passwords, role permissions or settings) |
| `npm run prisma:validate` | Validate `prisma/schema.prisma` (no database needed) |

## Layout

```
prisma/schema.prisma         20 tables — see the conventions at the top of the file
src/
  config/        express app + prisma client
  constant/      env + status constants
  routes/v1/     client/ (private, per module) · public/ (website, read-only)
  controller/    request handlers (wrapped so thrown errors become a JSON 400)
  services/      database access — one folder per table, plus the shared ordered-list factory
  middlewares/   authentication · gateway (permissions) · joi (validation) · logger
  seeds/         npm run seed
  assets/        default permissions / roles / site settings, localization strings
```

## Conventions

- Every table: `id`, `status` (`ACTIVE | INACTIVE | DELETED`), `createdAt`, `updatedAt`, `deletedAt`; CMS-created
  rows also have `createdById`.
- **Delete is soft**: it only sets `status = DELETED` (and stamps `deletedAt`); every other column keeps its value and reads hide the row.
  Because the row keeps its values, a deleted row still reserves its unique values (email, slug, role/category name).
- "Visible on website" for the ordered lists = `status` `ACTIVE` / `INACTIVE`.
- Responses always look like `{ success, message, data, meta }`. Validation errors are `400 { message, errors[] }`.
- Lists: `GET /<module>/list?page=1&limit=10` → `meta: { page, limit, totalRecords, totalPages }`.
  Single item: `GET /<module>?id=…`. Create `POST /`, update `PUT /` (with `id` in the body), delete `DELETE /?id=…`.
  Ordered lists add `PUT /<module>/move  { id, direction: "up" | "down" }`.

## Auth & permissions

- `POST /auth/login` sets `accessToken` (15 min) and `refreshToken` (7 days) as httpOnly cookies — they are never
  in the response body. `POST /auth/refresh-token` renews them, `POST /auth/logout` revokes the session.
- 5 wrong passwords lock the account for 15 minutes.
- Every private route passes through `authenticate` then the permission gateway
  (`src/middlewares/gateway/permissions`). A role needs one of the listed `<action>:<subject>` grants for the exact
  path + method; the built-in **Admin** role always has everything.
- `GET /account/my-profile` returns the user with `permissions: ["blog:create", …]` (`<subject>:<action>`), which is
  what the CMS frontend checks.
- Adding a module = a table in the schema, a value in the `PermissionSubject` enum, the permission in
  `assets/default/permissions.ts` and the gateway table, plus the service / controller / routes.

## Public website API (`/api/v1/public`, no login)

Only returns content that is switched on; articles must be published and past their publish date.

`blog/list` · `blog?slug=` · `blog-category/list` · `case-study/list` · `case-study?slug=` · `announcement/list`
(live today) · `site-setting` · `hero-slide/list` · `testimonial/list?page=` · `faq/list?group=` ·
`partner-logo/list?placement=` · `team-member/list` · `timeline-event/list` · `certification/list` ·
`key-stat/list` · `gallery-image/list?album=`

## Files (Media)

Every uploaded file (image, PDF) is one row in the `Media` table: name, size, mimetype, S3 key (`url`) and, for
images, a 400px WebP thumbnail key (`thumbnailUrl`). Other tables never store a URL; they store the **Media id**
(`featuredImageId`, `imageId`, `logoId`, `avatarId`, `photoId`).

1. `POST /common/upload` (multipart, field `files`, up to 10; images + PDF, 10 MB each) returns the Media rows.
2. Save the returned `id` on the record, e.g. `POST /blog { …, "featuredImageId": "<id>" }`. Send `null` to clear it.
3. Reads embed the file: `blog.featuredImage = { id, name, size, mimetype, url, thumbnailUrl }`. The API turns the
   stored S3 keys into full URLs using `MEDIA_BASE_URL`, so clients never need to know where files live.

Unknown ids are rejected (`invalid_reference`). Required pictures: hero slide image, partner logo, gallery image.
The bucket needs public read (or a CDN in front). For local development set `AWS_S3_ENDPOINT` to MinIO.

## Notes

- Inquiries are intentionally not part of this API yet.
- Prisma is pinned to 7.x; move to 8 once `@prisma/client` 8.0.0 is published.
