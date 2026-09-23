# Homepage Redesign & Excel Import — Design Spec

## [S1] Problem

1. Homepage has hardcoded stats ("۱۵+ سال تجربه", "۵۰۰+ هنرجوی فارغ‌التحصیل") that should be removed
2. School Introduction and Principal Introduction are not visible on homepage
3. No Excel import feature exists for bulk data entry

## [S2] Solution Overview

1. Remove two hardcoded stats cards from homepage
2. Add School Profile and Principal Profile sections to homepage (after Hero)
3. Implement intelligent Excel import for admin panel

## [S3] Homepage Changes

### Remove Stats
Remove from stats section:
- `{ label: "سال تجربه", value: "۱۵+", icon: Award, color: "text-amber-600 bg-amber-50" }`
- `{ label: "هنرجوی فارغ‌التحصیل", value: "۵۰۰+", icon: AcademicCap, color: "text-primary-600 bg-primary-50" }`

Keep:
- دوره آموزشی (dynamic from courses.length)
- استاد مجرب (dynamic from teachers.length)

### Add School & Principal Sections
After Hero, add:
1. **School Introduction Section** — Fetches SchoolProfile from database, displays overview, vision, mission
2. **Principal Welcome Section** — Fetches PrincipalProfile from database, displays welcome message, name, photo

### New Homepage Order
1. Hero Banner
2. School Introduction (dynamic)
3. Principal Welcome (dynamic)
4. Stats (2 cards: دوره‌ها و اساتید)
5. Courses
6. Teachers
7. News
8. Gallery
9. CTA

## [S4] Excel Import Feature

### Dependencies
- Add `xlsx` package for Excel parsing

### API Endpoint
- `POST /api/import/[model]` — Import Excel file for specified model
- Supports: teachers, courses, news

### Column Detection
- Match columns by header name (Persian/English)
- Ignore unknown columns
- Handle missing optional columns

### Validation
- Validate each row before import
- Show detailed errors per row
- Import valid rows even if some fail
- Prevent duplicates based on business rules

### Import Summary
- Total rows
- Successfully imported
- Skipped (duplicates)
- Validation errors (with row numbers)

### Admin UI
- Add import button to admin pages (teachers, courses, news)
- File upload dialog
- Preview mapping
- Show import results

## [S5] Scope Gate

**In scope:**
- Remove 2 hardcoded stats from homepage
- Add School & Principal sections to homepage
- Install xlsx package
- Create import API
- Add import UI to admin

**Out of scope:**
- Remove StudentWork model (keeping as-is)
- Remove other stats (keeping دوره‌ها و اساتید)
- Modify admin panel structure
