# هنرستان هادی — Project Overview

> Full-stack dynamic website for "هنرستان هادی" (Hadi Art School), an art school in Iran.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, Turbopack) | 16.2.10 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | v4 |
| ORM | Prisma | 7.8.0 |
| Database | SQLite (via better-sqlite3 adapter) | 12.11.1 |
| Auth | JWT (jsonwebtoken) + bcryptjs | 9.0.3 / 3.0.3 |
| Language | TypeScript | 5.x |
| Font | Vazirmatn (Google Fonts, Persian/Farsi) | — |
| Spreadsheet | xlsx (for Excel import/export) | 0.18.5 |

---

## What This Project Is

A bilingual (Persian/Farsi, RTL) content-managed website for an art school. It has:

1. **Public-facing website** — pages for the school's home, about, courses, teachers, gallery, news, student works, and contact form.
2. **Admin CMS** — a full admin panel at `/admin` where school staff can manage all content (news, gallery images, courses, teachers, student works, events, testimonials, pages, settings, messages).
3. **REST API** — Next.js API routes powering all CRUD operations.
4. **Excel Import/Export** — bulk data import via `.xlsx` templates for all major content types.
5. **File Upload** — image upload API saving to `public/uploads/`.

---

## Project Structure

```
honarestan-main (2)/
├── CLAUDE.md                    # AI assistant instructions
├── PROJECT-DOCS.md              # Project status & tech notes
├── PROJECT-OVERVIEW.md          # This file — full project understanding
├── README.md                    # Default Next.js readme
├── package.json                 # Dependencies & scripts
├── next.config.ts               # Next.js config (unoptimized images, remote patterns)
├── tsconfig.json                # TypeScript config (strict, bundler resolution)
├── postcss.config.mjs           # PostCSS with Tailwind
├── eslint.config.mjs            # ESLint (next/core-web-vitals + typescript)
├── prisma.config.ts             # Prisma config (schema, migrations, seed)
├── opencode.json                # OpenCode config
│
├── prisma/
│   ├── schema.prisma            # Database schema (14 models)
│   ├── seed.ts                  # Seed script (admin user, settings, sample data)
│   ├── seed.cjs                 # Compiled seed (CJS)
│   └── migrations/              # 3 migrations: init, showcase models, school/principal
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout (RTL, Persian, Vazirmatn font)
│   │   ├── globals.css          # Global styles (Tailwind, admin form styles, animations)
│   │   ├── favicon.ico
│   │   │
│   │   ├── (public)/            # Public pages route group
│   │   │   ├── layout.tsx       # Public layout (Header + Footer)
│   │   │   ├── page.tsx         # Home page
│   │   │   ├── about/page.tsx   # About page
│   │   │   ├── contact/page.tsx # Contact form
│   │   │   ├── courses/page.tsx # Courses listing
│   │   │   ├── gallery/page.tsx # Image gallery
│   │   │   ├── teachers/page.tsx# Teachers listing
│   │   │   ├── student-works/page.tsx # Student works
│   │   │   └── news/
│   │   │       ├── page.tsx     # News listing
│   │   │       └── [slug]/page.tsx # Individual news article
│   │   │
│   │   ├── admin/               # Admin panel (14 pages)
│   │   │   ├── layout.tsx       # Admin layout (sidebar + auth check)
│   │   │   ├── page.tsx         # Admin dashboard
│   │   │   ├── login/page.tsx   # Login page
│   │   │   ├── news/page.tsx    # News CRUD
│   │   │   ├── gallery/page.tsx # Gallery CRUD
│   │   │   ├── courses/page.tsx # Courses CRUD
│   │   │   ├── teachers/page.tsx# Teachers CRUD
│   │   │   ├── student-works/page.tsx # Student works CRUD
│   │   │   ├── events/page.tsx  # Events CRUD
│   │   │   ├── messages/page.tsx# Contact messages viewer
│   │   │   ├── pages/page.tsx   # CMS pages editor
│   │   │   ├── settings/page.tsx# Site settings
│   │   │   ├── school/page.tsx  # School profile editor
│   │   │   ├── principal/page.tsx # Principal profile editor
│   │   │   └── templates/page.tsx # Excel template management
│   │   │
│   │   └── api/                 # API routes (23 route files)
│   │       ├── auth/
│   │       │   ├── route.ts     # Login/logout
│   │       │   └── me/route.ts  # Current user info
│   │       ├── news/route.ts    # News list + create
│   │       ├── news/[id]/route.ts # News get/update/delete
│   │       ├── gallery/route.ts # Gallery list + create
│   │       ├── gallery/[id]/route.ts # Gallery get/update/delete
│   │       ├── courses/route.ts # Courses list + create
│   │       ├── courses/[id]/route.ts # Courses get/update/delete
│   │       ├── teachers/route.ts # Teachers list + create
│   │       ├── teachers/[id]/route.ts # Teachers get/update/delete
│   │       ├── student-works/route.ts # Student works list + create
│   │       ├── student-works/[id]/route.ts # Student works get/update/delete
│   │       ├── events/route.ts  # Events list + create
│   │       ├── events/[id]/route.ts # Events get/update/delete
│   │       ├── pages/route.ts   # Pages list + create
│   │       ├── pages/[slug]/route.ts # Pages get/update/delete by slug
│   │       ├── contact/route.ts # Contact form submission
│   │       ├── contact/message/route.ts # Contact messages
│   │       ├── settings/route.ts # Site settings CRUD
│   │       ├── school/route.ts  # School profile CRUD
│   │       ├── principal/route.ts # Principal profile CRUD
│   │       ├── upload/route.ts  # File upload
│   │       └── import/[model]/route.ts # Excel import
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Hero.tsx         # Hero banner component
│   │   │   ├── NewsCard.tsx     # News card component
│   │   │   └── GalleryItem.tsx  # Gallery item component
│   │   ├── layout/
│   │   │   ├── Header.tsx       # Site header/navigation
│   │   │   └── Footer.tsx       # Site footer
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx # Admin sidebar navigation
│   │   │   └── ExcelImport.tsx  # Excel import component
│   │   └── icons/
│   │       └── index.tsx        # 40+ custom SVG icons (no emojis)
│   │
│   └── lib/
│       ├── prisma.ts            # Prisma client singleton (with SQLite adapter)
│       ├── auth.ts              # Auth utilities (JWT, bcrypt, cookie-based)
│       └── utils.ts             # Helpers (slugify, formatDate, truncate)
│
├── public/
│   ├── uploads/                 # User-uploaded files (1 image currently)
│   ├── templates/               # Excel import templates (6 .xlsx files)
│   │   ├── courses-template.xlsx
│   │   ├── events-template.xlsx
│   │   ├── gallery-template.xlsx
│   │   ├── news-template.xlsx
│   │   ├── student-works-template.xlsx
│   │   └── teachers-template.xlsx
│   ├── file.svg, globe.svg, next.svg, vercel.svg, window.svg # Default Next.js assets
│
├── scripts/
│   └── generate-templates.ts    # Generates Excel templates for bulk import
│
├── docs/
│   ├── راهنمای-مدیریت.md       # Full admin guide (Persian)
│   ├── کارت-راهنمای-سریع.md    # Quick reference card (Persian)
│   └── compose/                 # Compose skill outputs (specs, plans)
│
└── .mimocode/                   # MiMoCode agent config
```

