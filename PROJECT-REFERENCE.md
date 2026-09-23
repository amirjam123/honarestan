# PROJECT REFERENCE MAP

> Internal technical knowledge base for future coding agents. This document is based on the current project source, schema, configuration, migrations, and documentation inspected during the audit. Where runtime behavior or deployment state could not be proven from the repository, it is explicitly marked **Not verified**.

## Project Identity

- **Project name:** Honarestan Hadi / هنرستان هادی
- **Purpose:** Persian/RTL website and CMS for an art/technical school.
- **Last audit/update:** 2026-09-23
- **Framework:** Next.js 16.2.10, App Router
- **Language:** TypeScript, strict mode
- **Runtime:** Node.js (exact production version: **Not verified**)
- **Package manager:** npm; `package-lock.json` is present
- **Database:** PostgreSQL via Prisma ORM 7 and `@prisma/adapter-pg`
- **Authentication:** JWT in an `admin_token` HTTP-only cookie, bcrypt password hashes
- **Deployment platform:** Vercel is the documented/intended platform; production deployment itself: **Not verified**
- **External services:** Neon-compatible PostgreSQL is documented; Telegram upload is optional. Actual production provider/account state: **Not verified**

# 1. PROJECT OVERVIEW

This is a full-stack Persian website with a public school website and a client-heavy administrative CMS.

Public users can browse school information, principal information, teachers, news, gallery, events, student works, and contact/ticket information. Administrators can manage content, profiles, settings, SEO, media, tickets, backups, imports, and security-related operational data.

The application is a monolith:

- Public pages are mostly async Server Components querying Prisma directly.
- The contact/ticket interface is a Client Component.
- The admin layout and most admin pages are Client Components.
- Admin pages call Next.js Route Handlers under `src/app/api/`.
- Prisma uses a PostgreSQL adapter and a singleton-style development client.
- Public and admin UI use Tailwind CSS utility classes and a custom SVG icon library.

# 2. TECHNOLOGY STACK

| Category | Technology | Version | Where Used |
| --- | --- | --- | --- |
| Framework | Next.js | 16.2.10 | `src/app/**`, `next.config.ts` |
| UI runtime | React | 19.2.4 | `src/app/**`, `src/components/**` |
| UI runtime | React DOM | 19.2.4 | Next.js app runtime |
| Language | TypeScript | 5.x | `tsconfig.json`, all TS/TSX files |
| Styling | Tailwind CSS | 4.x | `postcss.config.mjs`, `src/app/globals.css` |
| ORM | Prisma | 7.8.x declared | `prisma/schema.prisma`, `prisma.config.ts` |
| Prisma PostgreSQL adapter | `@prisma/adapter-pg` | 7.9.x declared; lockfile version is also relevant | `src/lib/prisma.ts`, `prisma/seed.ts` |
| PostgreSQL driver | `pg` | 8.22.x | Prisma adapter/runtime |
| Authentication | `jsonwebtoken` | 9.0.x | `src/lib/auth.ts`, `/api/auth/*` |
| Password hashing | `bcryptjs` | 3.x | `src/lib/auth.ts`, `prisma/seed.ts` |
| Cookie handling | `cookie` | 2.x | Auth utilities/routes |
| Spreadsheet import | `xlsx` | 0.18.5 | `src/app/api/import/[model]/route.ts` |
| Environment loading | `dotenv` | 17.x | `prisma.config.ts`, `prisma/seed.ts` |
| Icons | Custom inline SVG | Not versioned | `src/components/icons/index.tsx` |
| Testing | None detected | Not verified | No test files/scripts found |
| Deployment | Vercel documented | Not verified | `PROJECT-DOCS.md`, package scripts |

## Important version observation

`package.json` declares Prisma client/CLI 7.8.x and `@prisma/adapter-pg` 7.9.x. The lockfile should be treated as authoritative for installed versions. This version split has not been runtime-verified.

# 3. DIRECTORY MAP

```text
project-root/
├── src/
│   ├── app/
│   │   ├── (public)/                 # Public route group; URL does not include (public)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/
│   │   │   ├── events/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── news/page.tsx
│   │   │   ├── news/[id]/page.tsx
│   │   │   ├── student-works/page.tsx
│   │   │   └── teachers/page.tsx
│   │   ├── hadi-panel-x7k9/        # Actual physical admin route segment
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── ...admin pages
│   │   ├── api/                    # Route Handlers
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── admin/                  # Admin-only reusable components
│   │   ├── icons/                  # Shared SVG icon definitions
│   │   ├── layout/                 # Header/Footer
│   │   └── ui/                     # Hero/cards/lightbox/JSON-LD/etc.
│   ├── lib/                         # Prisma, auth, validation, SEO, settings, media helpers
│   └── middleware.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/                  # Five migration directories currently found
│   ├── seed.ts
│   ├── seed.cjs
│   └── migrations/migration_lock.toml
├── public/
│   ├── templates/                   # XLSX templates
│   ├── uploads/                     # Runtime-uploaded public files
│   └── icon.svg
├── scripts/
│   ├── backup.sh
│   ├── restore.sh
│   └── generate-templates.ts
├── docs/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── postcss.config.mjs
├── prisma.config.ts
├── .env.example
├── README.md
├── PROJECT-DOCS.md
├── PROJECT-OVERVIEW.md
└── other audit/security/performance documentation
```

## Directory purposes

- `src/app/(public)/`: public route group. `(public)` is not a URL segment.
- `src/app/hadi-panel-x7k9/`: current physical admin route segment. Environment configuration does not move this folder.
- `src/app/api/`: REST-like JSON Route Handlers for auth, content CRUD, tickets, uploads, SEO, setup, and admin operations.
- `src/components/`: reusable UI, layout, admin, and icon code. Shared components can affect many pages.
- `src/lib/`: server/client utilities. Important files include `prisma.ts`, `auth.ts`, `validation.ts`, `seo.ts`, `settings-cache.ts`, and `sync-password.ts`.
- `prisma/schema.prisma`: current database source of truth.
- `prisma/migrations/`: migration history. Do not edit applied migrations; add a new migration for schema changes.
- `public/uploads/`: public static upload destination. Persistence on serverless hosting is **Not verified** and is a known deployment concern.
- `public/templates/`: static Excel templates.
- `scripts/`: backup/restore and template-generation utilities. Current shell backup scripts assume SQLite and do not match current PostgreSQL architecture.

# 4. APPLICATION ARCHITECTURE

## Frontend architecture

Public pages are generally async Server Components and read Prisma directly:

```text
Public URL
  ↓
Server page
  ↓
Prisma query
  ↓
HTML + streamed Suspense sections
```

Client boundaries include:

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/(public)/contact/page.tsx`
- `src/components/ui/GalleryItem.tsx`
- `src/components/ui/ImageLightbox.tsx`
- `src/app/hadi-panel-x7k9/layout.tsx`
- Most files under `src/app/hadi-panel-x7k9/`
- `src/components/admin/`

## Backend architecture

There is no separate backend server. Next.js Route Handlers are the backend:

```text
Browser
  ↓ fetch
src/app/api/**/route.ts
  ↓ requireAdmin() or public validation
PrismaClient
  ↓
PostgreSQL
```

There are no verified Server Actions. API methods are `GET`, `POST`, `PUT`, `PATCH`, and `DELETE` in `route.ts` files.

## Rendering strategy

- Most public database-backed pages use `export const dynamic = "force-dynamic"`.
- Home uses Suspense and skeleton fallbacks for independent sections.
- Admin is primarily client-rendered and fetches APIs in the browser.
- Static generation/ISR is not verified for content pages; current `force-dynamic` usage indicates dynamic SSR for those routes.
- Actual production rendering behavior on Vercel is **Not verified**.

## Data flow

```text
Prisma-backed public page
  → findUnique/findMany
  → render server HTML

Admin browser component
  → fetch('/api/...')
  → Route Handler
  → requireAdmin()
  → Prisma mutation
  → JSON response
  → local React state update
