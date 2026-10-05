// بهینه‌سازی لوگوی اصلی و تولید مجموعه favicon از honarestan-hadi-logo.jpg
// اجرا: npx tsx scripts/optimize-logo.ts
//
// خروجی‌ها:
//   public/logo.webp             لوگوی کامل (بدون برش) در عرض ۱۰۲۴ برای next/image
//   src/app/favicon.ico           favicon چنداندازه (16/32/48) - قرارداد App Router
//   public/favicon.ico            همان ico برای درخواست مستقیم /favicon.ico
//   public/favicon-16/32/48.png   PNGهای favicon
//   public/apple-touch-icon.png  180x180 (از طریق metadata.icons.apple در layout)
//   public/favicon.svg            نشان با PNG جاسازی‌شده
//
// فایل اصلی honarestan-hadi-logo.jpg فقط خوانده می‌شود (به‌عنوان پشتیبان می‌ماند).
import sharp from "sharp";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";

const SRC = "honarestan-hadi-logo.jpg";
const PUBLIC = "public";
const APP = "src/app";

const LOGO_WIDTH = 1024; // عرض خروجی لوگوی وب (نمایش نهایی ≤ ۴۰px در هدر/فوتر)
const LOGO_QUALITY = 85;
const ICO_SIZES = [16, 32, 48];

function bytes(path: string): number {
  try {
    return statSync(path).size;
  } catch {
    return -1;
  }
}

// ---------- بسته‌بندی ICO (header + entries + PNG) ----------
function packIco(pngs: Buffer[], sizes: number[]): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(pngs.length, 4);

  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + 16 * pngs.length;
  pngs.forEach((png, i) => {
    const s = sizes[i];
    const e = 16 * i;
    dir.writeUInt8(s >= 256 ? 0 : s, e + 0); // width
    dir.writeUInt8(s >= 256 ? 0 : s, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // color planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });

  return Buffer.concat([header, dir, ...pngs]);
}

async function main() {
  if (!existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  if (!existsSync(PUBLIC)) mkdirSync(PUBLIC, { recursive: true });
  if (!existsSync(APP)) mkdirSync(APP, { recursive: true });

  const srcBefore = bytes(SRC);
  const icoBefore = bytes(`${APP}/favicon.ico`);
  const publicIcoBefore = bytes(`${PUBLIC}/favicon.ico`);

  const meta = await sharp(SRC).metadata();
  const OW = meta.width!;
  const OH = meta.height!;
  console.log(`source: ${SRC} ${OW}x${OH} ${meta.format} hasAlpha=${meta.hasAlpha} (${srcBefore} bytes)`);

  // ---------- 1) لوگوی کامل بهینه‌شده (بدون برش، بدون تغییر ظاهر) ----------
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

  // ---------- 2) تشخیص کادر نشان (emblem) برای favicon ----------
  // همان الگوریتم اسکریپت‌های موجود پروژه: نمونه‌برداری رنگ پس‌زمینه از گوشه‌ها
  // و پیدا کردن حداقل/حداکثر پیکسل‌های متفاوت با آن.
  const { data, info } = await sharp(SRC)
    .resize({ width: 400 })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const C = info.channels;
  const px = (x: number, y: number) => {
    const i = (y * W + x) * C;
    return [data[i], data[i + 1], data[i + 2]] as const;
  };
  const samples = [
    px(2, 2),
    px(W - 3, 2),
    px(2, H - 3),
    px(W - 3, H - 3),
    px(W >> 1, 2),
    px(2, H >> 1),
  ];
  const avg = (k: number) => samples.reduce((s, c) => s + c[k], 0) / samples.length;
  const bgR = avg(0);
  const bgG = avg(1);
  const bgB = avg(2);

  let minX = W;
  let maxX = 0;
  let minY = H;
  let maxY = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      const d =
        Math.abs(data[i] - bgR) + Math.abs(data[i + 1] - bgG) + Math.abs(data[i + 2] - bgB);
      if (d > 90) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // کادر مربع با حاشیهٔ امن ۴٪ (طرح لوگو تغییری نمی‌کند)
  const scale = OW / W;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const side = Math.max(maxX - minX, maxY - minY) * 1.04;
  let left = Math.round((cx - side / 2) * scale);
  let top = Math.round((cy - side / 2) * scale);
  let size = Math.round(side * scale);
  left = Math.max(0, Math.min(left, OW - 1));
  top = Math.max(0, Math.min(top, OH - 1));
  size = Math.min(size, OW - left, OH - top);

  const CROP = { left, top, width: size, height: size };
  console.log("emblem crop:", CROP);
  const emblem = () => sharp(SRC).extract(CROP);

  // ---------- 3) favicon.ico چنداندازه ----------
  // نکته: Turbopack در next build فقط PNG از نوع RGBA را داخل ICO می‌پذیرد.
  const icoPngs: Buffer[] = [];
  for (const s of ICO_SIZES) {
    icoPngs.push(
      await emblem()
        .resize(s, s, { fit: "cover" })
        .ensureAlpha()
        .png({ compressionLevel: 9 })
        .toBuffer()
    );
  }
  const ico = packIco(icoPngs, ICO_SIZES);
  writeFileSync(`${APP}/favicon.ico`, ico);
  writeFileSync(`${PUBLIC}/favicon.ico`, ico);
  console.log(
    `favicon.ico: ${icoBefore} -> ${ico.length} bytes (src/app) | public: ${publicIcoBefore} -> ${ico.length} bytes`
  );

  // ---------- 4) PNGهای favicon ----------
  for (const s of [16, 32, 48]) {
    const p = bytes(`${PUBLIC}/favicon-${s}.png`);
    const buf = await emblem()
      .resize(s, s, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(`${PUBLIC}/favicon-${s}.png`, buf);
    console.log(`public/favicon-${s}.png: ${p} -> ${buf.length} bytes`);
  }

  // ---------- 5) Apple Touch Icon 180x180 ----------
  // در public و از طریق metadata.icons.apple معرفی می‌شود (سازگارترین روش).
  const appleBefore = bytes(`${PUBLIC}/apple-touch-icon.png`);
  const apple = await emblem()
    .resize(180, 180, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(`${PUBLIC}/apple-touch-icon.png`, apple);
  console.log(`public/apple-touch-icon.png: ${appleBefore} -> ${apple.length} bytes`);

  // ---------- 6) favicon.svg با PNG جاسازی‌شده ----------
  // پالت‌بندی ۲۵۶ رنگ: کیفیت در اندازه‌های favicon تغییر محسوسی ندارد ولی حجم ~۶۵٪ کمتر می‌شود.
  const svgBefore = bytes(`${PUBLIC}/favicon.svg`);
  const embed = await emblem()
    .resize(128, 128, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true, quality: 90, colours: 256 })
    .toBuffer();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128"><image width="128" height="128" href="data:image/png;base64,${embed.toString(
    "base64"
  )}"/></svg>\n`;
  writeFileSync(`${PUBLIC}/favicon.svg`, svg);
  console.log(`public/favicon.svg: ${svgBefore} -> ${Buffer.byteLength(svg)} bytes`);

  console.log("done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