---

## Database Models (14 total)

### Core Content Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **News** | Blog/news posts | title, slug (unique), content, excerpt, image, published |
| **Gallery** | Image gallery | title, description, image, category (default: "general") |
| **Page** | CMS pages | slug (unique), title, content |
| **Course** | Training courses | title, description, image, duration, level (beginner/intermediate/advanced), sortOrder |
| **Teacher** | Faculty profiles | name, title, bio, image, specialty, sortOrder |
| **StudentWork** | Student artwork showcase | title, studentName, description, image, category, year, featured |
| **Event** | School events | title, description, image, date, location, published |
| **Testimonial** | Student/parent reviews | name, role, content, image, rating (1-5), sortOrder |

### System Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| **ContactMessage** | Contact form submissions | name, email, phone, subject, message, read |
| **SiteSetting** | Key-value config | key (unique), value |
| **AdminUser** | Admin authentication | username (unique), passwordHash |
| **SchoolProfile** | School info (singleton) | overview, history, vision, mission, educationalGoals, departments, facilities, statistics (JSON), galleryImages (JSON) |
| **PrincipalProfile** | Principal info (singleton) | name, photo, position, biography, welcomeMessage, resume, achievements (JSON), contactInfo |

### Database Migrations (3)

1. `20260710165754_init` — Initial schema (News, Gallery, Page, ContactMessage, SiteSetting, AdminUser)
2. `20260710175107_add_showcase_models` — Added Teacher, StudentWork, Event, Course, Testimonial
3. `20260715063752_add_school_principal` — Added SchoolProfile, PrincipalProfile

