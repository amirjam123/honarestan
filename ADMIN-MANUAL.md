# Honarestan Hadi — Administrator Manual

## Complete Documentation for هنرستان هادی Website

---

# Part 1 — Website Overview

## What This Website Does

This is the official website for هنرستان هادی (Honarestan Hadi), an art school in Iran. The website serves two purposes:

1. **Public website** — showcases the school's teachers, courses, gallery, news, student works, and provides a support ticket system for visitors
2. **Admin panel** — allows administrators to manage all website content through a web-based interface

## Target Users

- **Public visitors** — students, parents, and prospective students browsing the school's offerings
- **Administrators** — school staff who manage content, respond to tickets, and maintain the website

## Architecture

| Component | Technology |
|-----------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma 7.8 |
| Authentication | JWT (httpOnly cookies) |
| Hosting | Vercel |
| Language | Persian (Farsi), RTL layout |

## Public Section

The public website has 9 pages: Home, About, Teachers, Gallery, Courses, News, News Detail, Contact/Tickets, and Student Works.

## Admin Section

The admin panel has 11 pages: Dashboard, Gallery, Teachers, Courses, Events, Pages, Principal, Templates, Messages, Backup, and Student Works. Access is via `/hadi-panel-x7k9/login`.

---

# Part 2 — Public Website Guide

## Home Page (`/`)

**Purpose:** Main landing page showcasing the school.

**Sections displayed (in order):**
1. **Hero banner** — dark background with school title and subtitle (configurable from admin settings)
2. **School introduction** — centered card showing the school overview text
3. **Principal welcome** — photo, name, position, and welcome message from the principal profile
4. **Teachers** — up to 4 teacher cards with photo, name, title, specialty, and bio
5. **Featured student works** — up to 4 featured works with image, title, student name, and description
6. **Latest news** — up to 3 news cards with image, title, excerpt, and date
7. **Gallery preview** — 6 gallery images in a grid
8. **Call-to-action** — dark banner with links to Contact and About pages

**User actions:**
- Click teacher cards (no link — display only)
- Click news cards → navigates to news detail page
- Click "مشاهده گالری کامل" → navigates to gallery
- Click "مشاهده همه اخبار" → navigates to news listing
- Click "تماس با ما" → navigates to contact page
- Click "درباره ما" → navigates to about page

**Empty states:** If no content exists for a section, a placeholder message is shown instead of an empty area.

---

## About Page (`/about`)

**Purpose:** Detailed information about the school.

**Sections displayed (conditionally — only if data exists):**
1. **Hero** — page title and subtitle
2. **Principal welcome** — photo, name, position, welcome message
3. **Overview** — general school introduction
4. **History** — school history text
5. **Educational goals** — school's educational objectives
6. **Departments** — list of academic departments
7. **Facilities** — description of school facilities
8. **Principal biography** — detailed bio with photo
9. **Teachers preview** — up to 3 teacher cards with link to full teachers page

**User actions:**
- Click "مشاهده همه اساتید" → navigates to teachers page

---

## Teachers Page (`/teachers`)

**Purpose:** Display all published teachers.

**Layout:** Responsive grid (1 column on mobile, 2 on tablet, 3-4 on desktop).

**Each card shows:** Circular photo (or placeholder icon), name, title, specialty badge, and bio.

**User actions:** None (read-only display).

---

## Gallery Page (`/gallery`)

**Purpose:** Display all gallery images.

**Layout:** Responsive grid (1 column on mobile, 2 on tablet, 3-4 on desktop).

**Features:**
- Category filter pills displayed at top (currently display only — not functional)
- Each image card shows: image, category badge
- Click image → opens fullscreen modal viewer
- Modal: dark overlay, close button, Escape key support

**User actions:**
- Click image to view fullscreen
- Click X or press Escape to close modal

---

## Courses Page (`/courses`)

**Purpose:** Display all published courses.

**Layout:** Responsive grid (1 column on mobile, 2-3 on desktop).

**Each card shows:** Title, description, duration badge, and level badge.

**Level labels:**
| Level | Persian Label | Color |
|-------|--------------|-------|
| beginner | مبتدی | Green |
| intermediate | متوسط | Amber |
| advanced | پیشرفته | Red |

**User actions:**
- Click "تماس با ما" at bottom → navigates to contact page

---

## News Listing Page (`/news`)

**Purpose:** Display all published news articles.

**Layout:** Responsive grid (1 column on mobile, 2-3 on desktop).

**Each card shows:** Image (16:10 ratio), date with calendar icon, title, excerpt, and "ادامه مطلب" link.

**User actions:**
- Click any card → navigates to news detail page

---

## News Detail Page (`/news/[slug]`)

**Purpose:** Display a single news article.

**Display:** Back link, article image (if exists), date, title, and full content.

**User actions:**
- Click "بازگشت به اخبار" → navigates back to news listing

**Error handling:** If the news article doesn't exist or is unpublished, a 404 page is shown.

---

## Contact / Ticket Page (`/contact`)

**Purpose:** Full support ticket system for visitors.

