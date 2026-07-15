# Honarestan Hadi - هنرستان هادی

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Prisma ORM 7.8 + SQLite (via `@prisma/adapter-better-sqlite3`)
- **Auth**: JWT-based admin authentication (jsonwebtoken + bcryptjs)
- **Language**: TypeScript
- **Font**: Vazirmatn (Google Fonts, Persian/Farsi)

## Database Models
- **News** - Blog/news posts with title, slug, content, excerpt, image, published status
- **Gallery** - Image gallery with title, image, category, description
- **Page** - CMS-style pages (About, etc.) with slug-based routing
- **ContactMessage** - Contact form submissions
- **SiteSetting** - Key-value site configuration
- **AdminUser** - Admin authentication

## Admin Panel
- URL: `/admin`
- Default credentials: `admin` / `admin123`
- Features: CRUD for news, gallery, pages, settings, message viewer

## How to Add Content
1. Go to `/admin/login`
2. Login with admin credentials
3. Use the sidebar to navigate to the section you want to manage
4. Add/edit/delete content using the forms

## Development
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

## Build & Deployment (Vercel)
```bash
npm run build
```

### Vercel Deployment Steps:
1. Set `DATABASE_URL` to PostgreSQL in Vercel environment variables
2. Update `prisma/schema.prisma` datasource provider to `postgresql`
3. Update `src/lib/prisma.ts` to use `@prisma/adapter-pg` instead of `@prisma/adapter-better-sqlite3`
4. Run `npx prisma migrate deploy`
5. Deploy with `vercel`

## Folder Structure
```
src/
├── app/
│   ├── (public)/          # Public pages (Home, About, Gallery, News, Contact)
│   │   ├── page.tsx       # Home page
│   │   ├── layout.tsx     # Public layout (Header + Footer)
│   │   ├── about/         # About page
│   │   ├── gallery/       # Gallery page
│   │   ├── news/          # News listing + detail pages
│   │   └── contact/       # Contact form
│   ├── admin/             # Admin panel
│   │   ├── layout.tsx     # Admin layout (sidebar + auth check)
│   │   ├── login/         # Login page
│   │   ├── page.tsx       # Dashboard
│   │   ├── news/          # News management
│   │   ├── gallery/       # Gallery management
│   │   ├── pages/         # Page content management
│   │   ├── settings/      # Site settings
│   │   └── messages/      # Contact messages viewer
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication
│   │   ├── news/          # News CRUD
│   │   ├── gallery/       # Gallery CRUD
│   │   ├── pages/         # Pages CRUD
│   │   ├── settings/      # Settings CRUD
│   │   ├── contact/       # Contact form + messages
│   │   └── upload/        # File upload
│   ├── layout.tsx         # Root layout (RTL, Persian fonts)
│   └── globals.css        # Global styles with RTL support
├── components/
│   ├── ui/                # Reusable UI (Hero, NewsCard, GalleryItem)
│   ├── layout/            # Header, Footer
│   └── admin/             # Admin components (AdminSidebar)
├── lib/
│   ├── prisma.ts          # Database client (with adapter)
│   ├── auth.ts            # Authentication utilities
│   └── utils.ts           # Utility functions
└── generated/
    └── prisma/            # Auto-generated Prisma client

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migrations
├── seed.ts                # Seed script
└── config.ts              # Prisma config
```

## Color Scheme
- Primary: Blue (#2563eb) / Teal (#14b8a6)
- RTL: Full Persian/Farsi support with Vazirmatn font
- Design tokens: Slate-based grays, semantic color system

## Icon System
- Custom SVG icon library at `src/components/icons/index.tsx`
- 40+ icons: AcademicCap, BookOpen, Photo, User, Calendar, ChatBubble, etc.
- All emojis replaced with professional SVG icons

## Key Technical Notes
- Prisma 7.8 requires explicit adapter (`@prisma/adapter-better-sqlite3`)
- Images are set to `unoptimized: true` in next.config.ts (for environments without libvips)
- All database-backed pages use `export const dynamic = "force-dynamic"` to prevent static generation issues
- CSS `@import` for Google Fonts must come before `@import "tailwindcss"` in globals.css
- All fetch functions use `useCallback` for proper React hook dependencies
- ESLint passes with 0 errors, 0 warnings

## Current Status
- All public pages: Home, About, Gallery, News, Contact, Courses, Teachers, Student Works ✓
- Admin panel with full CRUD: News, Gallery, Pages, Settings, Messages, Courses, Teachers, Events, Testimonials, Student Works ✓
- File upload API ✓
- JWT authentication ✓
- Database seeded with default admin + settings ✓
- Build passes successfully ✓
- Lint passes with 0 errors, 0 warnings ✓
- SVG icon system (no emojis) ✓
- Professional UI redesign ✓
- Accessibility: ARIA labels, keyboard nav, semantic HTML, skip-to-content ✓
- SEO: Open Graph meta, structured metadata ✓
- Responsive: Mobile-first, all breakpoints tested ✓
