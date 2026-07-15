# Honarestan Hadi (هنرستان هادی) — Project Assistant

## Quick Start
```bash
cd /home/rango/Desktop/Honarestan-Hadi
npm run dev          # Dev server at http://localhost:3000
npm run build        # Production build
npm run db:seed      # Seed database
```

## What This Project Is
Full-stack dynamic website for "هنرستان هادی" (Hadi Art School) in Iran.
- **Stack**: Next.js 16, React 19, Tailwind CSS v4, Prisma 7.8 + SQLite, TypeScript
- **Language**: Entire site in Persian (Farsi) with RTL layout
- **Admin CMS**: `/admin` — manage news, gallery, pages, settings, contact messages
- **Default login**: `admin` / `admin123`

## First Thing To Do In Any Session
1. Read `PROJECT-DOCS.md` for full project status
2. Run `npm run dev` to start the dev server

## Critical Technical Notes (DO NOT SKIP)
- **Prisma adapter required**: `new PrismaClient({ adapter })` — use `@prisma/adapter-better-sqlite3` with `PrismaBetterSqlite3`
- **Both files need adapter**: `src/lib/prisma.ts` AND `prisma/seed.ts`
- **Native binary corruption**: If Bus error on build, delete corrupted dirs and `npm install`:
  - `node_modules/@next/swc-linux-x64-gnu`
  - `node_modules/@tailwindcss/oxide-linux-x64-gnu`
  - `node_modules/lightningcss-linux-x64-gnu`
- **CSS import order**: `@import url(...)` for fonts MUST come before `@import "tailwindcss"` in globals.css
- **Dynamic rendering**: All Prisma-backed pages need `export const dynamic = "force-dynamic"`
- **No libvips**: `images.unoptimized: true` in next.config.ts

## Rules
- All content in Persian (Farsi), RTL layout
- Never hardcode school content — everything via admin CMS
- Ask user for school-specific info — never assume
- Update `PROJECT-DOCS.md` after significant changes

## Project Status (as of 2026-07-10)
- All public pages working: Home, About, Gallery, News, Contact
- Admin panel with full CRUD: News, Gallery, Pages, Settings, Messages
- File upload API, JWT auth, seeded database
- Build passes successfully
- Footer has placeholder contact info — needs real school data