**Layout:** Two-column on desktop — left sidebar with contact info and navigation, right main content area.

**Features:**

### Submit New Ticket
Form fields:
- نام و نام خانوادگی (name) — required
- ایمیل (email) — required, must be valid email format
- شماره تلفن (phone) — optional
- موضوع (subject) — required
- پیام شما (message) — required

After submission:
- Success → shows "تیکت با موفقیت ارسال شد"
- Duplicate → shows "تیکت فعال موجود است" with option to continue existing ticket or create new one
- Error → shows "خطا در ارسال"

### View Ticket List
- Click "تیکت‌های من" in sidebar → loads all tickets for your email
- Each ticket shows: subject, status badge, last message preview, date

### View Ticket Detail
- Click a ticket → shows full conversation thread
- Messages are styled differently for user (gray) and admin (blue)

### Reply to Ticket
- Textarea + send button at bottom of ticket detail
- Disabled if ticket is closed

### Hide Ticket
- "حذف از لیست" button → hides ticket from your list (does not delete it)

**Ticket statuses:**
| Status | Persian Label | Color |
|--------|--------------|-------|
| open | در انتظار پاسخ | Amber |
| answered | پاسخ داده شده | Green |
| closed | بسته شده | Gray |

**Persistence:** Your name and email are saved in browser localStorage for convenience on return visits.

---

## Student Works Page (`/student-works`)

**Purpose:** Display published student artworks.

**Layout:** Responsive grid (1 column on mobile, 2-4 on desktop).

**Features:**
- Category filter pills at top (display only — not functional)
- Each card shows: image, "برتر" badge for featured works, title, student name, category, year, description

**Category labels:**
| Code | Persian Label |
|------|--------------|
| general | عمومی |
| painting | نقاشی |
| sculpture | مجسمه‌سازی |
| calligraphy | خوشنویسی |
| photography | عکاسی |
| digital | دیجیتال آرت |
| graphic | گرافیک |

---

# Part 3 — Admin Panel Guide

## Accessing the Admin Panel

1. Navigate to `/hadi-panel-x7k9/login`
2. Enter username and password
3. Click "ورود"
4. You will be redirected to the dashboard

**Default credentials:** Username: `honarestan`, Password: `@hadiplmmlp`

**Important:** Change the default password immediately after first login.

---

## Admin Dashboard (`/hadi-panel-x7k9`)

**Purpose:** Overview of all content with quick access links.

**Stats displayed (5 cards):**
| Stat | Shows | Links to |
|------|-------|----------|
| اخبار | Total news count | News management |
| تصاویر گالری | Total gallery images | Gallery management |
| اساتید | Total teachers | Teachers management |
| آثار هنرجویان | Total student works | Student works management |
| رویدادها | Total events | Events management |

**Quick guide section:** Links to news, gallery, teachers, student works, events, pages, and settings with descriptions.

---

## Admin News Management (`/hadi-panel-x7k9/news`)

**Purpose:** Create, edit, and delete news articles.

**List view:** Each item shows title, published status badge, excerpt, and edit/delete buttons.

### Create News
1. Click "خبر جدید" button
2. Fill in the form:
   - عنوان خبر (title) — required
   - خلاصه (excerpt) — optional
   - متن کامل خبر (full content) — required
   - آدرس تصویر (image URL) — optional
   - منتشر شده (published) — checkbox
3. Click "ایجاد خبر"

### Edit News
1. Click the pencil icon on any news item
2. Form populates with existing data
3. Modify fields
4. Click "ذخیره تغییرات"

### Delete News
1. Click the trash icon on any news item
2. Confirm the deletion dialog
3. Item is permanently deleted

### Excel Import
- Use the ExcelImport component at the top of the page
- Upload .xlsx or .xls file with columns: عنوان, خلاصه, متن, اسلاگ, تصویر
- Required fields: عنوان, متن

---

## Admin Gallery Management (`/hadi-panel-x7k9/gallery`)

**Purpose:** Manage gallery images.

### Add Image
1. Click "تصویر جدید"
2. Fill in:
   - عنوان (title) — required
   - توضیحات (description) — optional
   - Upload image file OR enter URL
   - دسته‌بندی (category) — select from dropdown
3. Click "ایجاد تصویر"

### Edit Image
1. Click pencil icon
2. Modify fields
3. Click "ذخیره تغییرات"

### Delete Image
1. Click trash icon
2. Confirm deletion

**Categories:** عمومی, نقاشی, مجسمه‌سازی, خوشنویسی, عکاسی, دیجیتال آرت

---

## Admin Teachers Management (`/hadi-panel-x7k9/teachers`)

**Purpose:** Manage teacher profiles.

### Add Teacher
1. Click "استاد جدید"
2. Fill in:
   - نام (name) — required
   - عنوان (title) — required
   - تخصص (specialty) — optional
   - بیوگرافی (bio) — optional
   - Upload image OR enter URL
   - ترتیب نمایش (sort order) — number, default 0
   - نمایش در سایت (published) — checkbox, default checked
