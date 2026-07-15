import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import Link from "next/link";
import { AcademicCap, Award, Sparkles, ArrowLeft, BookOpen, UserGroup } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [page, teachers, courses] = await Promise.all([
    prisma.page.findUnique({ where: { slug: "about" } }),
    prisma.teacher.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  const content = page?.content || `
## درباره هنرستان هادی

هنرستان هادی با هدف ارتقای سطح آموزش هنرهای زیبا و صنایع خلاق تاسیس شده است.

### ماموریت ما

ما باور داریم که هنر زبان مشترک تمام انسان‌هاست و تلاش می‌کنیم تا محیطی الهام‌بخش برای پرورش خلاقیت و استعداد هنرجویان فراهم کنیم.

### ارزش‌های ما

- **کیفیت آموزشی**: استفاده از بهترین روش‌های آموزشی
- **خلاقیت**: تشویق به ابداع و نوآوری
- **اخلاق حرفه‌ای**: پایبندی به اصول اخلاقی
- **تعامل**: ایجاد محیطی صمیمی و سازنده
`;

  const contentHtml = content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("- **")) {
        const match = trimmed.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
        if (match) return `<li><strong>${match[1]}</strong>${match[2] ? `: ${match[2]}` : ""}</li>`;
      }
      if (trimmed.startsWith("- ")) return `<li>${trimmed.slice(2)}</li>`;
      if (trimmed === "") return "";
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");

  return (
    <div>
      <Hero title="درباره هنرستان هادی" subtitle="آشنایی با تاریخچه، ماموریت و ارزش‌های ما" />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-10">
          <div className="prose-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">چرا هنرستان هادی؟</h2>
            <p className="text-slate-500 text-sm">مزایای آموزش در هنرستان هادی</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: AcademicCap, title: "اساتید مجرب", desc: "تیمی از بهترین اساتید هنر کشور با سال‌ها تجربه آموزشی", color: "text-primary-600 bg-primary-50" },
              { icon: Award, title: "سابقه درخشان", desc: "سال‌ها تجربه موفق در آموزش هنرهای زیبا و تربیت هنرمندان", color: "text-amber-600 bg-amber-50" },
              { icon: Sparkles, title: "محیط الهام‌بخش", desc: "فضایی خلاق و الهام‌بخش برای شکوفایی استعدادهای هنری", color: "text-emerald-600 bg-emerald-50" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mx-auto mb-4`}>
                  <item.icon size={22} />
                </div>
                <h3 className="font-bold text-sm mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 text-xs leading-6">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teachers Preview */}
      {teachers.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">اساتید ما</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} loading="lazy" className="w-full h-full object-cover" />
                  ) : (
                    <UserGroup size={28} className="text-slate-400" />
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-800">{teacher.name}</h3>
                <p className="text-primary-600 text-xs">{teacher.title}</p>
                {teacher.specialty && <p className="text-slate-400 text-[11px] mt-1">{teacher.specialty}</p>}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            >
              مشاهده همه اساتید
              <ArrowLeft size={16} />
            </Link>
          </div>
        </section>
      )}

      {/* Courses Overview */}
      {courses.length > 0 && (
        <section className="bg-slate-50 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">دوره‌های آموزشی</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.slice(0, 6).map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 mb-1">{course.title}</h3>
                    <p className="text-slate-500 text-xs line-clamp-2 leading-5">{course.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
              >
                مشاهده همه دوره‌ها
                <ArrowLeft size={16} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
