import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import * as XLSX from "xlsx";

type ModelName = "teachers" | "courses" | "news";

interface ColumnMapping {
  [header: string]: string;
}

const COLUMN_MAPPINGS: Record<ModelName, ColumnMapping> = {
  teachers: {
    نام: "name",
    name: "name",
    عنوان: "title",
    title: "title",
    بیوگرافی: "bio",
    bio: "bio",
    تصویر: "image",
    image: "image",
    تخصص: "specialty",
    specialty: "specialty",
    ترتیب: "sortOrder",
    "sort order": "sortOrder",
    sortOrder: "sortOrder",
  },
  courses: {
    عنوان: "title",
    title: "title",
    توضیحات: "description",
    description: "description",
    تصویر: "image",
    image: "image",
    مدت: "duration",
    duration: "duration",
    سطح: "level",
    level: "level",
    ترتیب: "sortOrder",
    "sort order": "sortOrder",
    sortOrder: "sortOrder",
  },
  news: {
    عنوان: "title",
    title: "title",
    متن: "content",
    content: "content",
    خلاصه: "excerpt",
    excerpt: "excerpt",
    تصویر: "image",
    image: "image",
    اسلاگ: "slug",
    slug: "slug",
  },
};

const REQUIRED_FIELDS: Record<ModelName, string[]> = {
  teachers: ["name", "title"],
  courses: ["title", "description"],
  news: ["title", "content", "slug"],
};

const DUPLICATE_FIELDS: Record<ModelName, string> = {
  teachers: "name",
  courses: "title",
  news: "slug",
};

function detectColumns(headers: string[], model: ModelName): Record<string, number> {
  const mapping = COLUMN_MAPPINGS[model];
  const detected: Record<string, number> = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.trim().toLowerCase();
    if (header && mapping[header]) {
      detected[mapping[header]] = i;
    }
  }

  return detected;
}

function parseRows(
  data: unknown[][],
  columnMap: Record<string, number>,
  model: ModelName
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = [];

  for (const row of data) {
    if (!row || row.length === 0) continue;

    const record: Record<string, unknown> = {};
    let hasData = false;

    for (const [field, colIndex] of Object.entries(columnMap)) {
      const value = row[colIndex];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        record[field] = String(value).trim();
        hasData = true;
      }
    }

    if (hasData) {
      if (model === "news" && record.title && !record.slug) {
        record.slug = slugify(record.title as string);
      }
      if (record.sortOrder) {
        record.sortOrder = parseInt(record.sortOrder as string, 10) || 0;
      }
      rows.push(record);
    }
  }

  return rows;
}

function validateRows(
  rows: Record<string, unknown>[],
  model: ModelName
): { valid: Record<string, unknown>[]; errors: { row: number; message: string }[] } {
  const required = REQUIRED_FIELDS[model];
  const valid: Record<string, unknown>[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const missing = required.filter((f) => !row[f] || String(row[f]).trim() === "");

    if (missing.length > 0) {
      errors.push({
        row: i + 2,
        message: `فیلدهای الزامی缺失: ${missing.join(", ")}`,
      });
    } else {
      valid.push(row);
    }
  }

  return { valid, errors };
}

async function checkDuplicates(
  rows: Record<string, unknown>[],
  model: ModelName
): Promise<{ unique: Record<string, unknown>[]; duplicates: { row: number; value: string }[] }> {
  const duplicateField = DUPLICATE_FIELDS[model];
  const unique: Record<string, unknown>[] = [];
  const duplicates: { row: number; value: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const value = row[duplicateField] as string;

    let exists = false;
    if (model === "teachers") {
      exists = !!(await prisma.teacher.findFirst({ where: { name: value } }));
    } else if (model === "courses") {
      exists = !!(await prisma.course.findFirst({ where: { title: value } }));
    } else if (model === "news") {
      exists = !!(await prisma.news.findFirst({ where: { slug: value } }));
    }

    if (exists) {
      duplicates.push({ row: i + 2, value });
    } else {
      unique.push(row);
    }
  }

  return { unique, duplicates };
}

async function importRows(
  rows: Record<string, unknown>[],
  model: ModelName
): Promise<number> {
  let imported = 0;

  for (const row of rows) {
    try {
      if (model === "teachers") {
        await prisma.teacher.create({
          data: {
            name: row.name as string,
            title: row.title as string,
            bio: (row.bio as string) || null,
            image: (row.image as string) || null,
            specialty: (row.specialty as string) || null,
            sortOrder: (row.sortOrder as number) || 0,
          },
        });
      } else if (model === "courses") {
        await prisma.course.create({
          data: {
            title: row.title as string,
            description: row.description as string,
            image: (row.image as string) || null,
            duration: (row.duration as string) || null,
            level: (row.level as string) || "beginner",
            sortOrder: (row.sortOrder as number) || 0,
          },
        });
      } else if (model === "news") {
        await prisma.news.create({
          data: {
            title: row.title as string,
            slug: row.slug as string,
            content: row.content as string,
            excerpt: (row.excerpt as string) || "",
            image: (row.image as string) || null,
          },
        });
      }
      imported++;
    } catch {
      // Skip individual row failures
    }
  }

  return imported;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ model: string }> }
) {
  try {
    await requireAdmin();

    const { model: modelParam } = await params;
    const model = modelParam as ModelName;

    if (!["teachers", "courses", "news"].includes(model)) {
      return NextResponse.json(
        { error: "مدل نامعتبر است. مدل‌های مجاز: teachers, courses, news" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      return NextResponse.json({ error: "فایل Excel خالی است" }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

    if (data.length < 2) {
      return NextResponse.json(
        { error: "فایل باید حداقل یک سطر هدر و یک سطر داده داشته باشد" },
        { status: 400 }
      );
    }

    const headers = data[0] as string[];
    const rows = data.slice(1) as unknown[][];

    const columnMap = detectColumns(headers, model);
    const detectedFields = Object.keys(columnMap);

    if (detectedFields.length === 0) {
      return NextResponse.json(
        {
          error: "هیچ ستون شناخته‌شده‌ای یافت نشد",
          expectedColumns: Object.keys(COLUMN_MAPPINGS[model]),
        },
        { status: 400 }
      );
    }

    const required = REQUIRED_FIELDS[model];
    const missingRequired = required.filter((f) => !detectedFields.includes(f));

    if (missingRequired.length > 0) {
      return NextResponse.json(
        {
          error: `ستون‌های الزامی缺失: ${missingRequired.join(", ")}`,
          detectedColumns: detectedFields,
          requiredColumns: required,
        },
        { status: 400 }
      );
    }

    const parsedRows = parseRows(rows, columnMap, model);

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: "هیچ ردیف داده‌ای یافت نشد" }, { status: 400 });
    }

    const { valid, errors: validationErrors } = validateRows(parsedRows, model);
    const { unique, duplicates } = await checkDuplicates(valid, model);
    const imported = await importRows(unique, model);

    return NextResponse.json({
      summary: {
        totalRows: parsedRows.length,
        validRows: valid.length,
        imported,
        duplicates: duplicates.length,
        validationErrors: validationErrors.length,
      },
      detectedColumns: detectedFields,
      duplicates: duplicates.map((d) => ({
        row: d.row,
        value: d.value,
        message: `تکراری: ${d.value}`,
      })),
      validationErrors,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "خطا در پردازش فایل" }, { status: 500 });
  }
}
