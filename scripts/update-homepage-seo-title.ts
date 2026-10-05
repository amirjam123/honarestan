// یک‌بارمصرف: یکدست‌سازی نام مدرسه در تمام تنظیمات سئوی دیتابیس.
// عنوان صفحه اصلی یک عنوان کامل و مستقل است، بنابراین نباید با قالب
// «%s | نام سایت» در layout دوباره‌ تکرار شود.
// اجرا: npx tsx scripts/update-homepage-seo-title.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

// هم‌راستا با SCHOOL.name در src/lib/seo.ts
const SCHOOL_NAME = "هنرستان فنی و حرفه ای هادی";
const OLD_NAME = "هنرستان فنی حرفه ای هادی"; // نام قدیمی بدون «و»

const HOMEPAGE_TITLE = SCHOOL_NAME;
const HOMEPAGE_DESCRIPTION =
  "هنرستان فنی و حرفه ای هادی — آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  // ۱) صفحه اصلی
  const existing = await prisma.seoSetting.findUnique({
    where: { pagePath: "/" },
  });

  if (!existing) {
    console.log('No SeoSetting row for "/". Creating one...');
    await prisma.seoSetting.create({
      data: {
        pagePath: "/",
        metaTitle: HOMEPAGE_TITLE,
        metaDescription: HOMEPAGE_DESCRIPTION,
        robots: "index, follow",
      },
    });
  } else {
    // ogTitle/twitterTitle are cleared so they fall back to the new metaTitle.
    await prisma.seoSetting.update({
      where: { pagePath: "/" },
      data: {
        metaTitle: HOMEPAGE_TITLE,
        ogTitle: null,
        twitterTitle: null,
      },
    });
  }

  const updated = await prisma.seoSetting.findUnique({
    where: { pagePath: "/" },
  });
  console.log("Homepage metaTitle updated. Matches expected:", updated?.metaTitle === HOMEPAGE_TITLE);

  // ۲) یکدست‌سازی نام مدرسه در تمام صفحات (شامل صفحه اصلی)
  const all = await prisma.seoSetting.findMany({ orderBy: { pagePath: "asc" } });
  let changed = 0;

  for (const s of all) {
    const fields: Record<string, string | null> = {};
    if (s.metaTitle.includes(OLD_NAME)) {
      fields.metaTitle = s.metaTitle.replaceAll(OLD_NAME, SCHOOL_NAME);
    }
    if (s.metaDescription.includes(OLD_NAME)) {
      fields.metaDescription = s.metaDescription.replaceAll(OLD_NAME, SCHOOL_NAME);
    }
    if (s.ogTitle?.includes(OLD_NAME)) {
      fields.ogTitle = s.ogTitle.replaceAll(OLD_NAME, SCHOOL_NAME);
    }
    if (s.twitterTitle?.includes(OLD_NAME)) {
      fields.twitterTitle = s.twitterTitle.replaceAll(OLD_NAME, SCHOOL_NAME);
    }
    if (s.ogDescription?.includes(OLD_NAME)) {
      fields.ogDescription = s.ogDescription.replaceAll(OLD_NAME, SCHOOL_NAME);
    }
    if (s.twitterDescription?.includes(OLD_NAME)) {
      fields.twitterDescription = s.twitterDescription.replaceAll(OLD_NAME, SCHOOL_NAME);
    }

    if (Object.keys(fields).length > 0) {
      await prisma.seoSetting.update({ where: { pagePath: s.pagePath }, data: fields });
      changed++;
      console.log(`updated: ${s.pagePath} -> ${Object.keys(fields).join(", ")}`);
    }
  }

  console.log(`\nPages normalized: ${changed}`);

  const final = await prisma.seoSetting.findMany({ orderBy: { pagePath: "asc" } });
  console.log(`\n--- ALL SEO SETTINGS (${final.length}) ---`);
  for (const s of final) {
    console.log(`${s.pagePath}`);
    console.log(`  title: ${s.metaTitle}`);
    console.log(`  desc : ${s.metaDescription}`);
    console.log(`  og   : ${s.ogTitle ?? "-"}`);
    console.log(`  tw   : ${s.twitterTitle ?? "-"}`);
    console.log(`  robot: ${s.robots}`);
  }

  const stale = final.filter(
    (s) =>
      s.metaTitle.includes(OLD_NAME) ||
      s.metaDescription.includes(OLD_NAME) ||
      (s.ogTitle ?? "").includes(OLD_NAME) ||
      (s.twitterTitle ?? "").includes(OLD_NAME) ||
      (s.ogDescription ?? "").includes(OLD_NAME) ||
      (s.twitterDescription ?? "").includes(OLD_NAME)
  );
  console.log(`\nRemaining pages with old name: ${stale.length}`);
  for (const s of stale) {
    console.log(`\nSTALE -> ${s.pagePath}`);
    const check: [string, string][] = [
      ["metaTitle", s.metaTitle],
      ["metaDescription", s.metaDescription],
      ["ogTitle", s.ogTitle ?? ""],
      ["twitterTitle", s.twitterTitle ?? ""],
    ];
    for (const [field, value] of check) {
      if (!value.includes(OLD_NAME)) continue;
      const idx = value.indexOf(OLD_NAME);
      console.log(`  field: ${field}`);
      console.log(`  expected: ${OLD_NAME}`);
      console.log(`  actual  : ${value.slice(idx, idx + OLD_NAME.length)}`);
      console.log(
        `  codepoints: expected=${[...OLD_NAME].map((c) => c.codePointAt(0)!.toString(16)).join(",")}`
      );
      console.log(
        `  codepoints: actual  =${[...value.slice(idx, idx + OLD_NAME.length)].map((c) => c.codePointAt(0)!.toString(16)).join(",")}`
      );
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });