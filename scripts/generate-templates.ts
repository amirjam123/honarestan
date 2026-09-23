import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

interface TemplateColumn {
  header: string;
  field: string;
  required: boolean;
  example?: string;
  description?: string;
}

const templates: Record<string, { name: string; description: string; columns: TemplateColumn[] }> = {
  teachers: {
    name: "اساتید",
    description: "قالب ورود اطلاعات اساتید",
    columns: [
      { header: "نام", field: "name", required: true, example: "استاد محمدی", description: "نام و نام خانوادگی" },
      { header: "عنوان", field: "title", required: true, example: "مدیر هنرستان", description: "سمت یا عنوان شغلی" },
      { header: "تخصص", field: "specialty", required: false, example: "نقاشی و طراحی", description: "زمینه تخصص" },
      { header: "بیوگرافی", field: "bio", required: false, example: "با بیش از ۲۰ سال تجربه", description: "معرفی کوتاه" },
      { header: "تصویر", field: "image", required: false, example: "https://example.com/photo.jpg", description: "آدرس تصویر" },
      { header: "ترتیب", field: "sortOrder", required: false, example: "1", description: "ترتیب نمایش (عدد)" },
    ],
  },
  courses: {
    name: "دوره‌ها",
    description: "قالب ورود دوره‌های آموزشی",
    columns: [
      { header: "عنوان", field: "title", required: true, example: "نقاشی و طراحی", description: "نام دوره" },
      { header: "توضیحات", field: "description", required: true, example: "آموزش تکنیک‌های نقاشی", description: "توضیحات دوره" },
      { header: "مدت", field: "duration", required: false, example: "۲ سال", description: "مدت زمان دوره" },
      { header: "سطح", field: "level", required: false, example: "beginner", description: "beginner/intermediate/advanced" },
      { header: "تصویر", field: "image", required: false, example: "https://example.com/course.jpg", description: "آدرس تصویر" },
      { header: "ترتیب", field: "sortOrder", required: false, example: "1", description: "ترتیب نمایش (عدد)" },
    ],
  },
  news: {
    name: "اخبار",
    description: "قالب ورود اخبار و اطلاعیه‌ها",
    columns: [
      { header: "عنوان", field: "title", required: true, example: "افتتاح نمایشگاه هنری", description: "تیتر خبر" },
      { header: "خلاصه", field: "excerpt", required: false, example: "خلاصه خبر", description: "خلاصه مطلب" },
      { header: "متن", field: "content", required: true, example: "متن کامل خبر...", description: "متن کامل خبر" },
      { header: "اسلاگ", field: "slug", required: false, example: "art-exhibition", description: "آدرس انگلیسی (خودکار)" },
      { header: "تصویر", field: "image", required: false, example: "https://example.com/news.jpg", description: "آدرس تصویر" },
    ],
  },
  events: {
    name: "رویدادها",
    description: "قالب ورود رویدادها",
    columns: [
      { header: "عنوان", field: "title", required: true, example: "نمایشگاه هنری", description: "نام رویداد" },
      { header: "توضیحات", field: "description", required: true, example: "توضیحات رویداد", description: "توضیحات کامل" },
      { header: "تاریخ", field: "date", required: true, example: "2026-08-01", description: "تاریخ (YYYY-MM-DD)" },
      { header: "مکان", field: "location", required: false, example: "تالار هنرستان", description: "مکان برگزاری" },
      { header: "تصویر", field: "image", required: false, example: "https://example.com/event.jpg", description: "آدرس تصویر" },
    ],
  },
  gallery: {
    name: "گالری",
    description: "قالب ورود تصاویر گالری",
    columns: [
      { header: "عنوان", field: "title", required: true, example: "اثر هنری ۱", description: "عنوان تصویر" },
      { header: "توضیحات", field: "description", required: false, example: "توضیحات تصویر", description: "توضیحات" },
      { header: "تصویر", field: "image", required: true, example: "https://example.com/image.jpg", description: "آدرس تصویر" },
      { header: "دسته‌بندی", field: "category", required: false, example: "painting", description: "دسته‌بندی" },
    ],
  },
  "student-works": {
    name: "آثار هنرجویان",
    description: "قالب ورود آثار هنرجویان",
    columns: [
      { header: "عنوان", field: "title", required: true, example: "اثر نقاشی", description: "عنوان اثر" },
      { header: "نام هنرجو", field: "studentName", required: true, example: "علی محمدی", description: "نام هنرجو" },
      { header: "توضیحات", field: "description", required: false, example: "توضیحات اثر", description: "توضیحات" },
      { header: "تصویر", field: "image", required: true, example: "https://example.com/work.jpg", description: "آدرس تصویر" },
      { header: "دسته‌بندی", field: "category", required: false, example: "painting", description: "دسته‌بندی" },
      { header: "سال", field: "year", required: false, example: "۱۴۰۳", description: "سال تحصیلی" },
    ],
  },
};

function createTemplate(moduleKey: string): Buffer {
  const template = templates[moduleKey];
  if (!template) throw new Error(`Template not found: ${moduleKey}`);

  const wb = XLSX.utils.book_new();

  // Create data sheet with headers and example row
  const headers = template.columns.map((col) => col.header);
  const exampleRow = template.columns.map((col) => col.example || "");
  const requiredRow = template.columns.map((col) => (col.required ? "الزامی" : "اختیاری"));
  const descriptionRow = template.columns.map((col) => col.description || "");

  const ws = XLSX.utils.aoa_to_sheet([
    headers,
    requiredRow,
    descriptionRow,
    exampleRow,
  ]);

  // Set column widths
  ws["!cols"] = template.columns.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, template.name);

  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

// Generate all templates
const templatesDir = path.join(process.cwd(), "public", "templates");
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

Object.keys(templates).forEach((key) => {
  const buffer = createTemplate(key);
  const filePath = path.join(templatesDir, `${key}-template.xlsx`);
  fs.writeFileSync(filePath, buffer);
  console.log(`Created: ${filePath}`);
});

console.log("All templates generated!");