```

Settings have a special module cache in `src/lib/settings-cache.ts` with a 60-second in-memory TTL.

# 5. ROUTING MAP

| Route | File | Purpose | Auth Required | Important Dependencies |
| --- | --- | --- | --- | --- |
| `/` | `src/app/(public)/page.tsx` | Public home and CMS sections | No | Prisma, SEO, Hero, NewsCard, ImageLightbox |
| `/about` | `src/app/(public)/about/page.tsx` | School/principal profile | No | SchoolProfile, PrincipalProfile, Page, Teacher |
| `/teachers` | `src/app/(public)/teachers/page.tsx` | Published teachers | No | Teacher |
| `/gallery` | `src/app/(public)/gallery/page.tsx` | Gallery | No | Gallery, GalleryItem, ImageLightbox |
| `/news` | `src/app/(public)/news/page.tsx` | Published news list | No | News |
| `/news/[id]` | `src/app/(public)/news/[id]/page.tsx` | News detail by database ID | No | News, SEO |
| `/events` | `src/app/(public)/events/page.tsx` | Published events | No | Event |
| `/student-works` | `src/app/(public)/student-works/page.tsx` | Published student artwork | No | StudentWork |
| `/contact` | `src/app/(public)/contact/page.tsx` | Contact/ticket UI | No | Ticket APIs, settings |
| `/hadi-panel-x7k9` | `src/app/hadi-panel-x7k9/page.tsx` | Admin dashboard | Client UI gate; APIs protected | Admin APIs, stats |
| `/hadi-panel-x7k9/login` | `src/app/hadi-panel-x7k9/login/page.tsx` | Admin login | No | `/api/auth` |
| `/hadi-panel-x7k9/news` | `src/app/hadi-panel-x7k9/news/page.tsx` | News CRUD | Yes at API level | News API, ExcelImport |
| `/hadi-panel-x7k9/gallery` | `src/app/hadi-panel-x7k9/gallery/page.tsx` | Gallery CRUD | Yes at API level | Gallery/upload APIs |
| `/hadi-panel-x7k9/media` | `src/app/hadi-panel-x7k9/media/page.tsx` | Media library | Yes at API level | Media/upload APIs |
| `/hadi-panel-x7k9/teachers` | `src/app/hadi-panel-x7k9/teachers/page.tsx` | Teacher CRUD | Yes at API level | Teacher API, ExcelImport |
| `/hadi-panel-x7k9/courses` | `src/app/hadi-panel-x7k9/courses/page.tsx` | Course CRUD | Yes at API level | Course API, ExcelImport |
| `/hadi-panel-x7k9/events` | `src/app/hadi-panel-x7k9/events/page.tsx` | Event CRUD | Yes at API level | Event API |
| `/hadi-panel-x7k9/student-works` | `src/app/hadi-panel-x7k9/student-works/page.tsx` | Student work CRUD | Yes at API level | StudentWork API |
| `/hadi-panel-x7k9/pages` | `src/app/hadi-panel-x7k9/pages/page.tsx` | Page editor | Yes at API level | Pages API |
| `/hadi-panel-x7k9/school` | `src/app/hadi-panel-x7k9/school/page.tsx` | School profile editor | UI expects admin; current PUT API is unprotected | School API |
| `/hadi-panel-x7k9/principal` | `src/app/hadi-panel-x7k9/principal/page.tsx` | Principal editor | UI expects admin; current PUT API is unprotected | Principal API |
| `/hadi-panel-x7k9/settings` | `src/app/hadi-panel-x7k9/settings/page.tsx` | Site settings | Yes at API level | Settings API |
| `/hadi-panel-x7k9/seo` | `src/app/hadi-panel-x7k9/seo/page.tsx` | SEO settings | Yes at API level | SEO APIs |
| `/hadi-panel-x7k9/templates` | `src/app/hadi-panel-x7k9/templates/page.tsx` | Excel templates | No/partial; template files public | `public/templates` |
| `/hadi-panel-x7k9/tickets` | `src/app/hadi-panel-x7k9/tickets/page.tsx` | Ticket administration | Yes at API level | Admin ticket APIs |
| `/hadi-panel-x7k9/messages` | `src/app/hadi-panel-x7k9/messages/page.tsx` | Contact messages | Yes at API level | Contact API |
| `/hadi-panel-x7k9/recycle-bin` | `src/app/hadi-panel-x7k9/recycle-bin/page.tsx` | Soft-deleted content | Yes at API level | Recycle-bin/media APIs |
| `/hadi-panel-x7k9/backup` | `src/app/hadi-panel-x7k9/backup/page.tsx` | Backup/restore | Yes at API level | Admin backup API |
| `/hadi-panel-x7k9/password` | `src/app/hadi-panel-x7k9/password/page.tsx` | Password change | Yes at API level | Auth change-password API |
| `/hadi-panel-x7k9/setup` | `src/app/hadi-panel-x7k9/setup/page.tsx` | Setup wizard | Setup API has separate controls | Setup APIs |
| `/robots.txt` | `src/app/robots.ts` | Robots rules | No | Site URL/admin path |
| `/sitemap.xml` | `src/app/sitemap.ts` | Dynamic sitemap | No | News and site URL |

## Important routing inconsistencies

- No current public `src/app/(public)/courses/page.tsx` was found, although course API/admin/seed/SEO references exist.
- Current news detail is `[id]`, not `[slug]`.
- `ADMIN_SECRET_PATH` does not relocate the physical `hadi-panel-x7k9` route segment.

# 6. FEATURE MAP

## Feature: Public home and CMS content

- Purpose: Show school content and latest/preview content.
- Main pages: `src/app/(public)/page.tsx`, public listing pages.
- Main components: `Hero`, `NewsCard`, `ImageLightbox`, `JsonLd`.
- APIs: Public server-side Prisma reads; no browser API is required for initial home data.
- Database models: `SchoolProfile`, `PrincipalProfile`, `Teacher`, `StudentWork`, `News`, `Gallery`, `SiteSetting`, `SeoSetting`.
- Authentication: None.
- Important files: `src/app/(public)/page.tsx`, `src/lib/prisma.ts`, `src/lib/seo.ts`, `src/app/layout.tsx`.
- Related features: About, gallery, news, SEO, settings.
- Notes: Suspense improves streaming but not total database work.

## Feature: School profile

- Purpose: Display/edit school overview and related information.
- Main pages: `src/app/(public)/about/page.tsx`, `src/app/hadi-panel-x7k9/school/page.tsx`.
- Main components: No dedicated shared school profile component found.
- API: `src/app/api/school/route.ts` (`GET`, `PUT`).
- Database model: `SchoolProfile`.
- Authentication: **Verified issue:** `PUT` does not call `requireAdmin()`.
- Important files: `src/app/api/school/route.ts`, `src/app/(public)/about/page.tsx`, admin school page.
- Related features: About, home, settings-like content.
- Notes: `findFirst()` is used and singleton behavior is not enforced by schema/API.

## Feature: Principal profile

- Purpose: Display/edit principal information.
- Main pages: `src/app/(public)/about/page.tsx`, `src/app/(public)/page.tsx`, admin principal page.
- Main components: No dedicated shared principal component found.
- API: `src/app/api/principal/route.ts` (`GET`, `PUT`).
- Database model: `PrincipalProfile`.
- Authentication: **Verified issue:** `PUT` does not call `requireAdmin()`.
- Important files: `src/app/api/principal/route.ts`, public About/Home pages.
- Related features: School profile, settings.
- Notes: Biography/achievements are stored as strings/JSON strings.

## Feature: News

- Purpose: List and display published news; admin CRUD.
- Pages: `src/app/(public)/news/page.tsx`, `src/app/(public)/news/[id]/page.tsx`, admin news page.
- Components: `src/components/ui/NewsCard.tsx`.
- API: `/api/news`, `/api/news/[id]`.
- Model: `News`.
- Authentication: Public reads; admin mutations use `requireAdmin()`.
- Important files: `src/app/api/news/route.ts`, `src/app/api/news/[id]/route.ts`, `src/app/hadi-panel-x7k9/news/page.tsx`.
- Related features: Home latest news, sitemap, Excel import.
- Notes: Detail uses database `id`; `slug` is stored/unique but not used by the current route.

## Feature: Gallery and media

- Purpose: Display public gallery and manage media files.
- Pages: `src/app/(public)/gallery/page.tsx`, admin gallery/media pages.
- Components: `GalleryItem`, `ImageLightbox`, `ImageUpload`.
- APIs: `/api/gallery`, `/api/gallery/[id]`, `/api/media`, `/api/upload`, `/api/images`.
- Models: `Gallery`, `MediaItem`.
- Authentication: Admin APIs generally require `requireAdmin()`; public gallery is public.
- Important files: gallery API/pages, media page/API, upload API, `src/lib/image-compress.ts`.
- Related features: Home gallery preview, student works, news images, admin uploads.
- Notes: Gallery and student-work category filters are currently visual-only.

## Feature: Teachers

- Purpose: Display and manage teacher profiles.
- Pages: `/teachers`, `/about`, `/`, admin teachers page.
- API: `/api/teachers`, `/api/teachers/[id]`.
- Model: `Teacher`.
- Authentication: Public published reads; admin mutations protected.
- Important files: `src/app/(public)/teachers/page.tsx`, admin teachers page, teacher API.
- Related features: About, home, Excel import.
- Notes: Public/admin list semantics currently share APIs; draft management is a potential architectural concern.

## Feature: Courses

- Purpose: Manage course records.
- Pages: Admin course page; no current public course page found.
- API: `/api/courses`, `/api/courses/[id]`.
- Model: `Course`.
- Authentication: Admin mutations protected; public page existence is **Not verified/contradicted by inspected structure**.
- Important files: admin courses page, course API, import API, `prisma/seed.ts`.
- Related features: SEO settings, import, navigation/documentation.
- Notes: SEO seed includes `/courses`, but no public page file was found.

## Feature: Events

- Purpose: Display/manage school events.
- Pages: `/events`, admin events page.
- API: `/api/events`, `/api/events/[id]`.
- Model: `Event`.
- Authentication: Public published reads; admin mutations protected.
- Important files: `src/app/(public)/events/page.tsx`, admin events page, event APIs.
- Related features: Home/events content, SEO.
- Notes: No event detail page was found.

## Feature: Student works

- Purpose: Display/manage student artwork.
- Pages: `/student-works`, `/`, admin student-works page.
- API: `/api/student-works`, `/api/student-works/[id]`.
- Model: `StudentWork`.
- Authentication: Public published reads; admin mutations protected.
- Important files: public student-works page, admin page, student-work APIs, `ImageLightbox`.
- Related features: Gallery, home featured works.
- Notes: Category chips are not functional.

## Feature: Contact messages

- Purpose: Submit and administer contact messages.
- Pages: `src/app/(public)/contact/page.tsx` uses ticket flow primarily; admin messages page.
- APIs: `/api/contact`, `/api/contact/message`, `/api/admin/...` where applicable.
- Models: `ContactMessage`.
- Authentication: Public submission; admin listing/mutation protected.
- Important files: contact API, contact UI, messages page.
- Related features: Tickets, rate limiting, security logs.
- Notes: `/api/contact/message` is an alternate public ingestion route with weaker protections than `/api/contact`.

## Feature: Ticket support

- Purpose: Public ticket creation/list/detail/reply and admin responses.
- Pages: contact page, admin tickets page.
- APIs: `/api/tickets`, `/api/tickets/[id]`, `/api/tickets/[id]/messages`, `/api/admin/tickets/**`.
- Models: `Ticket`, `TicketMessage`.
- Authentication: Public routes use email as an ownership hint; admin routes use `requireAdmin()`.
- Important files: `src/app/api/tickets/**`, `src/app/api/admin/tickets/**`, contact page, admin tickets page, schema.
- Related features: Contact, security logging, admin messages.
- Notes: Email-only ownership and client-controlled `senderType` are verified authorization defects.

## Feature: Settings

- Purpose: Key/value site configuration.
- Pages: admin settings, public Header/Footer/contact consumers.
- API: `/api/settings`.
- Model: `SiteSetting`.
- Authentication: GET public; PUT intended admin-protected.
- Important files: `src/app/api/settings/route.ts`, `src/lib/settings-cache.ts`, Header, Footer, contact page.
- Related features: SEO, home hero, contact information.
- Notes: Generic key/value storage has no allowlist; cache invalidation is not explicit.

## Feature: SEO

- Purpose: Metadata, canonical, Open Graph, Twitter, JSON-LD, robots and sitemap.
- Pages: public pages, admin SEO page.
- APIs: `/api/seo`, `/api/seo/[pagePath]`, `/api/seo/validate`.
- Model: `SeoSetting`.
- Authentication: SEO save/validate behavior should be checked per handler; public metadata reads are indirect.
- Important files: `src/lib/seo.ts`, `src/app/layout.tsx`, `robots.ts`, `sitemap.ts`, admin SEO page.
- Related features: All public pages, social sharing.
- Notes: `SITE_URL` export mismatch is a suspected compile issue; verify with typecheck/build before relying on it.

## Feature: Upload/media library

- Purpose: Upload, compress, categorize, search, restore, and delete media.
- Pages: admin media page, admin image forms.
- APIs: `/api/upload`, `/api/upload/telegram`, `/api/media`, `/api/images`.
- Models: `MediaItem`.
- Authentication: Upload/media mutation routes require admin.
- Important files: upload API, media API/page, image compressor, Telegram helper.
- Related features: Gallery, news, teachers, events, student works, settings.
- Notes: Files are written to `public/uploads`; production persistence is not verified.

## Feature: Backup/restore

- Purpose: Export data, create backup metadata, verify, and restore.
- Pages: admin backup page.
- API: `/api/admin/backup`.
- Models: `BackupLog` and exported content/support tables.
- Authentication: API requires admin.
- Important files: `src/app/api/admin/backup/route.ts`, admin backup page, `scripts/backup.sh`, `scripts/restore.sh`.
- Related features: Settings, media, content, tickets.
- Notes: Restore is not transactional and shell scripts still assume SQLite.

## Feature: Setup wizard

- Purpose: Initial setup/bootstrap UI and status/complete/skip/reset endpoints.
- Pages: `src/app/hadi-panel-x7k9/setup/page.tsx`.
- APIs: `/api/setup/status`, `/api/setup/complete`, `/api/setup/skip`, `/api/setup/reset`.
- Models: `AdminUser`, `SiteSetting`; any additional setup-specific models or tables are **Not verified**.
- Authentication: Setup behavior is endpoint-specific and must be inspected before changes; do not assume the normal admin gate.
- Important files: setup page and setup API routes.
- Related features: Auth, settings, password.
- Notes: Setup page is a large client component (~48 KB in file inventory).

# 7. COMPONENT MAP

## `Header`

- File: `src/components/layout/Header.tsx`
- Purpose: Public logo, desktop/mobile navigation, school settings.
- Used by: `src/app/(public)/layout.tsx`.
- Important props: None beyond React props.
- Dependencies: Next navigation, icons, `getSettings`.
- Type: Client Component.
- Impact: Changes affect every public page and mobile navigation.

## `Footer`

- File: `src/components/layout/Footer.tsx`
- Purpose: Public footer, contact links, admin link.
- Used by: public layout.
- Dependencies: settings, navigation, icons.
- Type: Client Component.
- Impact: Affects all public pages; contains a verified hardcoded admin path concern.

## `Hero`

- File: `src/components/ui/Hero.tsx`
- Purpose: Reusable public hero banner.
- Used by: Home and public content pages including Contact.
- Props: title, subtitle, contact visibility.
- Type: Server-compatible component unless it imports client behavior; inspect before changing.
- Impact: Visual changes can affect multiple public pages.

## `NewsCard`

- File: `src/components/ui/NewsCard.tsx`
- Purpose: News summary card.
- Used by: Home and news listing.
- Props: id, title, excerpt, image, date.
- Type: Component with image rendering; inspect before changing.
- Impact: Affects news listing and home.

## `GalleryItem`

- File: `src/components/ui/GalleryItem.tsx`
- Purpose: Gallery image card and modal behavior.
- Used by: Gallery page.
- Props: gallery item/image data.
- Dependencies: `ImageLightbox`, icons.
- Type: Client behavior is required for modal.
- Impact: Gallery UI, keyboard behavior, mobile modal rendering.

## `ImageLightbox`

- File: `src/components/ui/ImageLightbox.tsx`
- Purpose: Fullscreen image viewer.
- Used by: Home, Gallery, Student Works and potentially other image cards.
- Dependencies: image data, close/Escape behavior.
- Type: Client Component.
- Impact: Multiple public image surfaces; focus management and mobile layout are sensitive.

## `JsonLd`

- File: `src/components/ui/JsonLd.tsx`
- Purpose: Inject structured JSON-LD script data.
- Used by: public pages.
- Dependencies: `seo.ts` generators and dynamic SEO values.
- Type: Server-compatible component using `dangerouslySetInnerHTML`.
- Impact: All SEO output; injection/serialization must be handled carefully.

## `AdminSidebar`

- File: `src/components/admin/AdminSidebar.tsx`
- Purpose: Admin navigation, mobile drawer, logout.
- Used by: `src/app/hadi-panel-x7k9/layout.tsx`.
- Dependencies: `getAdminPath`, settings, icons.
- Type: Client Component.
- Impact: All admin routes.

## `GlobalSearch`

- File: `src/components/admin/GlobalSearch.tsx`
- Purpose: Admin global search.
- Used by: Admin layout desktop/mobile headers.
- Dependencies: admin search API, icons, debounce/abort behavior.
- Type: Client Component.
- Impact: Admin navigation/search only.

## `ExcelImport`

- File: `src/components/admin/ExcelImport.tsx`
- Purpose: Upload and report Excel imports.
- Used by: selected admin content pages.
- Dependencies: `/api/import/[model]`.
- Type: Client Component.
- Impact: Bulk data operations.

## `ImageUpload`

- File: `src/components/admin/ImageUpload.tsx`
- Purpose: Image upload control for admin forms.
- Used by: selected admin CRUD pages.
- Dependencies: upload APIs.
- Type: Client Component.
- Impact: Image URL fields and admin form behavior.

# 8. DATABASE MAP

## Technology and access

- Database: PostgreSQL.
- ORM/query system: Prisma Client generated to `src/generated/prisma`.
- Adapter: `PrismaPg` in `src/lib/prisma.ts`.
- Access layer: `src/lib/prisma.ts`; most pages import `prisma` directly; API handlers use the same client.
- Development singleton: global Prisma instance retained when `NODE_ENV !== "production"`.
- Migrations: Prisma migration directories under `prisma/migrations/`.
- Seed: `prisma/seed.ts` via npm script; `prisma/seed.cjs` also exists and is divergent.

## Models/tables

### Content

- `News`: id, title, unique slug, content, excerpt, image, published, timestamps, soft-delete fields.
- `Gallery`: id, title, description, image, category, timestamps, soft-delete fields.
- `Page`: id, unique slug, title, content, updatedAt. No soft-delete fields.
- `Teacher`: id, name, title, bio, image, specialty, sortOrder, published, timestamps, soft-delete fields.
- `StudentWork`: id, title, studentName, description, image, category, year, featured, published, timestamps, soft-delete fields.
- `Event`: id, title, description, image, date, location, published, timestamps, soft-delete fields.
- `Course`: id, title, description, image, duration, level, sortOrder, published, timestamps, soft-delete fields.
- `Testimonial`: id, name, role, content, image, rating, sortOrder, published, timestamps. No soft-delete fields.

### Profiles/configuration

- `SchoolProfile`: overview, history, vision, mission, educationalGoals, departments, facilities, statistics JSON string, galleryImages JSON string, additionalInfo, published, timestamps.
- `PrincipalProfile`: name, photo, position, biography, welcomeMessage, resume, achievements JSON string, contactInfo, published, timestamps.
- `SiteSetting`: unique key/value.
- `SeoSetting`: unique pagePath plus metadata, social fields, robots, and JSON-LD string.

### Support

- `ContactMessage`: name, email, phone, subject, message, read, timestamps, soft-delete fields.
- `Ticket`: subject, userName, userEmail, userPhone, status string, hiddenFromUser, timestamps.
- `TicketMessage`: ticketId, message, senderType string, senderName, createdAt.

### Security/operations

- `AdminUser`: username, passwordHash, createdAt.
- `SecurityLog`: event, ip, username, details, path, createdAt.
- `LoginAttempt`: ip, username, success, createdAt.
- `BackupLog`: type, status, size, records, tables JSON string, checksum, notes, createdBy, completedAt, createdAt.
- `MediaItem`: filename, originalName, url, mimeType, size, dimensions, metadata, folder, tags JSON string, category, uploadedBy, soft-delete fields, timestamps.

## Verified relationship

```text
Ticket 1 ─────── * TicketMessage
                     │
                     └── TicketMessage.ticketId → Ticket.id
                         onDelete: Cascade
```

No other explicit Prisma relations were found in `prisma/schema.prisma`.

## Important indexes

Unique indexes are present for:

- `News.slug`
- `Page.slug`
- `SiteSetting.key`
- `AdminUser.username`
- `SeoSetting.pagePath`

No explicit indexes were found for common ticket filters such as `userEmail`, `status`, `TicketMessage.ticketId`, media folder/category, or soft-delete fields. Verify database indexes directly before performance changes.

## Migration files

- `prisma/migrations/20260723114400_init/migration.sql`
- `prisma/migrations/20260723163330_add_soft_delete/migration.sql`
- `prisma/migrations/20260723165216_add_backup_log/migration.sql`
- `prisma/migrations/20260723171551_add_media_library/migration.sql`
- `prisma/migrations/20260725022030_add_seo_settings/migration.sql`

Do not edit applied migrations. Add a new migration for schema changes.

# 9. API MAP

## Authentication APIs

| Endpoint | File | Methods | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `/api/auth` | `src/app/api/auth/route.ts` | POST | No | Login, set JWT cookie |
| `/api/auth/me` | `src/app/api/auth/me/route.ts` | GET | JWT | Current admin |
| `/api/auth/logout` | `src/app/api/auth/logout/route.ts` | POST | JWT/current session | Clear cookie |
| `/api/auth/change-password` | `src/app/api/auth/change-password/route.ts` | POST | JWT | Change password |
| `/api/auth/check-password` | `src/app/api/auth/check-password/route.ts` | POST | JWT/current password | Verify password |

## Content APIs

| Endpoint | File | Methods | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `/api/news` | `src/app/api/news/route.ts` | GET, POST | Public GET; admin POST | List/create news |
| `/api/news/[id]` | `src/app/api/news/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Read/update/delete news |
| `/api/gallery` | `src/app/api/gallery/route.ts` | GET, POST | Public GET; admin POST | List/create gallery |
| `/api/gallery/[id]` | `src/app/api/gallery/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Gallery record CRUD |
| `/api/teachers` | `src/app/api/teachers/route.ts` | GET, POST | Public GET; admin POST | Teacher CRUD |
| `/api/teachers/[id]` | `src/app/api/teachers/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Teacher record CRUD |
| `/api/courses` | `src/app/api/courses/route.ts` | GET, POST | Public GET; admin POST | Course CRUD |
| `/api/courses/[id]` | `src/app/api/courses/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Course record CRUD |
| `/api/events` | `src/app/api/events/route.ts` | GET, POST | Public GET; admin POST | Event CRUD |
| `/api/events/[id]` | `src/app/api/events/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Event record CRUD |
| `/api/student-works` | `src/app/api/student-works/route.ts` | GET, POST | Public GET; admin POST | Student work CRUD |
| `/api/student-works/[id]` | `src/app/api/student-works/[id]/route.ts` | GET, PUT, DELETE | Public GET; admin mutation | Student work CRUD |
| `/api/pages` | `src/app/api/pages/route.ts` | GET, POST | Intended admin; inspect per method | CMS pages |
| `/api/pages/[slug]` | `src/app/api/pages/[slug]/route.ts` | GET, PUT, DELETE | Intended admin; inspect per method | Page by slug |

## Profile/settings/SEO APIs

| Endpoint | File | Methods | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `/api/school` | `src/app/api/school/route.ts` | GET, PUT | GET public; PUT currently unauthenticated | School profile |
| `/api/principal` | `src/app/api/principal/route.ts` | GET, PUT | GET public; PUT currently unauthenticated | Principal profile |
| `/api/settings` | `src/app/api/settings/route.ts` | GET, PUT | GET public; PUT admin | Site settings |
| `/api/seo` | `src/app/api/seo/route.ts` | GET, POST | Inspect handlers | SEO settings |
| `/api/seo/[pagePath]` | `src/app/api/seo/[pagePath]/route.ts` | GET, DELETE | Inspect handlers | Page SEO CRUD |
| `/api/seo/validate` | `src/app/api/seo/validate/route.ts` | POST | Public/advisory | SEO validation |

## Media/import APIs

| Endpoint | File | Methods | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `/api/upload` | `src/app/api/upload/route.ts` | POST | Admin | Local image upload |
| `/api/upload/telegram` | `src/app/api/upload/telegram/route.ts` | POST | Admin | Telegram upload |
| `/api/media` | `src/app/api/media/route.ts` | GET, POST, PUT, DELETE | Admin | Media library |
| `/api/images` | `src/app/api/images/route.ts` | GET | Public; inspect trust boundary | Telegram image proxy |
| `/api/import/[model]` | `src/app/api/import/[model]/route.ts` | POST | Admin | XLSX import for teachers/courses/news |

## Ticket/contact APIs

| Endpoint | File | Methods | Auth | Purpose |
| --- | --- | --- | --- | --- |
| `/api/contact` | `src/app/api/contact/route.ts` | GET, POST, PUT, DELETE | GET admin; POST public; mutations admin | Contact messages |
| `/api/contact/message` | `src/app/api/contact/message/route.ts` | POST | Public | Alternate contact submission |
| `/api/tickets` | `src/app/api/tickets/route.ts` | GET, POST | Public/email-based | Ticket list/create |
| `/api/tickets/[id]` | `src/app/api/tickets/[id]/route.ts` | GET, PATCH | Public/email-based | Ticket detail/hide |
| `/api/tickets/[id]/messages` | `src/app/api/tickets/[id]/messages/route.ts` | POST | Public/email-based; sender type client-controlled | Ticket messages |
| `/api/admin/tickets/**` | `src/app/api/admin/tickets/**` | Various | Admin | Ticket administration |

## Admin APIs

- `/api/admin/backup`
- `/api/admin/recycle-bin`
- `/api/admin/search`
- `/api/admin/security-logs`
- `/api/admin/login-attempts`

All files are under `src/app/api/admin/`. Most require `requireAdmin()`, but future edits must verify each handler.

# 10. AUTHENTICATION & AUTHORIZATION

## Login

1. `POST /api/auth` receives username/password.
2. `loginAdmin()` finds `AdminUser` by username.
3. bcrypt compares the password.
4. JWT is signed with `userId` and `username`.
5. Token is placed in `admin_token` cookie.
6. Cookie is HTTP-only, SameSite strict, eight-hour max age, secure in production.

## Logout

`POST /api/auth/logout` clears the cookie. The JWT is not server-side revoked; a copied token may remain valid until expiry.

## Middleware

`src/middleware.ts`:

- rate limits `/api/auth` with an in-memory map;
- performs a presence-only cookie check for certain admin API prefixes;
- sets admin-specific headers;
- does not cryptographically verify JWTs in middleware.

## API protection

Most privileged handlers call:

```ts
await requireAdmin();
```

`requireAdmin()` reads `admin_token`, verifies it, and throws `Unauthorized` if invalid.

## Roles and permissions

No role or permission model exists in `prisma/schema.prisma`. All admin users are effectively superusers. MFA, account disabled state, token version, and fine-grained permissions are **Not verified/not present in schema**.

## Verified authorization issues

- `PUT /api/school` is unauthenticated.
- `PUT /api/principal` is unauthenticated.
- Ticket ownership is based on optional caller-supplied email.
- Public ticket messages accept caller-supplied `senderType`; forged admin messages are possible.
- Middleware admin path is not an authentication boundary.
- `ADMIN_SECRET_PATH` is configuration/obfuscation, not proof of authorization.

# 11. STATE MANAGEMENT

## Global state

No Redux, Zustand, Jotai, React Query, SWR, or shared context store was found.

## Local state

Most state is local `useState` in page/component scope:

- forms
- filters
- selected IDs
- modal state
- loading/error
- upload queue
- dashboard data
- ticket list/detail
- media metadata

## Server state

Server data is read directly in Server Components or fetched from client components with `fetch`.

## Caching

`src/lib/settings-cache.ts` maintains a module-level settings cache with a 60-second TTL. It has no explicit mutation invalidation.

## Stateful high-impact components

- `src/app/hadi-panel-x7k9/media/page.tsx`: very large state machine for media, uploads, filters, selection, edit, delete, restore, and bulk actions.
- `src/app/(public)/contact/page.tsx`: form, ticket list, detail, reply, hidden state, localStorage.
- `src/app/hadi-panel-x7k9/setup/page.tsx`: setup wizard state.
- `src/app/hadi-panel-x7k9/seo/page.tsx`: multiple SEO forms, validation, save state.
- `src/app/hadi-panel-x7k9/backup/page.tsx`: backup/restore/dialog state.
- `src/app/hadi-panel-x7k9/tickets/page.tsx`: admin ticket list/detail/message state.

# 12. FORMS & VALIDATION

## Form libraries

No React Hook Form, Formik, or other form library was found. Forms use native HTML controls with React state.

## Validation libraries

No Zod, Yup, Joi, or equivalent centralized schema library was found.

## Custom validation

`src/lib/validation.ts` provides:

- `sanitizeString`
- `sanitizeHtml`
- `validateEmail`
- `validateRequired`
- `validateLength`
- `validateNumeric`
- `validateInput`

## Client validation

Commonly uses:

- native `required`
- `type="email"`
- `type="tel"`
- basic `onChange` state updates

## Server validation

Contact and import have custom validation. Many CRUD APIs destructure request body and pass values to Prisma with limited runtime checks.

## Important form files

- `src/app/(public)/contact/page.tsx`
- `src/app/hadi-panel-x7k9/news/page.tsx`
- `src/app/hadi-panel-x7k9/gallery/page.tsx`
- `src/app/hadi-panel-x7k9/teachers/page.tsx`
- `src/app/hadi-panel-x7k9/courses/page.tsx`
- `src/app/hadi-panel-x7k9/events/page.tsx`
- `src/app/hadi-panel-x7k9/student-works/page.tsx`
- `src/app/hadi-panel-x7k9/settings/page.tsx`
- `src/app/hadi-panel-x7k9/school/page.tsx`
- `src/app/hadi-panel-x7k9/principal/page.tsx`
- `src/app/hadi-panel-x7k9/seo/page.tsx`
- `src/app/hadi-panel-x7k9/password/page.tsx`

# 13. FILES & IMAGES

## Upload mechanism

`src/app/api/upload/route.ts` accepts multipart form data, validates admin auth, MIME, extension, size, and magic bytes, then writes to `public/uploads` with a generated filename.

`src/app/api/upload/telegram/route.ts` provides an alternate Telegram upload flow.

## Storage

- Local public files: `public/uploads/`
- Database metadata: `MediaItem`
- Actual production storage durability: **Not verified** and likely problematic for Vercel serverless filesystem.

## Image optimization

`next.config.ts` configures AVIF/WebP and responsive sizes, but most components use native `<img>`. Verify whether `next/image` is actually used before claiming optimization.

## Image providers/remote patterns

Configured remote patterns include Cloudinary and Unsplash. Actual use in production content: **Not verified**.

## Public assets

- `public/icon.svg`
- `public/templates/*.xlsx`
- `public/uploads/*`
- default SVG assets such as `next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`

## Critical image files

- `src/components/ui/ImageLightbox.tsx`
- `src/components/ui/GalleryItem.tsx`
- `src/components/ui/NewsCard.tsx`
- `src/lib/image-compress.ts`
- `src/app/hadi-panel-x7k9/media/page.tsx`
- `next.config.ts`

# 14. RESPONSIVE / MOBILE ARCHITECTURE

## CSS/framework

- Tailwind CSS 4
- global CSS in `src/app/globals.css`
- RTL root in `src/app/layout.tsx`
- global `overflow-x: hidden` and `max-width: 100vw`

## Breakpoints

Tailwind-style responsive prefixes are used, especially:

- `sm`
- `md`
- `lg`

## Mobile-specific components

- Header mobile menu in `src/components/layout/Header.tsx`
- Admin drawer in `src/components/admin/AdminSidebar.tsx`
- Mobile/admin headers in `src/app/hadi-panel-x7k9/layout.tsx`

## Known mobile-sensitive areas

- Header fixed `w-72` menu.
- Admin fixed `w-60` sidebar/drawer.
- Admin CRUD rows with multiple actions and long Persian titles.
- `src/app/hadi-panel-x7k9/media/page.tsx` dense filters/actions and sticky detail.
- Backup tables and restore dialogs.
- Gallery and student-work category chips.
- Contact ticket detail/message areas.
- Long email/URLs without consistent `break-words`.
- Multiple fixed/sticky surfaces and z-index layers.

## Blank/clipping/overflow risks

- Global overflow hiding can conceal horizontally overflowing content.
- Fixed drawers may occupy most of narrow viewports.
- Lightbox/modal and mobile menu lack complete focus management.
- Native images without intrinsic width/height may cause layout shift.
- Home gallery uses two columns even at the smallest layout, which may be tight on narrow screens.

# 15. PERFORMANCE MAP

## Known implementation facts

- Most public pages use `force-dynamic`.
- Home performs multiple independent Prisma queries and uses Suspense streaming.
- Public collection pages generally query all records without pagination.
- Native `<img>` is common; ESLint disables `no-img-element`.
- Settings use a 60-second in-memory cache.
- Media search is debounced; some admin searches are not.
- Image compression is performed in the browser.
- Dashboard fetches multiple endpoints and calculates some counts in the browser.
- `xlsx` is a large server-side import dependency.
- No dynamic imports were verified.
- `next.config.ts` configures image formats and cache headers.
- Font is loaded through `next/font/google` with Vazirmatn.

## Potential risks

- Full collection payloads and database scans as data grows.
- Native images bypass Next image transformation.
- Client-heavy admin pages increase JavaScript and hydration cost.
- Client-side compression can consume mobile CPU/memory.
- Dashboard over-fetching and sequential N+1-like import work.
- No shared request cache/deduplication layer.
- In-memory settings cache and rate limiters do not coordinate across instances.
- Large `media/page.tsx` and `setup/page.tsx` files are maintenance/bundle risks.
- Missing pagination on public listings.
- No test/performance regression infrastructure detected.

# 16. CONFIGURATION MAP

| File | Purpose | Important settings | Risk if modified |
| --- | --- | --- | --- |
| `package.json` | scripts/dependencies | `dev`, `build`, `start`, `lint`, `db:seed`; build runs Prisma generate/migrate | Can alter runtime, DB migration behavior, dependency graph |
| `package-lock.json` | npm lockfile | exact dependency graph | Never hand-edit; regenerate only deliberately |
| `next.config.ts` | Next.js, images, security headers, redirects/cache | security headers, image formats, admin noindex, API cache | Global request/header/image behavior |
| `tsconfig.json` | TypeScript compiler | strict, bundler resolution, alias | Can break imports/build |
| `eslint.config.mjs` | linting | Next rules; disables img and set-state-in-effect | Can change validation coverage |
| `postcss.config.mjs` | PostCSS/Tailwind | Tailwind PostCSS plugin | Can break styles |
| `prisma.config.ts` | Prisma CLI | schema path, migrations, datasource URL env | Can affect migration/seed behavior |
| `prisma/schema.prisma` | database schema | datasource and models | Requires migration; high impact |
| `src/middleware.ts` | edge/request middleware | admin path, rate limit, headers | Global request behavior/security |
| `src/app/globals.css` | global CSS/RTL | overflow, fonts, admin classes | Visual and layout impact |
| `.env.example` | environment template | documented variables only | Do not add real values |
| `.gitignore` | source/archive rules | currently does not ignore `.env` in inspected version | Secret-management risk |
| `scripts/backup.sh` | shell backup | assumes local SQLite and copies `.env` | Data/secret exposure and incompatible DB backup |
| `scripts/restore.sh` | shell restore | assumes local SQLite | Incompatible with current PostgreSQL setup |

# 17. ENVIRONMENT VARIABLES

| Variable | Used By | Purpose | Required |
| --- | --- | --- | --- |
| `DATABASE_URL` | `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts` | PostgreSQL connection | Required for DB functionality |
| `JWT_SECRET` | `src/lib/auth.ts` | JWT signing/verification | Required for secure auth; current code warns but continues if absent |
| `ADMIN_SECRET_PATH` | `src/middleware.ts`, `next.config.ts`, `src/lib/admin-config.ts` | Generated admin links/headers/path rules | Has a hard-coded fallback; production configuration is recommended |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/seo.ts` | SEO/site URL base | Has a hard-coded fallback; production value is recommended |
| `TELEGRAM_BOT_TOKEN` | `src/lib/telegram.ts` | Telegram API authentication | Optional; Telegram feature disabled without it |
| `TELEGRAM_CHAT_ID` | `src/lib/telegram.ts` | Telegram destination | Optional; Telegram feature disabled without it |
| `NODE_ENV` | `src/lib/prisma.ts`, auth cookie routes | runtime mode/cookie security | Runtime-provided; production must be `production` for secure cookies |

No actual values are included in this document.

# 18. EXTERNAL SERVICES

## PostgreSQL/Neon-compatible database

- Purpose: Persistent application data.
- Files: `prisma/schema.prisma`, `src/lib/prisma.ts`, `prisma.config.ts`, `prisma/seed.ts`.
- Authentication: `DATABASE_URL`; credentials are not documented here.
- Failure impact: Public pages, admin CMS, auth, tickets, and APIs fail.
- Actual provider/region/SSL state: **Not verified**.

## Telegram API

- Purpose: Optional image upload/proxy integration.
- Files: `src/lib/telegram.ts`, `src/app/api/upload/telegram/route.ts`, `src/app/api/images/route.ts`.
- Authentication: Environment variables, not documented with values.
- Failure impact: Telegram upload/delivery feature fails; local upload may remain usable.
- Whether production uses Telegram: **Not verified**.

## Vercel

- Purpose: Intended hosting/build platform.
- Files: no `vercel.json` found; `package.json`, `next.config.ts`, `PROJECT-DOCS.md`.
- Authentication/deployment credentials: Not applicable/not verified.
- Failure impact: deployment/build/runtime hosting changes.
- Actual production deployment: **Not verified**.

## Google Fonts / Next font

- Purpose: Vazirmatn font loading through `next/font/google`.
- File: `src/app/layout.tsx`.
- Authentication: None.
- Failure impact: build/network/font loading may be affected depending on Next build/runtime behavior; exact production behavior is **Not verified**.

# 19. DEPENDENCY MAP

## Core

- `next`: framework, routing, rendering, build.
- `react`, `react-dom`: UI runtime.
- `typescript`: type system.

## UI

- `tailwindcss`
- `@tailwindcss/postcss`
- custom SVG icons in `src/components/icons/index.tsx`
- no external component library detected

## Database

- `@prisma/client`
- `prisma`
- `@prisma/adapter-pg`
- `pg`

## Authentication

- `jsonwebtoken`
- `bcryptjs`
- `cookie`

## Forms

- No form library detected; native React controlled forms are used.

## Validation

- Custom utilities in `src/lib/validation.ts`
- no Zod/Yup/Joi detected

## State

- React hooks only; no external state library detected.

## Images

- Native browser images and custom image compression/proxy code.
- no dedicated image component library detected.

## Utilities

- `dotenv`
- project utilities in `src/lib/utils.ts`
- slug/date/format helpers in `src/lib/utils.ts`

## Development

- `eslint`, `eslint-config-next`
- `tsx`
- `@types/node`, `@types/react`, `@types/react-dom`
- `@types/pg`, `@types/jsonwebtoken`, `@types/cookie`, `@types/bcryptjs`

## Testing

- No testing framework dependency detected.
- No test files or test script detected.

## Deployment

- Vercel is documented/intended; no explicit Vercel manifest found.
- `pg`/Prisma adapter support serverless PostgreSQL.

# 20. IMPORTANT PROJECT CONVENTIONS

- App Router directory-based routing is authoritative.
- `(public)` is a route group and never appears in URLs.
- Route Handlers use `export async function GET/POST/PUT/PATCH/DELETE`.
- API responses are generally `NextResponse.json(...)`.
- Prisma access is commonly direct via `prisma` from `@/lib/prisma`.
- Public pages use async Server Components unless interactivity is required.
- Interactive UI uses `"use client"` at the top of the file.
- Shared imports use the `@/*` alias.
- Tailwind utility classes are the default styling approach; custom global classes exist in `globals.css`.
- Icons are local inline SVG components, not an external icon package.
- Forms are controlled React forms unless a future change introduces a form library.
- Custom validation belongs in `src/lib/validation.ts`; current code does not consistently use it.
- API admin handlers generally begin with `await requireAdmin()`.
- Database changes require a new Prisma migration; do not edit old migrations.
- Content has mixed soft-delete and hard-delete behavior; check each model's delete route.
- Public pages often use `dynamic = "force-dynamic"` for database freshness.
- Error handling often uses `try/catch` with generic user-facing messages, but many catches are silent.
- Do not assume docs are current: `PROJECT-OVERVIEW.md` contains obsolete SQLite and old route information.

# 21. CHANGE IMPACT MAP

## Home page

Primary:

- `src/app/(public)/page.tsx`
- `src/components/ui/Hero.tsx`
- `src/components/ui/NewsCard.tsx`
- `src/components/ui/ImageLightbox.tsx`
- `src/app/(public)/layout.tsx`

API: none required for initial server data; SEO helpers may query settings/SEO.

Database: `SchoolProfile`, `PrincipalProfile`, `Teacher`, `StudentWork`, `News`, `Gallery`, `SiteSetting`, `SeoSetting`.

Potential impact: public home, all content visibility, SEO, image loading, performance.

## School/principal profile

Primary:

- `src/app/api/school/route.ts`
- `src/app/api/principal/route.ts`
- `src/app/(public)/about/page.tsx`
- `src/app/(public)/page.tsx`
- admin profile pages

Database: `SchoolProfile`, `PrincipalProfile`.

Potential impact: public HTML, stored HTML/XSS surface, admin editors, home/about layout.

## News

Primary:

- `src/app/(public)/news/page.tsx`
- `src/app/(public)/news/[id]/page.tsx`
- `src/app/hadi-panel-x7k9/news/page.tsx`
- `src/app/api/news/route.ts`
- `src/app/api/news/[id]/route.ts`

Shared: `NewsCard`, SEO, sitemap, import.

Potential impact: news visibility, unpublished reads, slug/id route assumptions, home.

## Gallery/media

Primary:

- `src/app/(public)/gallery/page.tsx`
- `src/app/hadi-panel-x7k9/gallery/page.tsx`
- `src/app/hadi-panel-x7k9/media/page.tsx`
- `src/app/api/gallery/**`
- `src/app/api/media/route.ts`
- `src/app/api/upload/route.ts`

Shared: `GalleryItem`, `ImageLightbox`, `ImageUpload`, image compression.

Potential impact: image URLs, lightbox, public storage, mobile modal, admin media lifecycle.

## Tickets

Primary:

- `src/app/(public)/contact/page.tsx`
- `src/app/api/tickets/**`
- `src/app/api/admin/tickets/**`
- `src/app/hadi-panel-x7k9/tickets/page.tsx`

Database: `Ticket`, `TicketMessage`.

Potential impact: privacy, impersonation, status transitions, public contact UX, admin responses.

## Authentication

Primary:

- `src/lib/auth.ts`
- `src/app/api/auth/**`
- `src/middleware.ts`
- `src/app/hadi-panel-x7k9/layout.tsx`
- `src/app/hadi-panel-x7k9/login/page.tsx`

Database: `AdminUser`, `LoginAttempt`, `SecurityLog`.

Potential impact: every privileged API, admin layout, upload, import, backup.

## Settings

Primary:

- `src/app/api/settings/route.ts`
- `src/lib/settings-cache.ts`
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/app/(public)/contact/page.tsx`

Potential impact: all pages using settings, cache consistency, public data exposure.

## SEO

Primary:

- `src/lib/seo.ts`
- `src/app/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/api/seo/**`
- `src/app/hadi-panel-x7k9/seo/page.tsx`

Potential impact: metadata, structured data, indexing, social previews, all public pages.

## Database schema

Primary:

- `prisma/schema.prisma`
- `prisma/migrations/**`
- `prisma/seed.ts`
- `src/lib/prisma.ts`

Potential impact: every Prisma query, migration, public page, API, and admin page. Add migrations; do not rewrite old ones.

## Uploads/deployment

Primary:

- `src/app/api/upload/route.ts`
- `src/app/api/media/route.ts`
- `src/app/api/images/route.ts`
- `src/lib/telegram.ts`
- `next.config.ts`
- `scripts/backup.sh`
- `scripts/restore.sh`

Potential impact: filesystem, Vercel persistence, media URLs, backup/recovery.

# 22. SAFE EDITING GUIDE

## If asked to change the dashboard UI

First inspect:

- `src/app/hadi-panel-x7k9/page.tsx`
- `src/app/hadi-panel-x7k9/layout.tsx`
- `src/components/admin/AdminSidebar.tsx`
- dashboard API handlers under `src/app/api/`

Likely edit:

- dashboard page and its direct components.

Also check:

- `/api/admin/*` response shapes
- loading/error behavior
- mobile layout
- shared admin styles

Avoid changing:

- `AdminSidebar` unless navigation itself must change
- auth behavior without an explicit security task

## If asked to change student works

First inspect:

- `src/app/(public)/student-works/page.tsx`
- `src/app/hadi-panel-x7k9/student-works/page.tsx`
- `src/app/api/student-works/route.ts`
- `src/app/api/student-works/[id]/route.ts`
- `src/components/ui/ImageLightbox.tsx`
- `prisma/schema.prisma`

Likely edit:

- public/admin page and CRUD API only.

Also check:

- Home featured student works query
- category behavior
- soft-delete/published filtering
- image URL/mobile rendering

## If asked to change authentication

First inspect:

- `src/lib/auth.ts`
- `src/app/api/auth/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/change-password/route.ts`
- `src/middleware.ts`
- `src/app/hadi-panel-x7k9/layout.tsx`

Likely edit:

- auth library, auth route(s), and middleware as a coordinated change.

Potential impact:

- every admin API
- upload/import/backup
- admin layout redirect
- cookies and rate limiting

## If asked to change navigation

First inspect:

- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/admin/AdminSidebar.tsx`
- `src/lib/admin-config.ts`
- `src/app/robots.ts`

Also check:

- actual physical route directories
- public route links
- admin path configuration
- mobile drawer behavior

## If asked to change a CRUD API

First inspect:

- both list and `[id]` route files
- corresponding admin page
- public callers
- schema model
- soft-delete fields
- validation and auth pattern

Likely edit:

- route handler plus its direct page/form.

Potential impact:

- public list/detail
- admin lists
- dashboard counts
- import
- SEO/sitemap

## If asked to change database

First inspect:

- `prisma/schema.prisma`
- all migrations
- `src/lib/prisma.ts`
- all references to affected model names

Add a new migration. Check:

- unique fields
- soft-delete semantics
- public `published` filters
- existing `findFirst()`/singleton assumptions
- foreign keys

## If asked to change images/uploads

First inspect:

- `src/app/api/upload/route.ts`
- `src/app/api/media/route.ts`
- `src/app/api/images/route.ts`
- `src/lib/image-compress.ts`
- `src/app/hadi-panel-x7k9/media/page.tsx`
- `next.config.ts`

Also check:

- all raw `<img>` consumers
- public storage persistence
- deletion lifecycle
- external URL allowlists

## If asked to change mobile layout

First inspect:

- `src/app/globals.css`
- root layout
- public layout
- relevant page/component
- `Header.tsx`, `AdminSidebar.tsx`, lightbox, and dialogs

Test at narrow widths, long Persian strings, large font, and with both mobile drawer and modal states. Do not rely on global `overflow-x: hidden` as a fix.

## If asked to change performance configuration

First inspect:

- `next.config.ts`
- `src/lib/settings-cache.ts`
- public page `dynamic` exports
- image components
- API query patterns

Avoid changing `force-dynamic` globally without understanding CMS freshness requirements.

## If asked to change deployment

First inspect:

- `package.json`
- `next.config.ts`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `scripts/backup.sh`
- `scripts/restore.sh`
- environment references

Do not assume Vercel filesystem persistence or current database state. Deployment credentials and live configuration are **Not verified**.

# 23. CRITICAL FILES

| File | Why critical | Depends on it | Check before editing |
| --- | --- | --- | --- |
| `prisma/schema.prisma` | Database source of truth | Every Prisma query/API/page | migrations, unique fields, soft delete, public filters |
| `src/lib/prisma.ts` | Shared DB client | All server pages and APIs | DATABASE_URL, adapter, singleton behavior |
| `src/lib/auth.ts` | JWT/password/session boundary | All admin APIs/layout | cookie contract, secret handling, token verification |
| `src/middleware.ts` | Global request/security behavior | All routes | matcher, admin path, headers, rate limits |
| `src/app/hadi-panel-x7k9/layout.tsx` | Admin shell/auth client gate | Every admin page | API auth, mobile drawer, shared children |
| `src/components/admin/AdminSidebar.tsx` | Shared admin navigation | Every admin route | active links, admin path, logout |
| `src/components/layout/Header.tsx` | Public navigation/settings | Every public page | mobile menu, settings fetch, active state |
| `src/components/ui/ImageLightbox.tsx` | Shared image modal | Home/gallery/student works | focus, Escape, mobile viewport |
| `src/lib/seo.ts` | Metadata/JSON-LD | Every public page | site URL, escaping, schema output |
| `src/app/api/school/route.ts` | Public profile mutation | About/Home/admin school | auth, HTML rendering, singleton behavior |
| `src/app/api/principal/route.ts` | Public profile mutation | About/Home/admin principal | auth, HTML rendering, singleton behavior |
| `src/app/api/import/[model]/route.ts` | Bulk DB writes | Admin import/templates | auth, limits, transaction, duplicate handling |
| `src/app/api/admin/backup/route.ts` | Bulk export/restore | Backup admin page | auth, PII, validation, transaction |
| `src/app/api/upload/route.ts` | File writes | Media/content forms | auth, MIME, storage lifecycle |
| `next.config.ts` | Headers/cache/images | Entire app | security headers, cache conflicts, image behavior |
| `package.json` | Scripts/dependencies | build/dev/runtime | migration-in-build, dependency compatibility |
| `src/lib/validation.ts` | Sanitization/validation | Contact/import/HTML flows | sanitizer safety and caller assumptions |

# 24. KNOWN ISSUES

## Verified issues

### Unauthenticated profile mutation

- **Location:** `src/app/api/school/route.ts`, `src/app/api/principal/route.ts`
- **Impact:** Anonymous content tampering; possible stored HTML/XSS path when rendered publicly.
- **Status:** Open.
- **Evidence:** `PUT` handlers do not call `requireAdmin()`.
- **Investigation:** Auth, input validation, safe rendering, singleton semantics.

### Ticket ownership bypass

- **Location:** `src/app/api/tickets/[id]/route.ts`
- **Impact:** Ticket ID alone may disclose ticket/messages; email is optional and caller-controlled.
- **Status:** Open.
- **Evidence:** Ownership check only executes when email is supplied.
- **Investigation:** Session or signed ticket-access design.

### Forged admin ticket messages

- **Location:** `src/app/api/tickets/[id]/messages/route.ts`
- **Impact:** Public caller can supply `senderType: "admin"` and change ticket state.
- **Status:** Open.
- **Evidence:** sender identity/type comes from request body.
- **Investigation:** Separate authenticated admin and public user routes.

### Alternate contact ingestion route

- **Location:** `src/app/api/contact/message/route.ts`
- **Impact:** Bypasses protections present on `/api/contact`.
- **Status:** Open.
- **Evidence:** No equivalent rate limit/validation/sanitization/logging verified.
- **Investigation:** Whether route is still used; remove or protect only after reference verification.

### Secret-containing `.env`

- **Location:** `.env`, `.gitignore`, `scripts/backup.sh`
- **Impact:** Credential exposure if source/backups are shared.
- **Status:** Open; do not print values.
- **Evidence:** `.env` exists; ignore rules intentionally do not ignore it; backup copies it.
- **Investigation:** Rotate credentials and remove from source/backup distribution.

### Plaintext password synchronization into source/docs

- **Location:** `src/lib/sync-password.ts`, called by `src/app/api/auth/change-password/route.ts`
- **Impact:** Password disclosure and filesystem-dependent auth behavior.
- **Status:** Open.
- **Evidence:** Runtime code reads/writes project files.
- **Investigation:** Remove secret propagation as a security change.

### Non-transactional restore

- **Location:** `src/app/api/admin/backup/route.ts`
- **Impact:** Partial database state after failure; mass assignment/incomplete restore.
- **Status:** Open.
- **Evidence:** Record-level operations without transaction/schema validation.
- **Investigation:** Backup format, allowlists, transaction and conflict policy.

### In-memory rate limiting

- **Location:** `src/middleware.ts`, `src/app/api/auth/route.ts`, `src/app/api/contact/route.ts`
- **Impact:** Ineffective across Vercel instances and resets on restart.
- **Status:** Open.
- **Evidence:** Module-level `Map` state.
- **Investigation:** Shared rate-limit store or platform-level control.

### Local upload storage

- **Location:** `src/app/api/upload/route.ts`
- **Impact:** Files may not persist or may be inconsistent on Vercel.
- **Status:** Open architecture/deployment concern; actual production behavior **Not verified**.
- **Evidence:** Writes to `process.cwd()/public/uploads`.
- **Investigation:** Object storage or durable volume.

### Admin/public API semantic coupling

- **Location:** public content APIs and admin pages
- **Impact:** Admin cannot reliably list unpublished/draft records if it consumes public-filtered APIs.
- **Status:** Potential/architectural issue; exact behavior across every page is **Not fully verified**.
- **Evidence:** Public list filters `published: true`; dashboard/admin use related APIs.
- **Investigation:** Separate admin read endpoints or explicit query modes.

### Gallery/student-work filters

- **Location:** `src/app/(public)/gallery/page.tsx`, `src/app/(public)/student-works/page.tsx`
- **Impact:** Visible category controls do not filter content.
- **Status:** Verified frontend defect.
- **Evidence:** Category elements have no handlers; full arrays are rendered.
- **Investigation:** State/URL query design and server/client boundary.

### Native images instead of Next Image

- **Location:** many public/admin components
- **Impact:** Potentially larger mobile payloads, no automatic responsive optimization, possible layout shift.
- **Status:** Verified implementation pattern; performance impact depends on actual assets/traffic.
- **Evidence:** Numerous `<img>` usages and ESLint rule disabled.
- **Investigation:** Asset sizes, remote image behavior, `next/image` compatibility.

### Missing pagination on public collections

- **Location:** public teachers/gallery/news/events/student-works pages
- **Impact:** Growing payload/query time.
- **Status:** Verified implementation pattern; actual production impact **Not verified**.
- **Evidence:** Full `findMany` calls without pagination.
- **Investigation:** Data volume and acceptable UX.

## Suspected risks requiring verification

- `SITE_URL` import/export mismatch may cause TypeScript/build failure; verify with typecheck/build.
- Public collection APIs may expose unpublished records on direct ID reads; verify each GET handler.
- Prisma version skew between CLI/client/adapter may cause compatibility issues; verify installed lockfile and runtime.
- Footer admin URL can become invalid if `ADMIN_SECRET_PATH` is changed; verify deployment path behavior.
- `ADMIN_SECRET_PATH` may be changed without relocating physical route; verify actual deployment routing before editing.
- `next.config.ts` image settings may not be effective because raw `<img>` is used; verify actual response image formats.
- Database indexes for ticket/media filters may be absent; inspect production query plans before optimizing.
- Physical upload persistence on Vercel is not verified; inspect deployment filesystem behavior.
- Global `overflow-x: hidden` may conceal layout overflow; reproduce at mobile widths.

# 25. TODO / FIXME MAP

No substantial explicit TODO/FIXME/HACK inventory was found. Important unfinished/unsafe work is represented by comments and code behavior:

| File/area | Description | Importance |
| --- | --- | --- |
| `src/lib/auth.ts` | Warns if JWT secret is absent but continues | High security |
| `src/app/api/import/[model]/route.ts` | Silently skips individual row failures | High data integrity |
| `src/lib/sync-password.ts` | Silently ignores source-file synchronization failures | High security/operations |
| `src/lib/settings-cache.ts` | Silent fetch failure fallback | Medium reliability |
| `src/app/(public)/gallery/page.tsx` | Category UI has no functional filter | Medium frontend |
| `src/app/(public)/student-works/page.tsx` | Category UI has no functional filter | Medium frontend |
| `.gitignore` | `.env` intentionally not ignored | Critical security |
| `scripts/backup.sh` | Assumes SQLite and copies `.env` | Critical operations/security |
| `PROJECT-OVERVIEW.md` | Contains obsolete architecture details | Documentation risk |

# 26. TESTING

## Testing framework

No test framework dependency was detected. No `test`, `typecheck`, or `security-audit` script exists in `package.json`.

## Existing tests

No `*.test.*` or `*.spec.*` files were found in the inspected project.

## Covered

No automated test coverage was identified. Manual/audit inspection covered static code only.

## Not covered or not verified

- auth/login/logout/password flows
- API authorization
- ticket ownership/impersonation
- profile mutation authorization
- HTML/XSS rendering
- backup/restore integrity
- Excel import behavior
- upload validation and storage lifecycle
- database migrations
- public unpublished-data access
- mobile layouts
- accessibility behavior
- SEO metadata generation
- rate limiting across instances

# 27. DEPLOYMENT MAP

```text
Development
  ↓
npm run dev
  ↓
Next dev server
  ↓
npm run build
  ├─ prisma generate
  ├─ prisma migrate deploy
  └─ next build
  ↓
npm run start
  ↓
Next production server / intended Vercel deployment
  ↓
PostgreSQL via DATABASE_URL
Optional Telegram via TELEGRAM_* variables
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:seed
```

## Build caveat

`npm run build` runs `prisma migrate deploy`, so builds require database connectivity and migration privileges. This behavior is verified from `package.json`; production deployment policy is not verified.

## Deployment files

No `vercel.json`, Dockerfile, Docker Compose, or equivalent project-level deployment manifest was found.

## Storage/deployment caveat

Local `public/uploads` is not assumed to be durable on serverless infrastructure. Actual Vercel filesystem behavior and live upload persistence: **Not verified**.

# 28. AI AGENT SAFETY RULES

1. Read `PROJECT-REFERENCE.md` first, then inspect the exact related source files.
2. Treat current source/schema as authoritative when documentation conflicts.
3. Do not modify files unless the user explicitly requests a change.
4. Prefer minimal, targeted changes; do not rewrite working architecture without a stated need.
5. Inspect all callers and related pages before changing a shared component.
6. Check API authentication and database authorization before changing a route.
7. Check schema and migrations before changing model fields.
8. Add a new Prisma migration; never edit applied migrations blindly.
9. Do not expose secrets, environment values, credentials, tokens, or private data in code, docs, logs, or responses.
10. Do not modify `.env` or deployment configuration unless explicitly requested.
11. Do not install/update dependencies unless explicitly requested.
12. Do not remove code or components as “unused” without searching references and verifying route/build behavior.
13. Preserve public/admin authorization boundaries and avoid duplicating functionality.
14. Check `force-dynamic`, fetch caching, and API response shapes before changing rendering/data flow.
15. Check RTL behavior, narrow widths, long Persian strings, fixed drawers, modals, and overflow before changing CSS/layout.
16. Check image URLs, storage persistence, and physical-file deletion before changing media behavior.
17. Check `NEXT_PUBLIC_SITE_URL`/SEO output when changing metadata or domain behavior.
18. Check public vs admin API filters when changing `published`/soft-delete semantics.
19. Treat ticket ownership, profile mutation, backup/restore, import, and upload as security-sensitive.
20. Avoid silent catch blocks; improve error visibility only as part of an explicitly requested change.
21. Verify response status before assuming a client mutation succeeded.
22. For database changes, validate migration compatibility and existing production data assumptions.
23. After significant changes, inspect affected API callers, public pages, admin pages, and shared components.
24. Do not claim runtime/deployment verification unless it was actually executed; use **Not verified** when appropriate.

# 29. QUICK REFERENCE

| Task | Start Here | Also Check |
| --- | --- | --- |
| Change dashboard UI | `src/app/hadi-panel-x7k9/page.tsx` | `layout.tsx`, admin APIs, sidebar |
| Change public home | `src/app/(public)/page.tsx` | `Hero`, `NewsCard`, `ImageLightbox`, SEO |
| Change news | public/admin news pages | news APIs, `NewsCard`, sitemap, schema |
| Change gallery | `src/app/(public)/gallery/page.tsx` | `GalleryItem`, `ImageLightbox`, gallery/media APIs |
| Change student works | public/admin student-work pages | student-work APIs, schema, Home |
| Change teachers | public/admin teacher pages | teacher API, About, import |
| Change courses | admin course page | course API, import, SEO; verify public route absence |
| Change events | public/admin event pages | event API, schema, SEO |
| Change contact/tickets | contact page and ticket APIs | admin tickets, schema, validation |
| Change authentication | `src/lib/auth.ts` | auth routes, middleware, admin layout, cookies |
| Change navigation | Header/Footer/AdminSidebar | `admin-config`, robots, actual route folders |
| Change settings | settings API/cache | Header, Footer, contact, public consumers |
| Change SEO | `src/lib/seo.ts` | layout, robots, sitemap, JSON-LD, SEO page |
| Change uploads | upload/media API | media page, image compressor, storage, `next.config` |
| Change image rendering | `ImageLightbox`, `GalleryItem`, `NewsCard` | public pages, `next.config`, mobile layout |
| Change database | `prisma/schema.prisma` | migrations, Prisma client, all model references |
| Change backup/restore | admin backup API/page | shell scripts, schema, privacy, transactions |
| Change Excel import | import API | ExcelImport, templates, seed, dependency/security constraints |
| Change mobile layout | `globals.css`, layout, target component | Header/Sidebar/modal, long Persian strings, overflow |
| Change performance | `next.config.ts`, page `dynamic`, query code | image usage, cache, pagination, client boundaries |
| Change deployment | `package.json`, `next.config.ts`, Prisma config | env usage, uploads, migration strategy, backups |

# 30. ARCHITECTURE DIAGRAM

```text
                         ┌──────────────────────────┐
                         │        Browser            │
                         │  Public / Admin Client UI │
                         └─────────────┬────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
                 ▼                                           ▼
      Public Server Components                     Admin Client Components
      src/app/(public)/**                            src/app/hadi-panel-x7k9/**
                 │                                           │
                 │ direct Prisma                              │ fetch JSON
                 │                                           ▼
                 │                                  src/app/api/**/route.ts
                 │                                           │
                 │                                           │ requireAdmin()
                 │                                           │ public validation
                 └─────────────────────┬─────────────────────┘
                                       ▼
                              src/lib/prisma.ts
                                       │
                                       ▼
                                PostgreSQL
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
                 ▼                                           ▼
       Site/SEO/contact data                    Optional Telegram API