3. Click "ایجاد استاد"

### Edit Teacher
1. Click pencil icon
2. Modify fields
3. Click "ذخیره تغییرات"

### Delete Teacher
1. Click trash icon
2. Confirm deletion

### Excel Import
- Upload .xlsx/.xls with columns: نام, عنوان, تخصص, بیوگرافی, تصویر, ترتیب
- Required: نام, عنوان

---

## Admin Courses Management (`/hadi-panel-x7k9/courses`)

**Purpose:** Manage course listings.

### Add Course
1. Click "دوره جدید"
2. Fill in:
   - عنوان (title) — required
   - توضیحات (description) — required
   - مدت زمان (duration) — e.g., "۲ سال"
   - سطح (level) — مبتدی / متوسط / پیشرفته
   - ترتیب نمایش (sort order) — number
   - آدرس تصویر (image URL) — text only, no file upload
   - نمایش در سایت (published) — checkbox
3. Click "ایجاد دوره"

### Edit / Delete
Same pattern as teachers.

### Excel Import
- Upload .xlsx/.xls with columns: عنوان, توضیحات, مدت, سطح, تصویر, ترتیب
- Required: عنوان, توضیحات

---

## Admin Events Management (`/hadi-panel-x7k9/events`)

**Purpose:** Manage school events.

### Add Event
1. Click "رویداد جدید"
2. Fill in:
   - عنوان (title) — required
   - توضیحات (description) — required
   - تاریخ (date) — date picker, required
   - مکان (location) — optional
   - آدرس تصویر (image URL) — text only
   - منتشر شده (published) — checkbox, default unchecked
3. Click "ایجاد رویداد"

### Edit / Delete
Same pattern as other modules.

---

## Admin Pages Management (`/hadi-panel-x7k9/pages`)

**Purpose:** Edit static page content using Markdown.

**Available pages:** Currently only "درباره ما" (About page).

### Edit Page Content
1. Click the page tab (e.g., "درباره ما")
2. Edit the title and content in the Markdown editor
3. Click "ذخیره"

**Markdown supported:** `## heading`, `### subheading`, `- list item`, and plain paragraphs.

---

## Admin School Profile (`/hadi-panel-x7k9/school`)

**Purpose:** Manage the school's profile information displayed on the About page.

**Fields:**
| Field | Description |
|-------|------------|
| معرفی کلی | General overview |
| تاریخچه | School history |
| اهداف آموزشی | Educational goals |
| بخش‌ها و گروه‌ها | Departments |
| امکانات | Facilities |
| آمار (JSON) | Statistics in JSON format |
| اطلاعات تکمیلی | Additional info |
| منتشر شده | Published checkbox |

**Important:** The "آمار" field must be valid JSON. Example:
```json
{"تعداد دانش‌آموزان": 500, "تعداد کادر": 30}
```

---

## Admin Principal Profile (`/hadi-panel-x7k9/principal`)

**Purpose:** Manage the principal's profile.

**Fields:**
| Field | Description |
|-------|------------|
| نام | Name |
| آدرس تصویر | Photo URL |
| سمت | Position |
| بیوگرافی | Biography |
| پیام خوش‌آمدگویی | Welcome message |
| رزومه | Resume |
| دستاوردها | Achievements (must be JSON array) |
| اطلاعات تماس | Contact info |
| منتشر شده | Published checkbox |

**Important:** The "دستاوردها" field must be a valid JSON array. Example:
```json
["کسب مقام اول جشنواره", "انتشار ۵ کتاب"]
```

---

## Admin Templates (`/hadi-panel-x7k9/templates`)

**Purpose:** Download Excel templates for bulk data import.

**Available templates:**
| Template | Fields | Required |
|----------|--------|----------|
| اساتید | نام, عنوان, تخصص, بیوگرافی, تصویر, ترتیب | نام, عنوان |
| دوره‌ها | عنوان, توضیحات, مدت, سطح, تصویر, ترتیب | عنوان, توضیحات |
| اخبار | عنوان, خلاصه, متن, اسلاگ, تصویر | عنوان, متن |
| رویدادها | عنوان, توضیحات, تاریخ, مکان, تصویر | عنوان, توضیحات, تاریخ |
| گالری | عنوان, توضیحات, تصویر, دسته‌بندی | عنوان, تصویر |
| آثار هنرجویان | عنوان, نام هنرجو, توضیحات, تصویر, دسته‌بندی, سال | عنوان, نام هنرجو, تصویر |

**How to use:**
1. Download the template file
2. Fill in your data (rows 2-4 contain metadata/examples)
3. Go to the corresponding admin page (teachers, courses, or news)
4. Use the Excel import feature to upload the file

---

## Admin Messages (`/hadi-panel-x7k9/messages`)

**Purpose:** View contact form submissions.

**Layout:** Two-panel — message list on left, message detail on right.

**Features:**
- Unread messages have a blue dot indicator
- Click a message to view its full content
- Shows: sender name, email, phone, date, subject, message body

