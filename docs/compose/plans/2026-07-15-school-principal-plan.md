# School Introduction & Principal Profile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add School Introduction and Principal Profile modules with full admin management and fix admin form visibility

**Architecture:** Single-record Prisma models for SchoolProfile and PrincipalProfile, REST API endpoints with upsert pattern, admin panel pages with form management, dynamic public about page

**Tech Stack:** Next.js 16, Prisma 7.8, SQLite, Tailwind CSS v4, TypeScript

## Global Constraints

- All content in Persian (Farsi), RTL layout
- No hardcoded editable content — everything via database
- Follow existing codebase patterns (API routes, admin pages, component structure)
- All admin forms use `admin-card`, `admin-input`, `admin-btn-primary` CSS classes
- Use `export const dynamic = "force-dynamic"` for database-backed pages

---

## File Structure

### New Files
- `src/app/api/school/route.ts` — School profile API (GET, PUT)
- `src/app/api/principal/route.ts` — Principal profile API (GET, PUT)
- `src/app/admin/school/page.tsx` — School profile admin page
- `src/app/admin/principal/page.tsx` — Principal profile admin page

### Modified Files
- `prisma/schema.prisma` — Add SchoolProfile and PrincipalProfile models
- `src/app/globals.css` — Add admin-* CSS classes
- `src/components/admin/AdminSidebar.tsx` — Add school/principal links
- `src/app/(public)/about/page.tsx` — Fetch from database dynamically
- `prisma/seed.ts` — Seed default school/principal data

---

### Task 1: Add CSS Classes for Admin Forms

**Covers:** S7

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: CSS classes used by all admin forms (`admin-card`, `admin-input`, `admin-btn-primary`, `admin-btn-secondary`)

- [ ] **Step 1: Add admin CSS classes to globals.css**

```css
/* Admin Form Styles */
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
  color: #1e293b;
  transition: all 0.15s ease;
}

.admin-input:hover {
  border-color: #94a3b8;
}

.admin-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.admin-input::placeholder {
  color: #94a3b8;
}

.admin-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease;
}

.admin-btn-primary:hover {
  background: #1d4ed8;
}

.admin-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1.25rem;
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.admin-btn-secondary:hover {
  background: #e2e8f0;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

- [ ] **Step 2: Verify CSS is valid**

Run: `npm run dev`
Expected: Server starts without CSS errors

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "fix: add admin form CSS classes for visibility"
```

---

### Task 2: Add Database Models

**Covers:** S3

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed.ts`

**Interfaces:**
- Produces: `SchoolProfile` and `PrincipalProfile` Prisma models

- [ ] **Step 1: Add SchoolProfile model to schema.prisma**

Add after the `Testimonial` model:

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
  statistics       String   @default("{}")
  galleryImages    String   @default("[]")
  additionalInfo   String   @default("")
  published        Boolean  @default(true)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model PrincipalProfile {
  id             String   @id @default(cuid())
  name           String   @default("")
  photo          String?
  position       String   @default("")
  biography      String   @default("")
  welcomeMessage String   @default("")
  resume         String   @default("")
  achievements   String   @default("[]")
  contactInfo    String?
  published      Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

- [ ] **Step 2: Run database migration**

Run: `npx prisma migrate dev --name add-school-principal`
Expected: Migration created successfully

- [ ] **Step 3: Add seed data for SchoolProfile**

Add to `prisma/seed.ts` after existing seed data:

```typescript
// Seed School Profile
const schoolProfile = await prisma.schoolProfile.upsert({
  where: { id: "singleton" },
  update: {},
  create: {
    id: "singleton",
    overview: "هنرستان هادی یکی از مراکز آموزشی پیشرو در زمینه هنرهای زیبا و صنایع خلاق است.",
    history: "هنرستان هادی در سال ۱۳۸۰ تأسیس شد و از آن زمان تاکنون در حال ارائه خدمات آموزشی با کیفیت است.",
    vision: "تبدیل شدن به مرکز برتر آموزش هنر در سطح کشور",
    mission: "آموزش هنرهای زیبا و صنایع خلاق با استفاده از روش‌های نوین و اساتید مجرب",
    educationalGoals: "پرورش خلاقیت هنرجویان\nارائه مهارت‌های عملی\nآماده‌سازی برای بازار کار",
    departments: "نقاشی و طراحی\nمجسمه‌سازی\nخوشنویسی\nگرافیک\nعکاسی",
    facilities: "کارگاه‌های مجهز\nنمایشگاه دائمی\nکتابخانه تخصصی\nاستودیو عکاسی",
    statistics: JSON.stringify({
      students: 500,
      teachers: 25,
      graduates: 2000,
      courses: 15
    }),
    published: true,
  },
});
```

- [ ] **Step 4: Add seed data for PrincipalProfile**

Add to `prisma/seed.ts`:

```typescript
// Seed Principal Profile
const principalProfile = await prisma.principalProfile.upsert({
  where: { id: "singleton" },
  update: {},
  create: {
    id: "singleton",
    name: "نام مدیر",
    position: "مدیر هنرستان",
    biography: "بیوگرافی مدیر هنرستان در اینجا قرار می‌گیرد.",
    welcomeMessage: "به هنرستان هادی خوش آمدید. ما مفتخریم که در خدمت هنرجویان عزیز هستیم.",
    achievements: JSON.stringify([
      "۲۰ سال تجربه آموزشی",
      "انتشار ۵ کتاب تخصصی",
      "برگزاری ۵۰ نمایشگاه هنری"
    ]),
    published: true,
  },
});
```

- [ ] **Step 5: Run seed script**

Run: `npm run db:seed`
Expected: Seed completes without errors

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts prisma/migrations/
git commit -m "feat: add SchoolProfile and PrincipalProfile database models"
```

