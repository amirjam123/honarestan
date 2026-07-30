# Honarestan Hadi (هنرستان هادی) — Project Assistant

## Quick Start
```bash
npm install
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run db:seed      # Seed database
```

## What This Project Is
Full-stack dynamic website for "هنرستان هادی" (Hadi Art School) in Iran.
- **Stack**: Next.js 16, React 19, Tailwind CSS v4, Prisma 7.8 + PostgreSQL, TypeScript
- **Database Host**: Neon (serverless PostgreSQL)
- **Language**: Entire site in Persian (Farsi) with RTL layout
- **Admin CMS**: `/hadi-panel-x7k9` — manage news, gallery, teachers, courses, events, student works, pages, settings, messages, tickets
- **Default login**: `honarestan` / `Hadi1234`

## First Thing To Do In Any Session
1. Read `PROJECT-DOCS.md` for full project status
2. Run `npm run dev` to start the dev server

## Critical Technical Notes (DO NOT SKIP)
- **Prisma adapter**: Uses `@prisma/adapter-pg` with `PrismaPg` for PostgreSQL connection
- **Both files need adapter**: `src/lib/prisma.ts` AND `prisma/seed.ts`
- **CSS import order**: `@import "tailwindcss"` must come after any font imports in globals.css
- **Dynamic rendering**: All Prisma-backed pages need `export const dynamic = "force-dynamic"`
- **No libvips**: `images.unoptimized: true` in next.config.ts
- **Environment variables**: `DATABASE_URL` (Neon PostgreSQL), `JWT_SECRET` (JWT signing), `ADMIN_SECRET_PATH` (admin URL path), `TELEGRAM_BOT_TOKEN` (Telegram Bot API token), `TELEGRAM_CHAT_ID` (Telegram channel/chat ID for image storage)

## Rules
- All content in Persian (Farsi), RTL layout
- Never hardcode school content — everything via admin CMS
- Ask user for school-specific info — never assume
- Update `PROJECT-DOCS.md` after significant changes

## Project Status (as of 2026-07-23)
- All public pages working: Home, About, Gallery, News, Contact, Courses, Teachers, Student Works, Events
- Admin panel with full CRUD: News, Gallery, Pages, Settings, Messages, Courses, Teachers, Events, Student Works
- Support ticket system with conversation threading
- Excel bulk import for teachers, courses, and news
- File upload API with validation (magic bytes, MIME, size)
- JWT authentication with rate limiting
- Admin logout button
- Password change UI
- Database seeded with default admin + settings
- Build passes successfully
- Responsive design with mobile admin sidebar
- Documentation: `docs/ADMIN-MANUAL.md`, `docs/ADMIN_QUICK_START.md`