**Note:** This page is read-only. There is no reply, delete, or mark-as-read functionality in the admin UI.

---

## Admin Backup (`/hadi-panel-x7k9/backup`)

**Purpose:** Create and view database backups.

**Create backup:** Click "ایجاد بکاپ جدید" button. The backup includes database content, uploaded images, and site settings.

**View backups:** List shows timestamp, database status, and uploads status.

**Restore:** Use CLI commands:
```bash
./scripts/restore.sh
./scripts/restore.sh 20260720_123456  # specific backup
```

**Note:** On Vercel, backups are managed through the Neon database dashboard, not this page.

---

## Admin Student Works (`/hadi-panel-x7k9/student-works`)

**Purpose:** Manage student artwork submissions.

### Add Student Work
1. Click "اثر جدید"
2. Fill in:
   - عنوان (title) — required
   - نام هنرجو (student name) — required
   - توضیحات (description) — optional
   - Upload image OR enter URL
   - دسته‌بندی (category) — select from 7 options
   - سال (year) — e.g., "۱۴۰۳"
   - اثر برتر (featured) — checkbox
   - نمایش در سایت (published) — checkbox
3. Click "ایجاد اثر"

### Edit / Delete
Same pattern as other modules.

---

# Part 4 — Complete CRUD Guide

## Teachers

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Teachers page → "استاد جدید" | POST `/api/teachers` | name + title required |
| Read | Public `/teachers` page | GET `/api/teachers` | Only published teachers shown publicly |
| Update | Teachers page → pencil icon | PUT `/api/teachers/{id}` | |
| Delete | Teachers page → trash icon | DELETE `/api/teachers/{id}` | Confirmation required |

## Courses

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Courses page → "دوره جدید" | POST `/api/courses` | title + description required |
| Read | Public `/courses` page | GET `/api/courses` | Only published courses shown |
| Update | Courses page → pencil icon | PUT `/api/courses/{id}` | |
| Delete | Courses page → trash icon | DELETE `/api/courses/{id}` | Confirmation required |

## News

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | News page → "خبر جدید" | POST `/api/news` | title + content required, slug auto-generated |
| Read | Public `/news` page | GET `/api/news` | Only published news shown |
| Update | News page → pencil icon | PUT `/api/news/{id}` | |
| Delete | News page → trash icon | DELETE `/api/news/{id}` | Confirmation required |

## Gallery

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Gallery page → "تصویر جدید" | POST `/api/gallery` | title required |
| Read | Public `/gallery` page | GET `/api/gallery` | All items shown |
| Update | Gallery page → pencil icon | PUT `/api/gallery/{id}` | |
| Delete | Gallery page → trash icon | DELETE `/api/gallery/{id}` | Confirmation required |

## Student Works

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Student Works page → "اثر جدید" | POST `/api/student-works` | title + studentName required |
| Read | Public `/student-works` page | GET `/api/student-works` | Only published works shown |
| Update | Student Works page → pencil icon | PUT `/api/student-works/{id}` | |
| Delete | Student Works page → trash icon | DELETE `/api/student-works/{id}` | Confirmation required |

## Events

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Events page → "رویداد جدید" | POST `/api/events` | title + description + date required |
| Read | Admin only (no public page) | GET `/api/events` | |
| Update | Events page → pencil icon | PUT `/api/events/{id}` | |
| Delete | Events page → trash icon | DELETE `/api/events/{id}` | Confirmation required |

## Pages

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Pages page → select tab | POST `/api/pages` | Upserts by slug |
| Read | Public page by slug | GET `/api/pages/{slug}` | |
| Update | Pages page → edit content | POST `/api/pages` | Same endpoint as create |
| Delete | Not available | — | Pages cannot be deleted from admin |

## School Profile

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Auto-created on first save | PUT `/api/school` | Singleton pattern |
| Read | Public `/about` page | GET `/api/school` | |
| Update | School page → "ذخیره تغییرات" | PUT `/api/school` | |
| Delete | Not available | — | Cannot be deleted |

## Principal Profile

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Auto-created on first save | PUT `/api/principal` | Singleton pattern |
| Read | Public `/about` and home pages | GET `/api/principal` | |
| Update | Principal page → "ذخیره تغییرات" | PUT `/api/principal` | |
| Delete | Not available | — | Cannot be deleted |

## Settings

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Read | Used by public pages | GET `/api/settings` | Cached 60s at edge |
| Update | Settings page → "ذخیره تنظیمات" | PUT `/api/settings` | Key-value pairs |

## Contact Messages

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Public `/contact` form | POST `/api/contact` | Rate limited: 5/hour |
| Read | Messages admin page | GET `/api/contact` | |
| Update | Not available | — | Cannot mark as read |
| Delete | Not available | — | Cannot delete |

## Tickets

