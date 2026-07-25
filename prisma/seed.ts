import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const existingAdmin = await prisma.adminUser.findFirst();
  if (!existingAdmin) {
    const hash = await bcrypt.hash("@hadiplmmlp", 12);
    await prisma.adminUser.create({
      data: { username: "honarestan", passwordHash: hash },
    });
    console.log("Admin user created (honarestan / @hadiplmmlp)");
  }

  const settings = [
    { key: "school_name", value: "هنرستان هادی" },
    { key: "hero_title", value: "هنرستان هادی" },
    { key: "hero_subtitle", value: "" },
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

  // Seed SchoolProfile
  await prisma.schoolProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      overview: "",
      history: "هنرستان هادی در سال ۱۳۷۰ با هدف ارتقای سطح آموزش هنرهای زیبا تأسیس شد.",
      vision: "",
      mission: "",
      educationalGoals: "پرورش خلاقیت، توسعه مهارت‌های فنی، و آماده‌سازی دانش‌آموزان برای ورود به بازار کار.",
      departments: "نقاشی و طراحی، خوشنویسی، مجسمه‌سازی، گرافیک دیجیتال، عکاسی",
      facilities: "کارگاه‌های مجهز، گالری نمایشگاهی، کتابخانه تخصصی، آزمایشگاه دیجیتال",
      statistics: '{"students": 250, "teachers": 15, "courses": 10, "graduates": 1200}',
      additionalInfo: "برای کسب اطلاعات بیشتر با ما تماس بگیرید.",
    },
  });
  console.log("SchoolProfile seeded");

  // Seed PrincipalProfile
  await prisma.principalProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      name: "جناب آقای محمدی",
      position: "مدیر هنرستان",
      biography: "با بیش از ۲۰ سال تجربه در آموزش هنرهای زیبا و مدیریت آموزشی.",
      welcomeMessage: "به هنرستان هادی خوش آمدید. ما متعهد به پرورش استعدادهای هنری نسل آینده هستیم.",
      resume: "کارشناسی ارشد هنرهای زیبا، دانشگاه تهران",
      achievements: '["کسب مقام اول جشنواره هنرهای تجسمی", "انتشار ۵ کتاب آموزشی", "۲۰ سال سابقه تدریس"]',
    },
  });
  console.log("PrincipalProfile seeded");

  // Seed SEO Settings
  const seoSettings = [
    {
      pagePath: "/",
      metaTitle: "هنرستان هادی | مرکز آموزش هنرهای زیبا",
      metaDescription: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق. آموزش نقاشی، مجسمه‌سازی، خوشنویسی، عکاسی و گرافیک با بهترین اساتید.",
      robots: "index, follow",
    },
    {
      pagePath: "/about",
      metaTitle: "درباره ما | هنرستان هادی",
      metaDescription: "آشنایی با تاریخچه، ارزش‌ها و اهداف هنرستان هادی. مرکز آموزش هنرهای زیبا در تهران با بیش از ۳۰ سال سابقه.",
      robots: "index, follow",
    },
    {
      pagePath: "/gallery",
      metaTitle: "گالری تصاویر | هنرستان هادی",
      metaDescription: "گالری تصاویر هنرستان هادی. مشاهده آثار هنری هنرجویان و اساتید در رشته‌های مختلف هنری.",
      robots: "index, follow",
    },
    {
      pagePath: "/news",
      metaTitle: "اخبار | هنرستان هادی",
      metaDescription: "آخرین اخبار و اطلاعیه‌های هنرستان هادی. رویدادها و اخبار آموزشی هنرستان.",
      robots: "index, follow",
    },
    {
      pagePath: "/contact",
      metaTitle: "تماس با ما | هنرستان هادی",
      metaDescription: "اطلاعات تماس هنرستان هادی. آدرس، تلفن و ایمیل برای ارتباط با ما. ثبت تیکت پشتیبانی.",
      robots: "index, follow",
    },
    {
      pagePath: "/courses",
      metaTitle: "دوره‌های آموزشی | هنرستان هادی",
      metaDescription: "دوره‌های آموزشی هنرستان هادی. نقاشی، خوشنویسی، مجسمه‌سازی، گرافیک و عکاسی.",
      robots: "index, follow",
    },
    {
      pagePath: "/events",
      metaTitle: "رویدادها | هنرستان هادی",
      metaDescription: "رویدادهای هنرستان هادی. نمایشگاه‌ها، جشنواره‌ها و برنامه‌های ویژه هنری.",
      robots: "index, follow",
    },
    {
      pagePath: "/teachers",
      metaTitle: "اساتید | هنرستان هادی",
      metaDescription: "اساتید مجرب هنرستان هادی. معرفی کادر آموزشی با تجربه در رشته‌های مختلف هنری.",
      robots: "index, follow",
    },
    {
      pagePath: "/student-works",
      metaTitle: "آثار هنرجویان | هنرستان هادی",
      metaDescription: "آثار هنری خلق شده توسط هنرجویان هنرستان هادی. نمایشگاه آثار برتر هنری.",
      robots: "index, follow",
    },
  ];

  for (const seo of seoSettings) {
    await prisma.seoSetting.upsert({
      where: { pagePath: seo.pagePath },
      update: {},
      create: seo,
    });
  }
  console.log("SEO settings seeded");

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