```

Additional flows:

```text
Admin upload → /api/upload → public/uploads → MediaItem metadata
Admin import → /api/import/[model] → xlsx parse → sequential Prisma writes
Public home → Prisma sections → Suspense streaming → HTML
Public contact → ticket APIs → Ticket/TicketMessage
```

# 31. AUDIT METADATA

- **Audit date:** 2026-09-23
- **Generated by:** OpenCode coding agent
- **Project version/commit:** `package.json` reports `0.1.0`; no Git repository or commit metadata was available in the inspected workspace. **Not verified** as a release version.
- **Working tree inspected:** Yes, read-only inspection of project files and directories.
- **Tests inspected:** Yes; no test files or test script were found.
- **Production configuration inspected:** Partially. Repository config and intended Vercel documentation were inspected; live Vercel settings and environment values were not available and are **Not verified**.
- **Database inspected:** Schema, migrations, seed, and Prisma access code were inspected. Live database contents, production indexes, and deployed schema state are **Not verified**.
- **Secrets:** No secret values are reproduced in this document.
- **Files modified by this audit:** Only this new `PROJECT-REFERENCE.md` document is intended to be created; no existing source/config/database files should be changed.
- **Areas not fully verifiable from repository:** live deployment, Vercel filesystem persistence, production database contents/indexes, live environment values, runtime build result, external Telegram usage, actual production traffic, and browser-level mobile/accessibility behavior.
