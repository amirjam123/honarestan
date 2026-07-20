# Homepage Redesign & Excel Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign homepage to prioritize School & Principal Introduction, remove hardcoded stats, and add intelligent Excel import

**Architecture:** Modify homepage to fetch SchoolProfile and PrincipalProfile from database, add xlsx library for Excel parsing, create import API endpoints

**Tech Stack:** Next.js 16, Prisma 7.8, SQLite, Tailwind CSS v4, TypeScript, xlsx

## Global Constraints

- All content in Persian (Farsi), RTL layout
- No hardcoded editable content — everything via database
- Follow existing codebase patterns
- Use `export const dynamic = "force-dynamic"` for database-backed pages

---

## File Structure

### Modified Files
- `src/app/(public)/page.tsx` — Homepage redesign
- `package.json` — Add xlsx dependency

### New Files
- `src/app/api/import/[model]/route.ts` — Excel import API
- `src/components/admin/ExcelImport.tsx` — Import UI component

---

### Task 1: Remove Hardcoded Stats from Homepage

**Covers:** S3

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Produces: Cleaner homepage without hardcoded stats

- [ ] **Step 1: Remove hardcoded stats**

In `src/app/(public)/page.tsx`, remove these two entries from the stats array:

```typescript
// REMOVE these two:
{ label: "سال تجربه", value: "۱۵+", icon: Award, color: "text-amber-600 bg-amber-50" },
{ label: "هنرجوی فارغ‌التحصیل", value: "۵۰۰+", icon: AcademicCap, color: "text-primary-600 bg-primary-50" },
```

Keep these two:
```typescript
{ label: "دوره آموزشی", value: String(courses.length || "۱۰+"), icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
{ label: "استاد مجرب", value: String(teachers.length || "۸+"), icon: UserGroup, color: "text-violet-600 bg-violet-50" },
```

Also update the grid from `grid-cols-2 md:grid-cols-4` to `grid-cols-2`.

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/app/\(public\)/page.tsx
git commit -m "fix: remove hardcoded stats from homepage"
```

---

### Task 2: Add School & Principal Sections to Homepage

**Covers:** S3

**Files:**
- Modify: `src/app/(public)/page.tsx`

**Interfaces:**
- Consumes: `SchoolProfile` and `PrincipalProfile` from Prisma
- Produces: Dynamic sections on homepage

- [ ] **Step 1: Add database queries**

Add to the Promise.all in `page.tsx`:

```typescript
const [news, galleryItems, settings, teachers, courses, studentWorks, schoolProfile, principalProfile] = await Promise.all([
  // ... existing queries ...
  prisma.schoolProfile.findFirst({ where: { published: true } }),
  prisma.principalProfile.findFirst({ where: { published: true } }),
]);
```

- [ ] **Step 2: Add School Introduction section**

After the Hero component, add:

```typescript
{/* School Introduction */}
{schoolProfile && (
  <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium mb-4">
        <AcademicCap size={14} />
        <span>درباره ما</span>
      </div>
      <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">معرفی هنرستان</h2>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-sm text-slate-800 mb-3">overview</h3>
        <p className="text-slate-600 text-sm leading-7">{schoolProfile.overview}</p>
      </div>
      {schoolProfile.vision && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-bold text-sm text-slate-800 mb-3">vision</h3>
          <p className="text-slate-600 text-sm leading-7">{schoolProfile.vision}</p>
        </div>
      )}
    </div>
  </section>
)}
```

- [ ] **Step 3: Add Principal Welcome section**

After School Introduction, add:

```typescript
{/* Principal Welcome */}
{principalProfile && (
  <section className="bg-slate-50 py-16 lg:py-24">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium mb-4">
          <UserGroup size={14} />
          <span>مدیر مدرسه</span>
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">پیام مدیر</h2>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-3xl mx-auto">
        <div className="flex items-start gap-6">
          {principalProfile.photo && (
            <img src={principalProfile.photo} alt={principalProfile.name} className="w-20 h-20 rounded-full object-cover" />
          )}
          <div>
            <p className="text-slate-600 text-sm leading-7 mb-4">{principalProfile.welcomeMessage}</p>
            <p className="font-bold text-sm text-slate-800">{principalProfile.name}</p>
            <p className="text-primary-600 text-xs">{principalProfile.position}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
)}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/page.tsx
git commit -m "feat: add school and principal sections to homepage"
```

---

### Task 3: Install xlsx Package

**Covers:** S4

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: xlsx package available for import

- [ ] **Step 1: Install xlsx**

Run: `npm install xlsx`

- [ ] **Step 2: Verify installation**

Run: `npm list xlsx`
Expected: xlsx version shown

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add xlsx package for Excel import"
```