---

### Task 3: Create School Profile API

**Covers:** S4

**Files:**
- Create: `src/app/api/school/route.ts`

**Interfaces:**
- Produces: `GET /api/school` — Returns SchoolProfile object
- Produces: `PUT /api/school` — Updates SchoolProfile, returns updated object

- [ ] **Step 1: Create school API route**

Create `src/app/api/school/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await prisma.schoolProfile.findFirst();
    return NextResponse.json(profile || null);
  } catch (error) {
    console.error("Error fetching school profile:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const existing = await prisma.schoolProfile.findFirst();
    
    const data = {
      overview: body.overview || "",
      history: body.history || "",
      vision: body.vision || "",
      mission: body.mission || "",
      educationalGoals: body.educationalGoals || "",
      departments: body.departments || "",
      facilities: body.facilities || "",
      statistics: body.statistics || "{}",
      galleryImages: body.galleryImages || "[]",
      additionalInfo: body.additionalInfo || "",
      published: body.published ?? true,
    };

    let profile;
    if (existing) {
      profile = await prisma.schoolProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      profile = await prisma.schoolProfile.create({ data });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating school profile:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی اطلاعات" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test API endpoint**

Run: `npm run dev`
Then: `curl http://localhost:3000/api/school`
Expected: Returns JSON with school profile data

- [ ] **Step 3: Commit**

```bash
git add src/app/api/school/route.ts
git commit -m "feat: add school profile API endpoints"
```

---

### Task 4: Create Principal Profile API

**Covers:** S4

**Files:**
- Create: `src/app/api/principal/route.ts`

**Interfaces:**
- Produces: `GET /api/principal` — Returns PrincipalProfile object
- Produces: `PUT /api/principal` — Updates PrincipalProfile, returns updated object

- [ ] **Step 1: Create principal API route**

Create `src/app/api/principal/route.ts`:

```typescript
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await prisma.principalProfile.findFirst();
    return NextResponse.json(profile || null);
  } catch (error) {
    console.error("Error fetching principal profile:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const existing = await prisma.principalProfile.findFirst();
    
    const data = {
      name: body.name || "",
      photo: body.photo || null,
      position: body.position || "",
      biography: body.biography || "",
      welcomeMessage: body.welcomeMessage || "",
      resume: body.resume || "",
      achievements: body.achievements || "[]",
      contactInfo: body.contactInfo || null,
      published: body.published ?? true,
    };

    let profile;
    if (existing) {
      profile = await prisma.principalProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      profile = await prisma.principalProfile.create({ data });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating principal profile:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی اطلاعات" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test API endpoint**

Run: `npm run dev`
Then: `curl http://localhost:3000/api/principal`
Expected: Returns JSON with principal profile data

- [ ] **Step 3: Commit**

```bash
git add src/app/api/principal/route.ts
git commit -m "feat: add principal profile API endpoints"
```

---

### Task 5: Create School Profile Admin Page

**Covers:** S5

**Files:**
- Create: `src/app/admin/school/page.tsx`

**Interfaces:**
- Consumes: `GET /api/school`, `PUT /api/school`
- Produces: Admin page for managing school profile

- [ ] **Step 1: Create school admin page**

