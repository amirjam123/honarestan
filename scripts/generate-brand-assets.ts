// تولید لوگوی بهینه‌شده و فاوآیکون از honarestan-hadi-logo.jpg
// اجرا: npx tsx scripts/generate-brand-assets.ts
import sharp from "sharp";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";

const SRC = "honarestan-hadi-logo.jpg";
const OUT_DIR = "public";
const PREFIX = "brand";

// کادر برش‌خورده (پر می‌شود در main)
let base: () => sharp.Sharp;

async function main() {
  if (!existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  const meta = await sharp(SRC).metadata();
  const OW = meta.width!;
  const OH = meta.height!;
  console.log(`original: ${OW}x${OH} ${meta.format} hasAlpha=${meta.hasAlpha}`);

  // 1) downscale برای یافتن کادر نشان
  const RW = 400;
  const { data, info } = await sharp(SRC)
    .resize({ width: RW })
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const C = info.channels;

  // رنگ پس‌زمینه از گوشه‌ها
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

  // کادر مربع با حاشیهٔ امن ۴٪
  const scale = OW / W;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const side = Math.max(maxX - minX, maxY - minY) * 1.04;

  const region = {
    left: Math.max(0, Math.round((cx - side / 2) * scale)),
    top: Math.max(0, Math.round((cy - side / 2) * scale)),
  };
  let size = Math.round(side * scale);
  size = Math.min(size, OW - region.left, OH - region.top);
  const regionFull = { left: region.left, top: region.top, width: size, height: size };

  console.log("emblem bbox:", { minX, maxX, minY, maxY });
  console.log("crop region:", regionFull);

  base = () => sharp(SRC).extract(regionFull);

  // 2) فاوآیکون فقط حرف «ه» است (icon.svg موجود) — PNGهای کوچک لازم نیست.
  //    فقط برای apple-touch-icon و PWA که PNG هستند استفاده می‌شوند.
  for (const s of [180, 192, 512]) {
    await base()
      .resize(s, s, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(`${OUT_DIR}/${PREFIX}-${s}.png`);
  }

  // 3) WebP و AVIF برای نمایش لوگو در هدر و فوتر
  for (const s of [64, 128, 256]) {
    await base()
      .resize(s, s, { fit: "cover" })
      .webp({ quality: 90 })
      .toFile(`${OUT_DIR}/${PREFIX}-${s}.webp`);
    await base()
      .resize(s, s, { fit: "cover" })
      .avif({ quality: 55 })
      .toFile(`${OUT_DIR}/${PREFIX}-${s}.avif`);
  }

  console.log("done.");
}

// ---------- favicon.ico از همان تصویر لوگو ----------
async function generateFavicons() {
  const ICO_SIZES = [16, 32, 48];
  const pngs: Buffer[] = [];

  for (const s of ICO_SIZES) {
    const buf = await base()
      .clone()
      .resize(s, s, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer();
    pngs.push(buf);
    writeFileSync(`${OUT_DIR}/favicon-${s}.png`, buf);
  }

  // ساخت favicon.ico چنداندازه‌ای (فرمت ICO: header + entries + داده PNG)
  const count = pngs.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type = icon
  header.writeUInt16LE(count, 4);

  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  pngs.forEach((png, i) => {
    const s = ICO_SIZES[i];
    const e = 16 * i;
    dir.writeUInt8(s, e + 0); // width
    dir.writeUInt8(s, e + 1); // height
    dir.writeUInt8(0, e + 2); // palette
    dir.writeUInt8(0, e + 3); // reserved
    dir.writeUInt16LE(1, e + 4); // color planes
    dir.writeUInt16LE(32, e + 6); // bits per pixel
    dir.writeUInt32LE(png.length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += png.length;
  });

  const ico = Buffer.concat([header, dir, ...pngs]);
  writeFileSync(`${OUT_DIR}/favicon.ico`, ico);
  console.log(`favicon.ico: ${ico.length} bytes (${ICO_SIZES.join(", ")})`);
}

main()
  .then(generateFavicons)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