---

### Task 4: Create Excel Import API

**Covers:** S4

**Files:**
- Create: `src/app/api/import/[model]/route.ts`

**Interfaces:**
- Produces: `POST /api/import/[model]` endpoint
- Accepts: FormData with file field
- Returns: Import summary JSON

- [ ] **Step 1: Create import API route**

Create `src/app/api/import/[model]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

// Column name mappings (Persian -> English field names)
const columnMappings: Record<string, Record<string, string>> = {
  teachers: {
    "نام": "name",
    "name": "name",
    "عنوان": "title",
    "title": "title",
    "بیوگرافی": "bio",
    "bio": "bio",
    "تصویر": "image",
    "image": "image",
    "تخصص": "specialty",
    "specialty": "specialty",
    "ترتیب": "sortOrder",
    "sortOrder": "sortOrder",
  },
  courses: {
    "عنوان": "title",
    "title": "title",
    "توضیحات": "description",
    "description": "description",
    "تصویر": "image",
    "image": "image",
    "مدت": "duration",
    "duration": "duration",
    "سطح": "level",
    "level": "level",
    "ترتیب": "sortOrder",
    "sortOrder": "sortOrder",
  },
  news: {
    "عنوان": "title",
    "title": "title",
    "متن": "content",
    "content": "content",
    "خلاصه": "excerpt",
    "excerpt": "excerpt",
    "تصویر": "image",
    "image": "image",
    "اسلاگ": "slug",
    "slug": "slug",
  },
};

// Required fields per model
const requiredFields: Record<string, string[]> = {
  teachers: ["name", "title"],
  courses: ["title", "description"],
  news: ["title", "content", "slug"],
};

// Unique fields for duplicate check
const uniqueFields: Record<string, string[]> = {
  teachers: ["name"],
  courses: ["title"],
  news: ["slug"],
};

function detectColumns(headers: string[], model: string): Record<number, string> {
  const mapping = columnMappings[model] || {};
  const result: Record<number, string> = {};
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.trim().toLowerCase();
    const fieldName = mapping[normalizedHeader] || mapping[header.trim()];
    if (fieldName) {
      result[index] = fieldName;
    }
  });
  
  return result;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    const { model } = await params;
    
    if (!["teachers", "courses", "news"].includes(model)) {
      return NextResponse.json({ error: "model not supported" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

    if (data.length < 2) {
      return NextResponse.json({ error: "file is empty or has no data rows" }, { status: 400 });
    }

    const headers = data[0] as string[];
    const columnMap = detectColumns(headers, model);
    const required = requiredFields[model] || [];
    const unique = uniqueFields[model] || [];
    
    const results = {
      total: data.length - 1,
      imported: 0,
      skipped: 0,
      errors: [] as { row: number; message: string }[],
    };

    const rowsToInsert: Record<string, unknown>[] = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const rowNum = i + 1;
      
      // Map columns
      const record: Record<string, unknown> = {};
      Object.entries(columnMap).forEach(([colIndex, fieldName]) => {
        const value = row[parseInt(colIndex)];
        if (value !== undefined && value !== null && value !== "") {
          record[fieldName] = String(value).trim();
        }
      });

      // Check required fields
      const missingFields = required.filter(f => !record[f]);
      if (missingFields.length > 0) {
        results.errors.push({
          row: rowNum,
          message: `missing required fields: ${missingFields.join(", ")}`,
        });
        continue;
      }

      // Generate slug for news
      if (model === "news" && !record.slug && record.title) {
        record.slug = generateSlug(record.title as string);
      }

      // Set defaults
      if (model === "teachers") {
        record.sortOrder = record.sortOrder ? parseInt(record.sortOrder as string) : 0;
        record.published = true;
      }
      if (model === "courses") {
        record.sortOrder = record.sortOrder ? parseInt(record.sortOrder as string) : 0;
        record.level = record.level || "beginner";
        record.published = true;
      }
      if (model === "news") {
        record.published = false;
      }

      rowsToInsert.push(record);
    }

    // Check duplicates and insert
    for (const record of rowsToInsert) {
      try {
        // Check for duplicates
        if (unique.length > 0) {
          const whereClause: Record<string, unknown> = {};
          unique.forEach(field => {
            whereClause[field] = record[field];
          });
          
          const existing = await (prisma as Record<string, unknown>)[model].findFirst({
            where: whereClause,
          });
          
          if (existing) {
            results.skipped++;
            continue;
          }
        }

        await (prisma as Record<string, unknown>)[model].create({
          data: record,
        });
        results.imported++;
      } catch (err) {
        results.errors.push({
          row: rowsToInsert.indexOf(record) + 2,
          message: `database error: ${(err as Error).message}`,
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "import failed" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test API**

Run: `npm run dev`
Create a test Excel file and test the endpoint

- [ ] **Step 3: Commit**

```bash
git add src/app/api/import/\[model\]/route.ts
git commit -m "feat: add Excel import API with intelligent column detection"
```

---

### Task 5: Create Excel Import UI Component

**Covers:** S4

**Files:**
- Create: `src/components/admin/ExcelImport.tsx`

**Interfaces:**
- Produces: Reusable import component
- Props: `model` (teachers/courses/news), `onImportComplete` callback

- [ ] **Step 1: Create import component**

Create `src/components/admin/ExcelImport.tsx`:

```typescript
"use client";

