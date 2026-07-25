# Honarestan Hadi - هنرستان هادی

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19 + Tailwind CSS v4
- **Database**: Prisma ORM 7.8 + PostgreSQL (via `@prisma/adapter-pg`)
- **Database Host**: Neon (serverless PostgreSQL)
- **Auth**: JWT-based admin authentication (jsonwebtoken + bcryptjs)
- **Language**: TypeScript
- **Font**: Vazirmatn (Google Fonts, Persian/Farsi)
- **Hosting**: Vercel

## Database Models
- **News** - Blog/news posts with title, slug, content, excerpt, image, published status
- **Gallery** - Image gallery with title, image, category, description
- **Page** - CMS-style pages (About, etc.) with slug-based routing
- **ContactMessage** - Contact form submissions
- **SiteSetting** - Key-value site configuration
- **AdminUser** - Admin authentication
- **Teacher** - Teacher profiles with name, title, bio, image, specialty, sortOrder, published
- **Course** - Course listings with title, description, image, duration, level, sortOrder, published
- **StudentWork** - Student artwork with title, studentName, description, image, category, year, featured, published
- **Event** - School events with title, description, image, date, location, published
- **Testimonial** - Student/parent testimonials with name, role, content, image, rating, sortOrder, published
- **SchoolProfile** - School overview, history, goals, departments, facilities, statistics (singleton)
- **PrincipalProfile** - Principal name, photo, position, biography, welcome message, resume, achievements (singleton)
- **Ticket** - Support tickets with subject, userName, userEmail, status
- **TicketMessage** - Individual messages within tickets
- **SecurityLog** - Security event audit trail
- **LoginAttempt** - Login attempt tracking

## Admin Panel
- URL: `/hadi-panel-x7k9/login`
- Default credentials: `honarestan` / `@hadiplmmlp`
- Features:
  - Dashboard with content counts
  - CRUD for news, gallery, teachers, courses, events, student works
  - Pages editor (Markdown)
  - School profile management
  - Principal profile management
  - Settings management
  - Contact messages viewer
  - Support ticket management
  - Excel template downloads and bulk import
  - Backup information
  - Password change

## Public Pages
- **Home** (`/`) — Hero, school introduction, principal welcome, teachers, featured student works, news, gallery preview
- **About** (`/about`) — School history, goals, departments, facilities, principal biography, teachers preview
- **Teachers** (`/teachers`) — All published teachers
- **Courses** (`/courses`) — All published courses
- **Gallery** (`/gallery`) — All gallery images with fullscreen viewer
- **News** (`/news`) — All published news articles
- **News Detail** (`/news/[slug]`) — Single news article
- **Events** (`/events`) — All published events
- **Student Works** (`/student-works`) — All published student artworks
- **Contact** (`/contact`) — Support ticket system and contact form

## How to Add Content
1. Go to `/hadi-panel-x7k9/login`
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
1. Ensure `DATABASE_URL` is set in Vercel environment variables (Neon PostgreSQL connection string)
2. Ensure `JWT_SECRET` is set in Vercel environment variables
3. Deploy with `vercel --prod`
4. The build command automatically runs `prisma generate`, `prisma migrate deploy`, and `next build`

### Environment Variables
| Variable | Description |
|----------|------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `JWT_SECRET` | Secret key for JWT token signing |
| `ADMIN_SECRET_PATH` | Custom admin panel URL path (default: hadi-panel-x7k9) |