Create `src/app/admin/school/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Save } from "@/components/icons";

interface SchoolProfile {
  id: string;
  overview: string;
  history: string;
  vision: string;
  mission: string;
  educationalGoals: string;
  departments: string;
  facilities: string;
  statistics: string;
  galleryImages: string;
  additionalInfo: string;
  published: boolean;
}

export default function AdminSchoolPage() {
  const [form, setForm] = useState<SchoolProfile>({
    id: "",
    overview: "",
    history: "",
    vision: "",
    mission: "",
    educationalGoals: "",
    departments: "",
    facilities: "",
    statistics: "{}",
    galleryImages: "[]",
    additionalInfo: "",
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/school");
    if (res.ok) {
      const data = await res.json();
      if (data) setForm(data);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/school", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("اطلاعات با موفقیت ذخیره شد");
      fetchProfile();
    } else {
      setMessage("خطا در ذخیره اطلاعات");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت اطلاعات مدرسه</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("خطا") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">معرفی کلی</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">overview</label>
            <textarea
              rows={4}
              value={form.overview}
              onChange={(e) => setForm({ ...form, overview: e.target.value })}
              className="admin-input resize-none"
              placeholder="معرفی کلی مدرسه..."
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">history</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">history</label>
            <textarea
              rows={4}
              value={form.history}
              onChange={(e) => setForm({ ...form, history: e.target.value })}
              className="admin-input resize-none"
              placeholder="تاریخچه مدرسه..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">vision</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">vision</label>
              <textarea
                rows={3}
                value={form.vision}
                onChange={(e) => setForm({ ...form, vision: e.target.value })}
                className="admin-input resize-none"
                placeholder="چشم‌انداز مدرسه..."
              />
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">mission</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">mission</label>
              <textarea
                rows={3}
                value={form.mission}
                onChange={(e) => setForm({ ...form, mission: e.target.value })}
                className="admin-input resize-none"
                placeholder="mission مدرسه..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">educationalGoals</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">educationalGoals</label>
            <textarea
              rows={4}
              value={form.educationalGoals}
              onChange={(e) => setForm({ ...form, educationalGoals: e.target.value })}
              className="admin-input resize-none"
              placeholder="اهداف آموزشی (هر هدف در یک خط)..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">departments</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">departments</label>
              <textarea
                rows={4}
                value={form.departments}
                onChange={(e) => setForm({ ...form, departments: e.target.value })}
                className="admin-input resize-none"
                placeholder="بخش‌ها (هر بخش در یک خط)..."
              />
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">facilities</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">facilities</label>
              <textarea
                rows={4}
                value={form.facilities}
                onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                className="admin-input resize-none"
                placeholder="امکانات (هر مورد در یک خط)..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">statistics</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">statistics (JSON)</label>
            <textarea
              rows={3}
              value={form.statistics}
              onChange={(e) => setForm({ ...form, statistics: e.target.value })}
              className="admin-input resize-none font-mono text-xs"
              placeholder='{"students": 500, "teachers": 25}'
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">additionalInfo</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">additionalInfo</label>
            <textarea
              rows={4}
              value={form.additionalInfo}
              onChange={(e) => setForm({ ...form, additionalInfo: e.target.value })}
              className="admin-input resize-none"
              placeholder="additionalInfo..."
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="published" className="text-xs text-slate-600">منتشر شده</label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={16} />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Test admin page**

Run: `npm run dev`
Navigate to: `http://localhost:3000/admin/school`
Expected: Form displays with all fields visible and styled

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/school/page.tsx
git commit -m "feat: add school profile admin page"
```

---

### Task 6: Create Principal Profile Admin Page

**Covers:** S5

**Files:**
- Create: `src/app/admin/principal/page.tsx`

**Interfaces:**
- Consumes: `GET /api/principal`, `PUT /api/principal`
- Produces: Admin page for managing principal profile

- [ ] **Step 1: Create principal admin page**

Create `src/app/admin/principal/page.tsx`:

```typescript
"use client";

import { useState, useEffect, useCallback } from "react";
import { Save } from "@/components/icons";

interface PrincipalProfile {
  id: string;
  name: string;
  photo: string | null;
  position: string;
  biography: string;
  welcomeMessage: string;
  resume: string;
  achievements: string;
  contactInfo: string | null;
  published: boolean;
}