---

## Public Pages (8 routes)

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Hero banner, featured news, courses overview, testimonials |
| `/about` | About | School profile, history, vision, mission, principal message |
| `/courses` | Courses | List of all published courses with details |
| `/teachers` | Teachers | Faculty directory with photos and bios |
| `/gallery` | Gallery | Image gallery with category filtering |
| `/news` | News | News listing with excerpts |
| `/news/[slug]` | News Detail | Full news article |
| `/student-works` | Student Works | Student artwork showcase |
| `/contact` | Contact | Contact form (name, email, phone, subject, message) |

---

## Admin Panel (14 pages)

| Route | Section | Features |
|-------|---------|----------|
| `/admin/login` | Login | Username/password authentication |
| `/admin` | Dashboard | Overview statistics |
| `/admin/news` | News Management | CRUD with publish toggle |
| `/admin/gallery` | Gallery Management | CRUD with image upload |
| `/admin/courses` | Course Management | CRUD with level/sort order |
| `/admin/teachers` | Teacher Management | CRUD with photo upload |
| `/admin/student-works` | Student Works | CRUD with featured toggle |
| `/admin/events` | Event Management | CRUD with date/location |
| `/admin/messages` | Contact Messages | Read/view messages, mark as read |
| `/admin/pages` | Page Editor | Markdown content editor |
| `/admin/settings` | Site Settings | Key-value configuration |
| `/admin/school` | School Profile | School info editor |
| `/admin/principal` | Principal Profile | Principal info editor |
| `/admin/templates` | Excel Templates | Download/import bulk data |

---

## API Endpoints (23 route files)

### Authentication
- `POST /api/auth` — Login (username/password → JWT token)
- `GET /api/auth/me` — Get current admin user

### Content CRUD (each has GET list + POST create, GET/PUT/DELETE by ID)
- `/api/news` + `/api/news/[id]`
- `/api/gallery` + `/api/gallery/[id]`
- `/api/courses` + `/api/courses/[id]`
- `/api/teachers` + `/api/teachers/[id]`
- `/api/student-works` + `/api/student-works/[id]`
- `/api/events` + `/api/events/[id]`
- `/api/pages` + `/api/pages/[slug]`

### Settings & Profiles
- `/api/settings` — Site settings CRUD
- `/api/school` — School profile CRUD
- `/api/principal` — Principal profile CRUD

### Contact
- `/api/contact` — Submit contact form
- `/api/contact/message` — View messages

### Upload & Import
- `/api/upload` — File upload (images → `public/uploads/`)
- `/api/import/[model]` — Excel bulk import

---

## Authentication System

- **Method**: JWT tokens stored in HTTP cookies (`admin_token`)
- **Password Hashing**: bcryptjs with salt rounds of 12
- **Token Expiry**: 8 hours
- **JWT Secret**: Environment variable `JWT_SECRET` or auto-generated fallback
- **Default Credentials**: Username `honarestan`, Password `@hadiplmmlp` (set in seed.ts)
- **Auth Flow**: Login → set cookie → middleware checks cookie on admin routes

---

## Design & UI