| Operation | Admin Page | API Endpoint | Notes |
|-----------|-----------|--------------|-------|
| Create | Public `/contact` page | POST `/api/tickets` | |
| Read | Public ticket list | GET `/api/tickets?email=...` | |
| Read (admin) | Admin tickets page | GET `/api/admin/tickets` | |
| Update status | Admin tickets page | PATCH `/api/admin/tickets/{id}` | close/reopen |
| Reply (admin) | Admin tickets page | POST `/api/admin/tickets/{id}/messages` | |
| Reply (user) | Public ticket detail | POST `/api/tickets/{id}/messages` | |

---

# Part 5 — Daily Administration Workflow

## Recommended Daily Routine

### 1. Login
- Go to `/hadi-panel-x7k9/login`
- Enter credentials
- Click "ورود"

### 2. Review Dashboard
- Check content counts for any unexpected changes
- Use quick links to navigate to sections needing attention

### 3. Check Messages
- Go to Messages page
- Review any new contact form submissions
- Note: messages cannot be marked as read in the UI

### 4. Review Tickets
- Go to Tickets page
- Filter by status: "باز" (open) tickets need attention
- Click a ticket to view the conversation
- Type a reply and click "ارسال پاسخ"
- Close resolved tickets with "بستن تیکت"

### 5. Add News (if needed)
- Go to News page
- Click "خبر جدید"
- Fill in title, excerpt, and full content
- Add image URL if available
- Check "منتشر شده" to publish immediately
- Click "ایجاد خبر"

### 6. Update Content (if needed)
- Navigate to the relevant admin section
- Click the edit icon on the item
- Modify fields
- Click "ذخیره تغییرات"

### 7. Logout
- Navigate to the public site using "مشاهده سایت" link in the sidebar
- Or clear browser cookies

---

# Part 6 — Website Management

## Adding Content

### Adding a Teacher
1. Go to Teachers admin page
2. Click "استاد جدید"
3. Fill in name and title (required)
4. Upload a photo or enter a URL
5. Add specialty and bio
6. Set sort order (lower numbers appear first)
7. Ensure "نمایش در سایت" is checked
8. Click "ایجاد استاد"

### Adding a Course
1. Go to Courses admin page
2. Click "دوره جدید"
3. Fill in title and description (required)
4. Set duration (e.g., "۲ سال")
5. Select level (مبتدی/متوسط/پیشرفته)
6. Enter image URL if available
7. Click "ایجاد دوره"

### Adding Gallery Images
1. Go to Gallery admin page
2. Click "تصویر جدید"
3. Fill in title (required)
4. Upload image file or enter URL
5. Select category
6. Click "ایجاد تصویر"

### Adding Student Works
1. Go to Student Works admin page
2. Click "اثر جدید"
3. Fill in title and student name (required)
4. Upload image or enter URL
5. Select category and enter year
6. Check "اثر برتر" to feature on homepage
7. Click "ایجاد اثر"

## Publishing Updates

- Each content type has a "منتشر شده" (published) checkbox
- Unpublished items are only visible in the admin panel
- Published items appear on the public website immediately

## Managing Uploaded Files

- Files are uploaded via the `/api/upload` endpoint
- Supported formats: PNG, JPG, SVG, GIF
- Maximum file size: 10 MB
- Files are validated by MIME type and magic bytes
- After upload, the file URL is returned and can be used in content

## Importing Excel Data

1. Go to Templates page
2. Download the appropriate template
3. Fill in your data (keep the header row)
4. Go to the corresponding admin page (Teachers, Courses, or News)
5. Use the Excel import section at the top
6. Drag and drop or select your file
7. Review the import results (imported count, duplicates, errors)

## Handling Mistakes

- **Accidental deletion:** Cannot be undone. There is no trash/recycle bin.
- **Wrong content:** Edit the item to correct it.
- **Unpublished by mistake:** Edit the item and check the published checkbox.
- **Broken image URL:** Edit the item and enter a valid URL or re-upload.

---

# Part 7 — Deployment Guide

## How Deployment Works

The project is deployed on Vercel. When code is pushed to the connected GitHub repository, Vercel automatically:

1. Installs dependencies
2. Runs `prisma generate` (generates the database client)
3. Runs `prisma migrate deploy` (applies any pending database migrations)
4. Runs `next build` (builds the Next.js application)
5. Deploys the new version

## How Vercel Is Connected

- The project is linked to a GitHub repository
- Vercel watches the repository for changes
- Each push triggers a new deployment
- Failed builds do not affect the live site (previous deployment remains active)

## How Neon Is Connected

- The PostgreSQL database is hosted on Neon (serverless PostgreSQL)
- Connection string is stored in the `DATABASE_URL` environment variable on Vercel
- The database exists independently of Vercel deployments

## What Happens During Deployment

| Action | Effect on Data |
|--------|---------------|
| Code update | No effect — data is in the database, not in code |
| Database migration | Adds/modifies tables — existing data preserved |
| Vercel redeployment | No effect — database is external |
| Build failure | No effect — previous deployment stays active |

## What Data Is Preserved

- All database records (news, teachers, gallery, settings, etc.)
- All uploaded files (if stored externally)
- All environment variables

## What Is Not Affected

- User-created content
- Admin settings
- Contact messages
- Tickets
- School profile and principal profile

---

# Part 8 — Database Guide