export default function AdminPrincipalPage() {
  const [form, setForm] = useState<PrincipalProfile>({
    id: "",
    name: "",
    photo: null,
    position: "",
    biography: "",
    welcomeMessage: "",
    resume: "",
    achievements: "[]",
    contactInfo: null,
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/principal");
    if (res.ok) {
      const data = await res.json();
      if (data) setForm(data);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/principal", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setMessage("اطلاعات با موفقیت ذخیره شد");
      fetchProfile();
    } else {
      setMessage("خطا در ذخیره اطلاعات");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">مدیریت پروفایل مدیر</h1>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("خطا") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">نام</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">نام مدیر</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input"
                placeholder="نام و نام خانوادگی..."
              />
            </div>
          </div>

          <div className="admin-card">
            <h2 className="text-sm font-bold mb-4 text-slate-800">position</h2>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">position</label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
                className="admin-input"
                placeholder="سمت..."
              />
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">photo</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">photo (URL)</label>
            <input
              type="text"
              value={form.photo || ""}
              onChange={(e) => setForm({ ...form, photo: e.target.value || null })}
              className="admin-input"
              placeholder="آدرس تصویر..."
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">biography</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">biography</label>
            <textarea
              rows={5}
              value={form.biography}
              onChange={(e) => setForm({ ...form, biography: e.target.value })}
              className="admin-input resize-none"
              placeholder="biography مدیر..."
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">welcomeMessage</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">welcomeMessage</label>
            <textarea
              rows={4}
              value={form.welcomeMessage}
              onChange={(e) => setForm({ ...form, welcomeMessage: e.target.value })}
              className="admin-input resize-none"
              placeholder="پیام خوش‌آمدگویی..."
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">resume</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">resume</label>
            <textarea
              rows={5}
              value={form.resume}
              onChange={(e) => setForm({ ...form, resume: e.target.value })}
              className="admin-input resize-none"
              placeholder="سوابق تحصیلی و حرفه‌ای..."
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">achievements</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">achievements (JSON array)</label>
            <textarea
              rows={3}
              value={form.achievements}
              onChange={(e) => setForm({ ...form, achievements: e.target.value })}
              className="admin-input resize-none font-mono text-xs"
              placeholder='["دستاورد ۱", "دستاورد ۲"]'
            />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="text-sm font-bold mb-4 text-slate-800">contactInfo</h2>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">contactInfo</label>
            <textarea
              rows={2}
              value={form.contactInfo || ""}
              onChange={(e) => setForm({ ...form, contactInfo: e.target.value || null })}
              className="admin-input resize-none"
              placeholder="اطلاعات تماس..."
            />
          </div>
        </div>

        <div className="admin-card">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="w-4 h-4 rounded"
            />
            <label htmlFor="published" className="text-xs text-slate-600">منتشر شده</label>
          </div>
        </div>

        <button type="submit" disabled={saving} className="admin-btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={16} />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Test admin page**

Run: `npm run dev`
Navigate to: `http://localhost:3000/admin/principal`
Expected: Form displays with all fields visible and styled

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/principal/page.tsx
git commit -m "feat: add principal profile admin page"
```

---

### Task 7: Update Admin Sidebar

**Covers:** S8

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

**Interfaces:**
- Produces: Navigation links to `/admin/school` and `/admin/principal`

- [ ] **Step 1: Add sidebar links**

Add to `adminLinks` array in `src/components/admin/AdminSidebar.tsx`:

```typescript
{ href: "/admin/school", label: "درباره مدرسه", icon: AcademicCap },
{ href: "/admin/principal", label: "مدیر مدرسه", icon: User },
```

Make sure to import `AcademicCap` and `User` from `@/components/icons`.

- [ ] **Step 2: Test sidebar navigation**

Run: `npm run dev`
Navigate to: `http://localhost:3000/admin`
Expected: New links appear in sidebar

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/AdminSidebar.tsx
git commit -m "feat: add school and principal links to admin sidebar"
```

---

### Task 8: Update Public About Page

**Covers:** S6

**Files:**
- Modify: `src/app/(public)/about/page.tsx`

**Interfaces:**
- Consumes: `GET /api/school`, `GET /api/principal`
- Produces: Dynamic about page with school and principal information

- [ ] **Step 1: Update about page to fetch from database**

Update `src/app/(public)/about/page.tsx` to fetch SchoolProfile and PrincipalProfile from database and display dynamically.

- [ ] **Step 2: Test public page**

Run: `npm run dev`
Navigate to: `http://localhost:3000/about`
Expected: Page displays school and principal information from database

- [ ] **Step 3: Commit**

```bash
git add src/app/(public)/about/page.tsx
git commit -m "feat: make about page dynamic with database content"
```

---

### Task 9: Final Verification

**Covers:** All sections

- [ ] **Step 1: Run type checking**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 2: Run linting**

Run: `npm run lint`
Expected: No lint errors

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Final commit and push**

```bash
git add -A
git commit -m "feat: complete school introduction and principal profile modules"
git push origin main
```
