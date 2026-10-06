// بهینه‌سازی لوگوی اصلی برای استفاده در وب‌سایت
// اجرا: npx tsx scripts/optimize-logo.ts
//
// خروجی:
//   public/logo.webp             لوگوی کامل (بدون برش) در عرض ۱۰۲۴ برای next/image
//
// نکته: هیچ favicon/آیکون سایتی تولید نمی‌شود — سایت عمداً favicon سفارشی ندارد.
// فایل اصلی honarestan-hadi-logo.jpg فقط خوانده می‌شود (به‌عنوان پشتیبان می‌ماند).
import sharp from "sharp";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";

const SRC = "honarestan-hadi-logo.jpg";
const PUBLIC = "public";

const LOGO_WIDTH = 1024; // عرض خروجی لوگوی وب (نمایش نهایی ≤ ۴۰px در هدر/فوتر)
const LOGO_QUALITY = 85;

function bytes(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return -1;
  }
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });

  const srcBefore = bytes(SRC);
  const meta = await sharp(SRC).metadata();
  console.log(
    `source: ${SRC} ${meta.width}x${meta.height} ${meta.format} hasAlpha=${meta.hasAlpha} (${srcBefore} bytes)`
  );

  // ---------- لوگوی کامل بهینه‌شده (بدون برش، بدون تغییر ظاهر) ----------
  const logoBefore = bytes(`${PUBLIC}/logo.webp`);
  const logo = await sharp(SRC)
    .resize({ width: LOGO_WIDTH })
    .webp({ quality: LOGO_QUALITY, effort: 6 })
    .toBuffer();
  writeFileSync(`${PUBLIC}/logo.webp`, logo);
  const logoMeta = await sharp(logo).metadata();
  console.log(
    `public/logo.webp: ${logoBefore} -> ${logo.length} bytes (${logoMeta.width}x${logoMeta.height})`
  );

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
