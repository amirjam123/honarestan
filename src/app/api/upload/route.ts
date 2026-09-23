import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

const ALLOWED_TYPES: Record<string, number[]> = {
  "image/jpeg": [0xFF, 0xD8, 0xFF],
  "image/png": [0x89, 0x50, 0x4E, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const expectedBytes = ALLOWED_TYPES[mimeType];
  if (!expectedBytes) return false;

  for (let i = 0; i < expectedBytes.length; i++) {
    if (buffer[i] !== expectedBytes[i]) return false;
  }
  return true;
}

function sanitizeFilename(filename: string): string {
  // Remove path separators and null bytes
  const sanitized = filename
    .replace(/[/\\]/g, "")
    .replace(/\0/g, "")
    .replace(/\.\./g, "")
    .trim();
  
  // Only allow alphanumeric, hyphens, underscores, and dots
  return sanitized.replace(/[^a-zA-Z0-9\-_.]/g, "_");
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const ip = getClientIp(request);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check MIME type
    if (!ALLOWED_TYPES[file.type]) {
      await logSecurityEvent({
        event: "file_upload",
        ip,
        details: `Rejected: invalid MIME type ${file.type}`,
        path: "/api/upload",
      });

      return NextResponse.json(
        { error: "فرمت فایل مجاز نیست. فقط JPG, PNG, GIF, WebP مجاز هستند." },
        { status: 400 }
      );
    }

    // Check file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "حجم فایل بیش از حد مجاز است. حداکثر ۱۰ مگابایت." },
        { status: 400 }
      );
    }

    // Check file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "پسوند فایل مجاز نیست." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes
    if (!validateMagicBytes(buffer, file.type)) {
      await logSecurityEvent({
        event: "file_upload",
        ip,
        details: `Rejected: magic bytes mismatch for ${file.name}`,
        path: "/api/upload",
      });

      return NextResponse.json(
        { error: "محتوای فایل با نوع آن مطابقت ندارد." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const sanitizedFilename = sanitizeFilename(file.name);
    const filename = `${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    await writeFile(filepath, buffer);

    await logSecurityEvent({
      event: "file_upload",
      ip,
      details: `Uploaded: ${sanitizedFilename} (${file.size} bytes)`,
      path: "/api/upload",
    });

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
