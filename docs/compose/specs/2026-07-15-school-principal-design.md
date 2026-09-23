# School Introduction & Principal Profile Modules — Design Spec

## [S1] Problem

The Honarestan Hadi website currently has no way to manage school information or principal profile dynamically. All school-related content would need to be hardcoded, violating the project's core principle that all editable content must be managed through the Admin Panel.

Additionally, the admin panel forms have a critical UI/UX issue: CSS classes (`admin-card`, `admin-input`, `admin-btn-primary`, `admin-btn-secondary`) are used throughout but never defined in `globals.css`, making form fields invisible and unusable.

## [S2] Solution Overview

1. **Database**: Add `SchoolProfile` and `PrincipalProfile` models (single-record each)
2. **API**: CRUD endpoints for both models
3. **Admin UI**: Management pages at `/admin/school` and `/admin/principal`
4. **Public UI**: Dynamic `/about` page fetching from database
5. **UI/UX Fix**: Define missing CSS classes and update all existing forms

## [S3] Database Models

### SchoolProfile

```prisma
model SchoolProfile {
  id               String   @id @default(cuid())
  overview         String   @default("")
  history          String   @default("")
  vision           String   @default("")
  mission          String   @default("")
  educationalGoals String   @default("")
  departments      String   @default("")
  facilities       String   @default("")
  statistics       String   @default("{}")   // JSON: { "students": 500, "teachers": 25, ... }
  galleryImages    String   @default("[]")   // JSON array of image URLs
  additionalInfo   String   @default("")
  published        Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### PrincipalProfile

```prisma
model PrincipalProfile {
  id             String   @id @default(cuid())
  name           String   @default("")
  photo          String?
  position       String   @default("")
  biography      String   @default("")
  welcomeMessage String   @default("")
  resume         String   @default("")
  achievements   String   @default("[]")   // JSON array of achievement strings
  contactInfo    String?
  published      Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## [S4] API Endpoints

### School Profile
- `GET /api/school` — Fetch school profile (public)
- `PUT /api/school` — Update school profile (admin)

### Principal Profile
- `GET /api/principal` — Fetch principal profile (public)
- `PUT /api/principal` — Update principal profile (admin)

Both endpoints use upsert pattern (create if not exists, update if exists) since there's only one record.

## [S5] Admin Panel Pages

### `/admin/school`
- Form with sections: Overview, History, Vision, Mission, Educational Goals, Departments, Facilities, Statistics (key-value editor), Gallery (image URLs), Additional Info
- Publish/unpublish toggle
- Save button

### `/admin/principal`
- Form with fields: Name, Photo (upload), Position, Biography, Welcome Message, Resume, Achievements (list editor), Contact Info
- Publish/unpublish toggle
- Save button

## [S6] Public Pages

### `/about` Page
- Fetches SchoolProfile and PrincipalProfile from database
- Displays all sections dynamically
- Shows principal welcome message/bio
- Gallery section with images
- Statistics display

## [S7] UI/UX Form Fix

### CSS Classes to Define in `globals.css`

```css
.admin-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.admin-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1.5px solid #cbd5e1;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  transition: all 0.15s;
}

.admin-input:hover {
  border-color: #94a3b8;
}

.admin-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.admin-btn-primary {
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background 0.15s;
}

.admin-btn-primary:hover {
  background: #1d4ed8;
}

.admin-btn-secondary {
  padding: 0.625rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s;
}

.admin-btn-secondary:hover {
  background: #e2e8f0;
}
```

### Form Updates
- All existing forms already use `admin-input` class — just need the CSS definitions
- Add `animate-fade-in` keyframe if not present

## [S8] Sidebar Update

Add to `AdminSidebar.tsx`:
- `{ href: "/admin/school", label: "درباره مدرسه", icon: AcademicCap }`
- `{ href: "/admin/principal", label: "مدیر مدرسه", icon: User }`

## [S9] Seed Data

Update `prisma/seed.ts` to create default SchoolProfile and PrincipalProfile records with placeholder content.

## [S10] Scope Gate

**In scope:**
- Database models + migration
- API endpoints (school, principal)
- Admin pages (school, principal)
- Public about page update
- UI/UX CSS fix
- Sidebar update
- Seed data

**Out of scope:**
- Rich text editor (using textarea for now)
- Image upload for school gallery (using URL input)
- Multiple principals support
- Version history
