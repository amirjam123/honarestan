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
    const hash = await bcrypt.hash("Hadi1234", 12);
    await prisma.adminUser.create({
      data: { username: "honarestan", passwordHash: hash },
    });
    console.log("Admin user created (honarestan / Hadi1234)");
  }

  const settings = [
    { key: "school_name", value: "هنرستان فنی حرفه ای هادی" },
    { key: "hero_title", value: "هنرستان فنی حرفه ای هادی" },
    { key: "hero_subtitle", value: "" },
    { key: "address", value: "جاجرود، روستای خسروآباد، خیابان سد لتیان، کوچه بوستان" },
    { key: "phone", value: "02176201350" },
    { key: "email", value: "HonarestanHadi@gmail.com" },
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
      content: `## درباره هنرستان فنی حرفه ای هادی\n\nهنرستان فنی حرفه ای هادی در رشته‌های حسابداری و شبکه و نرم‌افزار دانش‌آموز پذیرش می‌کند.\n\n### رشته‌های آموزشی\n\n- **حسابداری**\n- **شبکه و نرم‌افزار**`,
    },
  });
  console.log("About page created");

  // توجه: دبیران به‌صورت خودکار ایجاد نمی‌شوند؛ اطلاعات کادر آموزشی باید توسط مدیر وارد شود.

  // Seed Courses
  const existingCourses = await prisma.course.count();
  if (existingCourses === 0) {
    const courses = [
      { title: "شبکه و نرم افزار", description: "آموزش مفاهیم پایه شبکه و نرم افزارهای کاربردی.", duration: "۲ سال", level: "beginner", sortOrder: 1 },
      { title: "حسابداری", description: "آموزش مفاهیم پایه حسابداری و نرم افزارهای مرتبط.", duration: "۱ سال", level: "beginner", sortOrder: 2 },
    ];
    for (const course of courses) {
      await prisma.course.create({ data: course });
    }
    console.log("Sample courses created");
  }

  // توجه: نظرات/تجربه دانش‌آموزان و والدین به‌صورت خودکار ایجاد نمی‌شوند؛
  // هر نظر باید توسط مدیر و با نام واقعی ثبت شود.

  // Seed SchoolProfile
  await prisma.schoolProfile.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      overview: "",
      history: "",
      vision: "",
      mission: "",
      educationalGoals: "آموزش مفاهیم و مهارت‌های تخصصی رشته‌های حسابداری و شبکه و نرم‌افزار و آماده‌سازی دانش‌آموزان برای بازار کار یا ادامه تحصیل.",
      departments: "حسابداری و شبکه و نرم‌افزار",
      facilities: "",
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
      name: "جناب دکتر امیری",
      position: "مدیر هنرستان",
      biography: "",
      welcomeMessage: "",
      resume: "",
      achievements: "[]",
    },
  });
  console.log("PrincipalProfile seeded");

  // Seed SEO Settings
  const seoSettings = [
    {
      pagePath: "/",
      metaTitle: "هنرستان فنی حرفه ای هادی",
      metaDescription: "هنرستان فنی حرفه ای هادی؛ آموزش فنی و حرفه‌ای در رشته‌های حسابداری و شبکه و نرم‌افزار.",
      robots: "index, follow",
    },
    {
      pagePath: "/about",
      metaTitle: "درباره ما",
      metaDescription: "معرفی هنرستان فنی حرفه ای هادی و رشته‌های آموزشی حسابداری و شبکه و نرم‌افزار.",
      robots: "index, follow",
    },
    {
      pagePath: "/gallery",
      metaTitle: "گالری تصاویر",
      metaDescription: "تصاویر هنرستان فنی حرفه ای هادی.",
      robots: "noindex, follow",
    },
    {
      pagePath: "/news",
      metaTitle: "اخبار و اطلاعیه‌ها",
      metaDescription: "اخبار و اطلاعیه‌های هنرستان فنی حرفه ای هادی.",
      robots: "index, follow",
    },
    {
      pagePath: "/contact",
      metaTitle: "تماس با ما",
      metaDescription: "اطلاعات تماس هنرستان فنی حرفه ای هادی: آدرس، تلفن و ایمیل.",
      robots: "index, follow",
    },
    {
      pagePath: "/events",
      metaTitle: "رویدادها",
      metaDescription: "رویدادها و برنامه‌های هنرستان فنی حرفه ای هادی.",
      robots: "noindex, follow",
    },
    {
      pagePath: "/teachers",
      metaTitle: "کادر آموزشی",
      metaDescription: "معرفی کادر آموزشی هنرستان فنی حرفه ای هادی.",
      robots: "noindex, follow",
    },
    {
      pagePath: "/student-works",
      metaTitle: "آثار هنرجویان",
      metaDescription: "آثار هنرجویان هنرستان فنی حرفه ای هادی.",
      robots: "noindex, follow",
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
