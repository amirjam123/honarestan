import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const existingAdmin = await prisma.adminUser.findFirst();
  if (!existingAdmin) {
    const hash = await bcrypt.hash("admin123", 10);
    await prisma.adminUser.create({
      data: { username: "admin", passwordHash: hash },
    });
    console.log("Admin user created (admin / admin123)");
  }

  const settings = [
    { key: "school_name", value: "هنرستان هادی" },
    { key: "hero_title", value: "هنرستان هادی" },
    { key: "hero_subtitle", value: "مرکز آموزش هنرهای زیبا و صنایع خلاق با تیمی حرفه‌ای و مجرب" },
    { key: "address", value: "تهران، خیابان نمونه، کوچه نمونه، پلاک ۱۲۳" },
    { key: "phone", value: "۰۲۱-۱۲۳۴۵۶۷۸" },
    { key: "email", value: "info@honarestan-hadi.ir" },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("Default settings created");

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      slug: "about",
      title: "درباره ما",
      content: `## درباره هنرستان هادی\n\nهنرستان هادی با هدف ارتقای سطح آموزش هنرهای زیبا و صنایع خلاق تاسیس شده است.\n\n### ماموریت ما\n\nارائه آموزش‌های با کیفیت در زمینه هنرهای زیبا.\n\n### ارزش‌های ما\n\n- **کیفیت آموزشی**\n- **خلاقیت**\n- **اخلاق حرفه‌ای**\n- **تعامل**`,
    },
  });
  console.log("About page created");

  // Seed Teachers
  const existingTeachers = await prisma.teacher.count();
  if (existingTeachers === 0) {
    const teachers = [
      { name: "استاد محمدی", title: "مدیر هنرستان", bio: "با بیش از ۲۰ سال تجربه در آموزش هنرهای زیبا", specialty: "نقاشی و طراحی", sortOrder: 1 },
      { name: "استاد رضایی", title: "معاون آموزشی", bio: "متخصص در هنرهای تجسمی و مجسمه‌سازی", specialty: "مجسمه‌سازی", sortOrder: 2 },
      { name: "استاد کریمی", title: "مدرس خوشنویسی", bio: "دارای مدرک درجه یک هنری در خوشنویسی", specialty: "خوشنویسی", sortOrder: 3 },
    ];
    for (const teacher of teachers) {
      await prisma.teacher.create({ data: teacher });
    }
    console.log("Sample teachers created");
  }

  // Seed Courses
  const existingCourses = await prisma.course.count();
  if (existingCourses === 0) {
    const courses = [
      { title: "نقاشی و طراحی", description: "آموزش تکنیک‌های مختلف نقاشی شامل آبرنگ، رنگ روغن و اکریلیک. از مبتدی تا پیشرفته.", duration: "۲ سال", level: "beginner", sortOrder: 1 },
      { title: "خوشنویسی", description: "آموزش خط نستعلیق، شکسته و نسخ با اساتید برجسته کشور.", duration: "۱ سال", level: "beginner", sortOrder: 2 },
      { title: "مجسمه‌سازی", description: "کار با مواد مختلف شامل گچ، سفال، فلز و چوب برای خلق آثار حجمی.", duration: "۲ سال", level: "intermediate", sortOrder: 3 },
      { title: "گرافیک دیجیتال", description: "آموزش نرم‌افزارهای گرافیکی شامل فتوشاپ، ایلوستریتور و ایندیزاین.", duration: "۱ سال", level: "beginner", sortOrder: 4 },
      { title: "عکاسی", description: "تکنیک‌های عکاسی حرفه‌ای، نورپردازی و ویرایش تصویر.", duration: "۶ ماه", level: "beginner", sortOrder: 5 },
    ];
    for (const course of courses) {
      await prisma.course.create({ data: course });
    }
    console.log("Sample courses created");
  }

  // Seed Testimonials
  const existingTestimonials = await prisma.testimonial.count();
  if (existingTestimonials === 0) {
    const testimonials = [
      { name: "سارا احمدی", role: "فارغ‌التحصیل نقاشی", content: "هنرستان هادی تجربه‌ای فراموش‌نشدنی برای من بود. اساتید مجرب و محیط الهام‌بخش باعث شد استعدادم شکوفا شود.", rating: 5, sortOrder: 1 },
      { name: "علی محمدی", role: "دانشجوی خوشنویسی", content: "کلاس‌های خوشنویسی این هنرستان بسیار حرفه‌ای و اصولی برگزار می‌شود. قدردان تمام زحمات اساتید هستم.", rating: 5, sortOrder: 2 },
      { name: "مریم کریمی", role: "والد دانش‌آموز", content: "فرزندم با شرکت در کلاس‌های هنرستان هادی اعتماد به نفس بالایی پیدا کرده و استعداد هنری‌اش شکوفا شده.", rating: 5, sortOrder: 3 },
    ];
    for (const testimonial of testimonials) {
      await prisma.testimonial.create({ data: testimonial });
    }
    console.log("Sample testimonials created");
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
