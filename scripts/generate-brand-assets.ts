// تولید تصاویر برند (لوگوی بهینه‌شده) از honarestan-hadi-logo.jpg
// نکته: هیچ favicon/آیکون سایتی تولید نمی‌شود — سایت عمداً favicon سفارشی ندارد.
// اجرا: npx tsx scripts/generate-brand-assets.ts
import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";

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

  // 2) تصاویر PNG برند — فقط برای مصارف داخلی/پروژه‌های آینده؛
  //    هیچ‌کدام به‌عنوان favicon یا آیکون سایت معرفی نمی‌شوند.
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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