## All Database Tables

### News
**Purpose:** Blog/news articles
**Admin page:** News management
**Public page:** `/news` listing and `/news/[slug]` detail
**Fields:** id, title, slug (unique), content, excerpt, image, published, createdAt, updatedAt

### Gallery
**Purpose:** Image gallery
**Admin page:** Gallery management
**Public page:** `/gallery`
**Fields:** id, title, description, image, category, createdAt, updatedAt

### Teacher
**Purpose:** Teacher profiles
**Admin page:** Teachers management
**Public page:** `/teachers` and homepage preview
**Fields:** id, name, title, bio, image, specialty, sortOrder, published, createdAt, updatedAt

### Course
**Purpose:** Course listings
**Admin page:** Courses management
**Public page:** `/courses`
**Fields:** id, title, description, image, duration, level, sortOrder, published, createdAt, updatedAt

### StudentWork
**Purpose:** Student artwork showcase
**Admin page:** Student Works management
**Public page:** `/student-works` and homepage featured section
**Fields:** id, title, studentName, description, image, category, year, featured, published, createdAt, updatedAt

### Event
**Purpose:** School events
**Admin page:** Events management
**Public page:** None (admin only)
**Fields:** id, title, description, image, date, location, published, createdAt, updatedAt

### Page
**Purpose:** CMS-style static pages
**Admin page:** Pages management
**Public page:** Rendered by slug (e.g., `/about` reads slug "about")
**Fields:** id, slug (unique), title, content, updatedAt

### SiteSetting
**Purpose:** Key-value site configuration
**Admin page:** Settings management
**Public page:** Used by header, footer, hero, contact page
**Fields:** id, key (unique), value

### SchoolProfile
**Purpose:** School overview and detailed information
**Admin page:** School profile management
**Public page:** `/about` page and homepage introduction section
**Fields:** id, overview, history, vision, mission, educationalGoals, departments, facilities, statistics, galleryImages, additionalInfo, published, createdAt, updatedAt
**Note:** Singleton pattern — only one record exists

### PrincipalProfile
**Purpose:** Principal's profile and welcome message
**Admin page:** Principal profile management
**Public page:** `/about` page and homepage welcome section
**Fields:** id, name, photo, position, biography, welcomeMessage, resume, achievements, contactInfo, published, createdAt, updatedAt
**Note:** Singleton pattern — only one record exists

### ContactMessage
**Purpose:** Contact form submissions
**Admin page:** Messages page
**Public page:** None (admin only)
**Fields:** id, name, email, phone, subject, message, read, createdAt

### Ticket
**Purpose:** Support tickets
**Admin page:** Tickets page
**Public page:** `/contact` ticket system
**Fields:** id, subject, userName, userEmail, userPhone, status, hiddenFromUser, createdAt, updatedAt

### TicketMessage
**Purpose:** Individual messages within a ticket
**Admin page:** Tickets page (conversation view)
**Public page:** `/contact` ticket detail
**Fields:** id, ticketId, message, senderType, senderName, createdAt
**Relationship:** Cascade deletes when parent Ticket is deleted

### AdminUser
**Purpose:** Administrator accounts
**Admin page:** Login page
**Public page:** None
**Fields:** id, username (unique), passwordHash, createdAt

### SecurityLog
**Purpose:** Security event audit trail
**Admin page:** Not directly viewable (API only)
**Public page:** None
**Fields:** id, event, ip, username, details, path, createdAt

### LoginAttempt
**Purpose:** Login attempt tracking
**Admin page:** Not directly viewable (API only)
**Public page:** None
**Fields:** id, ip, username, success, createdAt

---

# Part 9 — Authentication Guide

## Login Process

1. User navigates to `/hadi-panel-x7k9/login`
2. Enters username and password
3. Client sends POST to `/api/auth`
4. Server validates credentials against `AdminUser` table
5. Password is verified using bcrypt (12 rounds)
6. On success: JWT token is generated and set as httpOnly cookie
7. On failure: error message is returned (generic — no username enumeration)

## Session Management

- JWT token is stored in an httpOnly cookie named `admin_token`
- Token expiry: 8 hours
- Cookie settings: httpOnly, secure (in production), sameSite: strict
- The admin layout checks authentication on every page load via `/api/auth/me`

## Cookies

| Cookie | Settings | Purpose |
|--------|----------|---------|
| `admin_token` | httpOnly, secure, sameSite: strict, maxAge: 28800 | JWT authentication token |

## Logout

- Navigate to the public site (cookie remains until expiry)
- Or clear browser cookies manually
- There is no explicit logout button in the admin UI

## Password Changes

- Go to the auth endpoint: POST `/api/auth/change-password`
- Requires current password and new password
- New password must meet strength requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit

## Rate Limiting

- Login attempts are rate limited: 5 attempts per 15-minute window
- After exceeding the limit, the IP is blocked for 30 minutes
- Rate limiting is in-memory (resets on server restart)

---

# Part 10 — Backup & Recovery

## How to Back Up the Database