## Folder Structure
```
src/
├── app/
│   ├── (public)/          # Public pages (Home, About, Gallery, News, Contact, etc.)
│   │   ├── page.tsx       # Home page
│   │   ├── layout.tsx     # Public layout (Header + Footer)
│   │   ├── about/         # About page
│   │   ├── gallery/       # Gallery page
│   │   ├── news/          # News listing + detail pages
│   │   ├── courses/       # Courses page
│   │   ├── teachers/      # Teachers page
│   │   ├── events/        # Events page
│   │   ├── student-works/ # Student works page
│   │   └── contact/       # Contact / ticket system
│   ├── hadi-panel-x7k9/   # Admin panel
│   │   ├── layout.tsx     # Admin layout (sidebar + auth check)
│   │   ├── login/         # Login page
│   │   ├── page.tsx       # Dashboard
│   │   ├── news/          # News management
│   │   ├── gallery/       # Gallery management
│   │   ├── teachers/      # Teachers management
│   │   ├── courses/       # Courses management
│   │   ├── events/        # Events management
│   │   ├── student-works/ # Student works management
│   │   ├── pages/         # Page content management
│   │   ├── school/        # School profile management
│   │   ├── principal/     # Principal profile management
│   │   ├── settings/      # Site settings
│   │   ├── messages/      # Contact messages viewer
│   │   ├── tickets/       # Ticket management
│   │   ├── templates/     # Excel template downloads
│   │   ├── password/      # Password change
│   │   └── backup/        # Backup information
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication (login, logout, me, change-password)
│   │   ├── news/          # News CRUD
│   │   ├── gallery/       # Gallery CRUD
│   │   ├── teachers/      # Teachers CRUD
│   │   ├── courses/       # Courses CRUD
│   │   ├── events/        # Events CRUD
│   │   ├── student-works/ # Student works CRUD
│   │   ├── pages/         # Pages CRUD
│   │   ├── school/        # School profile
│   │   ├── principal/     # Principal profile
│   │   ├── settings/      # Settings CRUD
│   │   ├── contact/       # Contact form + messages
│   │   ├── tickets/       # Public ticket system
│   │   ├── admin/         # Admin-only endpoints (backup, tickets, logs)
│   │   ├── upload/        # File upload
│   │   └── import/        # Excel import
│   ├── layout.tsx         # Root layout (RTL, Persian fonts)
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI (Hero, NewsCard, GalleryItem, ScrollToTop)
│   ├── layout/            # Header, Footer
│   ├── admin/             # Admin components (AdminSidebar, ExcelImport)
│   └── icons/             # SVG icon library (40+ icons)
├── lib/
│   ├── prisma.ts          # Database client
│   ├── auth.ts            # Authentication utilities
│   ├── password.ts        # Password strength validation
│   ├── validation.ts      # Input validation and sanitization
│   ├── security-logger.ts # Security event logging
│   ├── admin-config.ts    # Admin path configuration
│   └── utils.ts           # Utility functions
└── generated/
    └── prisma/            # Auto-generated Prisma client

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migrations
├── seed.ts                # Seed script
└── config.ts              # Prisma config

docs/
├── ADMIN-MANUAL.md        # Complete administrator manual
└── ADMIN_QUICK_START.md   # Quick start guide for administrators
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
- Prisma 7.8 uses `@prisma/adapter-pg` for PostgreSQL connection
- Images are set to `unoptimized: true` in next.config.ts (for environments without libvips)
- All database-backed pages use `export const dynamic = "force-dynamic"` to prevent static generation issues
- CSS `@import` for Google Fonts must come before `@import "tailwindcss"` in globals.css
- All fetch functions use `useCallback` for proper React hook dependencies
- ESLint passes with 0 errors, 0 warnings

## Current Status
- All public pages: Home, About, Gallery, News, Contact, Courses, Teachers, Student Works, Events ✓
- Admin panel with full CRUD: News, Gallery, Pages, Settings, Messages, Courses, Teachers, Events, Testimonials, Student Works ✓
- File upload API ✓
- JWT authentication with rate limiting ✓
- Database seeded with default admin + settings ✓
- Build passes successfully ✓
- Lint passes with 0 errors, 0 warnings ✓
- SVG icon system (no emojis) ✓
- Professional UI redesign ✓
- Accessibility: ARIA labels, keyboard nav, semantic HTML, skip-to-content ✓
- SEO: Open Graph meta, structured metadata ✓
- Responsive: Mobile-first, all breakpoints tested ✓
- Admin sidebar with mobile hamburger menu ✓
- Support ticket system with conversation threading ✓
- Excel bulk import for teachers, courses, and news ✓
- Password change UI in admin panel ✓
- Admin logout button ✓
