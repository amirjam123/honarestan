import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sendImageToTelegram, sendDocumentToTelegram, isTelegramConfigured } from "@/lib/telegram";
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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const ip = getClientIp(request);

    if (!isTelegramConfigured()) {
      return NextResponse.json(
        { error: "آپلود تصویر در دسترس نیست. ربات تلگرام پیکربندی نشده است." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "فایلی ارسال نشده است" }, { status: 400 });
    }

    if (!ALLOWED_TYPES[file.type]) {
      await logSecurityEvent({ event: "file_upload", ip, details: `Rejected: invalid MIME type ${file.type}`, path: "/api/upload/telegram" });
      return NextResponse.json({ error: "فرمت فایل مجاز نیست. فقط JPG, PNG, GIF, WebP مجاز هستند." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "حجم فایل بیش از حد مجاز است. حداکثر ۱۰ مگابایت." }, { status: 400 });
    }

    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: "پسوند فایل مجاز نیست." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, file.type)) {
      await logSecurityEvent({ event: "file_upload", ip, details: `Rejected: magic bytes mismatch for ${file.name}`, path: "/api/upload/telegram" });
      return NextResponse.json({ error: "محتوای فایل با نوع آن مطابقت ندارد." }, { status: 400 });
    }

    const result = await sendImageToTelegram(buffer, file.name, file.type);

    await logSecurityEvent({ event: "file_upload", ip, details: `Telegram upload: ${file.name} (${file.size} bytes) -> ${result.fileId}`, path: "/api/upload/telegram" });

    return NextResponse.json({ fileId: result.fileId, url: result.url }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Telegram upload error:", error);
    return NextResponse.json({ error: "خطا در آپلود فایل" }, { status: 500 });
  }
}