### Via Neon Dashboard (Recommended for Production)
1. Log in to your Neon account at https://console.neon.tech
2. Select your project
3. Go to the "Backups" or "Branches" section
4. Create a backup or branch

### Via Admin Panel
1. Go to Backup page in admin panel
2. Click "ایجاد بکاپ جدید"
3. The backup includes database content, uploaded images, and site settings

**Note:** On Vercel, the admin panel backup feature may not work as expected because the backup scripts (`./scripts/backup.sh`, `./scripts/restore.sh`) are designed for local/server environments, not serverless.

## How to Restore

### From Neon Dashboard
1. Log in to Neon
2. Use the restore/branching feature to restore to a previous point

### From CLI (if backup scripts exist)
```bash
./scripts/restore.sh
./scripts/restore.sh 20260720_123456  # specific backup
```

## What Should Be Backed Up Regularly

| Data | Priority | Method |
|------|----------|--------|
| PostgreSQL database | High | Neon dashboard |
| Uploaded files | Medium | If stored externally (e.g., Cloudinary) |
| Environment variables | Medium | Vercel dashboard |
| Source code | High | Git repository |

## Recommended Backup Schedule

| Frequency | Action |
|-----------|--------|
| Daily | Automatic Neon point-in-time recovery (if enabled) |
| Weekly | Manual database export via Neon dashboard |
| Before deployment | Ensure database backup exists |
| After major content changes | Create a manual backup |

---

# Part 11 — Security Guide

## Security Mechanisms Implemented

| Mechanism | Description |
|-----------|------------|
| JWT authentication | httpOnly cookies, 8-hour expiry |
| Password hashing | bcrypt with 12 rounds |
| Rate limiting | 5 login attempts per 15 minutes |
| Input validation | XSS sanitization on contact forms |
| File upload validation | MIME type, magic bytes, size limit (10MB) |
| Security headers | HSTS, X-Frame-Options, X-Content-Type-Options |
| CSP | Content Security Policy (currently wide open — see note) |
| Security logging | Login attempts, admin actions logged |
| Cookie security | httpOnly, secure, sameSite: strict |

## Administrator Responsibilities

1. **Change the default password** immediately after first login
2. **Use a strong password** — at least 8 characters with mixed case, digits
3. **Do not share admin credentials**
4. **Review content before publishing** — check for typos, broken images
5. **Monitor tickets regularly** — respond to user inquiries promptly
6. **Back up the database** before making major changes

## Best Practices

- Use a unique, strong password for the admin account
- Log out by clearing browser cookies when using shared computers
- Do not paste untrusted HTML into page content or news articles
- Verify image URLs before publishing
- Test content changes on the public site after saving

## Common Mistakes to Avoid

- **Publishing unfinished content** — always uncheck "منتشر شده" until ready
- **Entering invalid JSON** in statistics or achievements fields
- **Uploading oversized images** — keep images under 2MB for fast loading
- **Leaving required fields empty** — the form will not submit
- **Using broken image URLs** — test URLs in a browser before saving

---

# Part 12 — Troubleshooting

## Common Problems

### Cannot Login
| Possible Cause | Solution |
|---------------|----------|
| Wrong credentials | Verify username and password |
| Rate limited | Wait 15 minutes and try again |
| Cookie blocked | Check browser cookie settings |
| JWT_SECRET missing | Contact developer — server misconfiguration |

### Changes Not Appearing on Website
| Possible Cause | Solution |
|---------------|----------|
| Content unpublished | Edit item and check "منتشر شده" |
| Browser cache | Hard refresh (Ctrl+Shift+R) |
| Edge cache | Wait 1-5 minutes for settings changes |
| Wrong page | Verify you're checking the correct URL |

### Image Not Displaying
| Possible Cause | Solution |
|---------------|----------|
| Invalid URL | Test the URL in a new browser tab |
| URL changed | Re-upload or enter a new URL |
| External source down | Use a different image host or upload directly |

### Excel Import Fails
| Possible Cause | Solution |
|---------------|----------|
| Wrong file format | Use .xlsx or .xls only |
| Missing required columns | Check template for required fields |
| Invalid data | Review error messages for specific rows |
| Duplicate entries | Duplicates are detected and skipped |

### Page Shows Error
| Possible Cause | Solution |
|---------------|----------|
| Database connection issue | Check Neon dashboard for database status |
| Invalid JSON in profile | Fix JSON format in school/principal profile |
| Server error | Check Vercel deployment logs |

### Ticket System Issues
| Possible Cause | Solution |
|---------------|----------|
| Cannot see tickets | Ensure you're using the same email as when creating |
| Cannot reply | Check if ticket is closed (closed tickets cannot receive replies) |
| Duplicate ticket detected | Use the existing ticket instead of creating a new one |

---

# Part 13 — Frequently Asked Questions

**Q: How do I change the school name on the website?**
A: Go to Settings admin page → edit "نام مدرسه" field → click "ذخیره تنظیمات". Changes may take 1-5 minutes to appear due to edge caching.