import { useState, useRef } from "react";
import { Upload, Loader, CheckCircle } from "@/components/icons";

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface ExcelImportProps {
  model: string;
  onImportComplete?: () => void;
}

export default function ExcelImport({ model, onImportComplete }: ExcelImportProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/import/${model}`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (onImportComplete) onImportComplete();
      } else {
        const data = await res.json();
        setError(data.error || "import failed");
      }
    } catch {
      setError("error connecting to server");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="admin-card">
      <h3 className="text-sm font-bold mb-4 text-slate-800">import from Excel</h3>
      
      <div className="flex items-center gap-3 mb-4">
        <label className={`admin-btn-secondary cursor-pointer flex items-center gap-2 ${importing ? "opacity-50" : ""}`}>
          <Upload size={16} />
          {importing ? "importing..." : "select file"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
        </label>
        <span className="text-xs text-slate-400">.xlsx or .xls</span>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs mb-4">{error}</div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg text-center">
              <p className="text-lg font-bold text-slate-900">{result.total}</p>
              <p className="text-[11px] text-slate-500">total</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-700">{result.imported}</p>
              <p className="text-[11px] text-emerald-600">imported</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-center">
              <p className="text-lg font-bold text-amber-700">{result.skipped}</p>
              <p className="text-[11px] text-amber-600">skipped</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <p className="text-lg font-bold text-red-700">{result.errors.length}</p>
              <p className="text-[11px] text-red-600">errors</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs font-medium text-red-700 mb-2">errors:</p>
              <ul className="space-y-1">
                {result.errors.slice(0, 10).map((err, i) => (
                  <li key={i} className="text-xs text-red-600">
                    row {err.row}: {err.message}
                  </li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-xs text-red-500">
                    and {result.errors.length - 10} more errors...
                  </li>
                )}
              </ul>
            </div>
          )}

          {result.imported > 0 && (
            <div className="flex items-center gap-2 text-emerald-600 text-xs">
              <CheckCircle size={14} />
              <span>{result.imported} records imported successfully</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/ExcelImport.tsx
git commit -m "feat: add Excel import UI component"
```

---

### Task 6: Add Import Button to Admin Pages

**Covers:** S4

**Files:**
- Modify: `src/app/admin/teachers/page.tsx`
- Modify: `src/app/admin/courses/page.tsx`
- Modify: `src/app/admin/news/page.tsx`

**Interfaces:**
- Consumes: `ExcelImport` component
- Produces: Import functionality in admin pages

- [ ] **Step 1: Add import to teachers page**

In `src/app/admin/teachers/page.tsx`, add import:

```typescript
import ExcelImport from "@/components/admin/ExcelImport";

// In the return JSX, add before the form:
<ExcelImport model="teachers" onImportComplete={fetchTeachers} />
```

- [ ] **Step 2: Add import to courses page**

In `src/app/admin/courses/page.tsx`, add import:

```typescript
import ExcelImport from "@/components/admin/ExcelImport";

// In the return JSX, add before the form:
<ExcelImport model="courses" onImportComplete={fetchCourses} />
```

- [ ] **Step 3: Add import to news page**

In `src/app/admin/news/page.tsx`, add import:

```typescript
import ExcelImport from "@/components/admin/ExcelImport";

// In the return JSX, add before the form:
<ExcelImport model="news" onImportComplete={fetchNews} />
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build passes

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/teachers/page.tsx src/app/admin/courses/page.tsx src/app/admin/news/page.tsx
git commit -m "feat: add Excel import to admin pages"
```

---

### Task 7: Final Verification

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
git commit -m "feat: complete homepage redesign and Excel import"
git push origin main
```