### Color Scheme
- **Primary**: Blue (#2563eb) / Teal (#14b8a6)
- **Admin Theme**: Dark slate (#0f172a background, #1e293b cards, #334155 borders)
- **Public Theme**: Clean white with blue accents

### Typography
- **Font**: Vazirmatn (Google Fonts) — Persian/Farsi optimized
- **Direction**: Full RTL support throughout

### Icon System
- 40+ custom SVG icons in `src/components/icons/index.tsx`
- Professional icon set: AcademicCap, BookOpen, Photo, User, Calendar, ChatBubble, etc.
- No emojis used anywhere in the UI

### CSS Architecture
- Tailwind CSS v4 with custom theme tokens
- Custom admin form styles (`.admin-card`, `.admin-input`, `.admin-btn-primary`)
- Skip-to-content accessibility link
- Fade-in animations

### Accessibility
- ARIA labels on interactive elements
- Keyboard navigation support
- Semantic HTML structure
- Skip-to-content link for screen readers

### SEO
- Open Graph meta tags (Persian locale: fa_IR)
- Structured metadata in root layout
- Dynamic title templates (`%s | هنرستان هادی`)
- Persian keywords

---

## Seed Data

The seed script (`prisma/seed.ts`) creates:

1. **Admin User**: `honarestan` / `@hadiplmmlp`
2. **Site Settings**: school name, hero title/subtitle, address, phone, email
3. **About Page**: Default content with markdown formatting
4. **Teachers** (3): Sample faculty members
5. **Courses** (5): Painting, Calligraphy, Sculpture, Digital Graphics, Photography
6. **Testimonials** (3): Sample student/parent reviews
7. **SchoolProfile** (singleton): School overview, history, vision, mission, statistics
8. **PrincipalProfile** (singleton): Principal name, bio, welcome message, achievements

---

## Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| Dev server | `npm run dev` | Start development server at localhost:3000 |
| Build | `npm run build` | Production build |
| Start | `npm run start` | Start production server |
| Lint | `npm run lint` | Run ESLint |
| Seed | `npm run db:seed` | Seed database with default data |
| Generate Templates | `npx tsx scripts/generate-templates.ts` | Generate Excel import templates |

---

## Key Technical Notes

1. **Prisma Adapter**: Both `src/lib/prisma.ts` and `prisma/seed.ts` must use `@prisma/adapter-better-sqlite3` with `PrismaBetterSqlite3`
2. **Dynamic Rendering**: All Prisma-backed pages need `export const dynamic = "force-dynamic"`
3. **CSS Import Order**: `@import url(...)` for fonts MUST come before `@import "tailwindcss"` in globals.css
4. **No libvips**: `images.unoptimized: true` in next.config.ts (for environments without libvips)
5. **Native Binary Corruption**: If Bus error on build, delete and reinstall: `node_modules/@next/swc-linux-x64-gnu`, `node_modules/@tailwindcss/oxide-linux-x64-gnu`, `node_modules/lightningcss-linux-x64-gnu`
6. **Image Remote Patterns**: Allows images from `res.cloudinary.com` and `images.unsplash.com`
7. **TypeScript**: Strict mode enabled, path alias `@/*` maps to `./src/*`
8. **ESLint**: Passes with 0 errors, 0 warnings. Custom rules disable `no-img-element` and `set-state-in-effect`

---

## Documentation (Persian)

| File | Content |
|------|---------|
| `docs/راهنمای-مدیریت.md` | Complete admin guide — 13 sections covering all CMS features |
| `docs/کارت-راهنمای-سریع.md` | Quick reference card with shortcuts and troubleshooting |

---

## Current Status

- All 8 public pages working
- Admin panel with 14 management pages and full CRUD
- 23 API routes covering all operations
- Excel bulk import/export with 6 templates
- File upload API
- JWT authentication
- Seeded database with sample data
- Build passes successfully
- Lint passes with 0 errors, 0 warnings
- SVG icon system (no emojis)
- Accessibility: ARIA labels, keyboard nav, semantic HTML, skip-to-content
- SEO: Open Graph meta, structured metadata
- Responsive: Mobile-first design

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `file:./dev.db` | SQLite database path |
| `JWT_SECRET` | Auto-generated | JWT signing secret |

---

## Deployment Notes (Vercel)

For production deployment on Vercel with PostgreSQL:
1. Set `DATABASE_URL` to PostgreSQL connection string
2. Change `prisma/schema.prisma` datasource provider to `postgresql`
3. Update `src/lib/prisma.ts` to use `@prisma/adapter-pg`
4. Run `npx prisma migrate deploy`
5. Deploy with `vercel`

---

*Last updated: 2026-07-20*