**Q: How do I change the hero banner text?**
A: Go to Settings admin page → edit "عنوان بنر اصلی" and "زیرعنوان بنر اصلی" → save.

**Q: How do I add a new admin user?**
A: There is no admin UI for managing users. This must be done directly in the database or by a developer.

**Q: Can I delete a contact message?**
A: No. The messages page is read-only. Messages cannot be deleted or marked as read from the admin panel.

**Q: How do I unpublish a teacher/course/news article?**
A: Edit the item → uncheck "منتشر شده" → save. The item will no longer appear on the public website.

**Q: How do I change the order of teachers?**
A: Edit each teacher → set "ترتیب نمایش" to a number (lower numbers appear first) → save.

**Q: How do I feature a student work on the homepage?**
A: Edit the student work → check "اثر برتر" → save. Featured works appear on the homepage.

**Q: How do I add a new page to the website?**
A: Currently only the "about" page is supported in the admin panel. Other pages would need developer assistance.

**Q: How do I change the admin password?**
A: Use the `/api/auth/change-password` endpoint (requires current password). There is no UI button for this.

**Q: How do I see who logged in?**
A: The security log API (`/api/admin/security-logs`) tracks login events, but there is no admin UI for viewing logs.

**Q: Can I schedule news articles for future publication?**
A: No. There is no scheduling feature. Articles are either published or unpublished.

**Q: How do I add video content?**
A: The system supports image URLs only. Videos would need to be hosted externally (e.g., YouTube) and linked in content.

**Q: What happens if I delete a teacher who is displayed on the homepage?**
A: The teacher will be removed from the homepage and the teachers page immediately. The homepage will show fewer teacher cards.

**Q: How do I change the contact information shown on the website?**
A: Go to Settings admin page → edit address, phone, and email fields → save.

---

# Part 14 — Hidden Features & Undocumented Functionality

## Features That Exist But Are Not Obvious

### 1. Excel Bulk Import
**Location:** Teachers, Courses, and News admin pages
**How to use:** Look for the Excel import section at the top of each page. Download a template from the Templates page, fill it in, and upload.

### 2. Ticket System (Full Conversation System)
**Location:** Public `/contact` page
**Not just a contact form** — it's a full ticket/conversation system where users can:
- Create tickets
- View their ticket history
- Reply to admin responses
- Hide tickets from their list

### 3. Duplicate Ticket Detection
**Location:** Contact page ticket submission
**How it works:** If you submit a ticket with the same email that has an existing open ticket, the system warns you and offers to continue the existing conversation instead of creating a duplicate.

### 4. Markdown Support in About Page
**Location:** Pages admin → "درباره ما"
**Supported syntax:** `## heading`, `### subheading`, `- list item`, and plain paragraphs.

### 5. Featured Student Works
**Location:** Student Works admin
**How to use:** Check "اثر برتر" when creating/editing a student work. Featured works appear in a special section on the homepage.

### 6. Sort Order Control
**Location:** Teachers and Courses admin
**How to use:** Set "ترتیب نمایش" to a number. Lower numbers appear first. Default is 0.

### 7. Category System
**Location:** Gallery and Student Works
**Categories:** عمومی, نقاشی, مجسمه‌سازی, خوشنویسی, عکاسی, دیجیتال آرت, گرافیک
**Note:** Category filtering on public pages is not yet functional — categories are displayed but not interactive.

### 8. localStorage Persistence
**Location:** Contact page
**How it works:** Your name and email are automatically saved in the browser and pre-filled on return visits.

### 9. Security Event Logging
**Location:** All authenticated API endpoints
**What is logged:** login_success, login_failed, logout, password_change, admin_action, unauthorized_access, file_upload, record_create, record_update, record_delete

### 10. Skip-to-Content Link
**Location:** All public pages
**How it works:** Press Tab on page load to reveal a "رفتن به محتوای اصلی" accessibility link that skips the header navigation.

---

# Part 15 — Improvement Suggestions

## High Priority

1. **Add authentication to `/api/school` PUT and `/api/principal` PUT** — these endpoints currently allow anyone to modify the school and principal profiles
2. **Add input validation to all write endpoints** — most POST/PUT endpoints accept unvalidated input
3. **Add a logout button** to the admin panel
4. **Add mark-as-read functionality** to the messages page
5. **Add delete functionality** to the messages page
6. **Implement category filtering** on gallery and student works public pages

## Medium Priority

7. **Add pagination** to all listing pages (news, gallery, teachers, courses, student works, events)
8. **Add image upload** to courses and events (currently URL-only)
9. **Add a password change UI** in the admin panel
10. **Add a user management page** for creating/editing admin users
11. **Add content scheduling** for news articles (publish at a future date)
12. **Add image optimization** for uploaded files

## Low Priority

13. **Add a search feature** in the admin panel
14. **Add bulk actions** (select multiple items for delete/publish/unpublish)
15. **Add content preview** before publishing
16. **Add activity log viewer** in the admin UI
17. **Add email notifications** for new tickets
18. **Add rich text editor** instead of plain textarea for content editing
