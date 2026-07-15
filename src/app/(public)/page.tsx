import Hero from "@/components/ui/Hero";
import NewsCard from "@/components/ui/NewsCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  AcademicCap, BookOpen, UserGroup, Award,
  Clock, ArrowLeft, Star,
  Photo, Sparkles,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [news, galleryItems, settings, teachers, courses, studentWorks, testimonials] = await Promise.all([
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.gallery.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.siteSetting.findMany(),
    prisma.teacher.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    }),
    prisma.studentWork.findMany({
      where: { published: true, featured: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.testimonial.findMany({
      where: { published: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  const siteSettings = settings.reduce(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {} as Record<string, string>
  );

  return (
    <div>
      <Hero
        title={siteSettings["hero_title"] || "هنرستان هادی"}
        subtitle={siteSettings["hero_subtitle"] || "مرکز آموزش هنرهای زیبا و صنایع خلاق با تیمی حرفه‌ای و مجرب"}
      />

      {/* Stats Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "سال تجربه", value: "۱۵+", icon: Award, color: "text-amber-600 bg-amber-50" },
            { label: "هنرجوی فارغ‌التحصیل", value: "۵۰۰+", icon: AcademicCap, color: "text-primary-600 bg-primary-50" },
            { label: "دوره آموزشی", value: String(courses.length || "۱۰+"), icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
            { label: "استاد مجرب", value: String(teachers.length || "۸+"), icon: UserGroup, color: "text-violet-600 bg-violet-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 text-center">
              <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2.5`}>
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 lg:pt-28 lg:pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium mb-4">
            <BookOpen size={14} />
            <span>دوره‌های آموزشی</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">دوره‌های متنوع هنری</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-6">برای تمام سنین و سطوح، از مبتدی تا پیشرفته</p>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group flex flex-col">
                <div className="h-1.5 bg-primary-600" />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm mb-2 text-slate-800 group-hover:text-primary-700 transition-colors">{course.title}</h3>
                  <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-5 flex-1">{course.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    {course.duration && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {course.duration}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded text-[11px] font-medium">
                      {course.level === "beginner" ? "مبتدی" : course.level === "intermediate" ? "متوسط" : "پیشرفته"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <BookOpen size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">دوره‌ای ثبت نشده است</p>
          </div>
        )}
        <div className="text-center mt-10">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            مشاهده همه دوره‌ها
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium mb-4">
              <UserGroup size={14} />
              <span>اساتید</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">اساتید مجرب</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto leading-6">تیمی از بهترین اساتید هنر کشور</p>
          </div>
          {teachers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="bg-white rounded-xl border border-slate-200 text-center p-6 hover:shadow-md transition-all duration-300">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                    {teacher.image ? (
                      <img src={teacher.image} alt={teacher.name} loading="lazy" className="w-full h-full object-cover" />
                    ) : (
                      <UserGroup size={28} className="text-slate-400" />
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">{teacher.name}</h3>
                  <p className="text-primary-600 text-xs font-medium mt-1">{teacher.title}</p>
                  {teacher.specialty && (
                    <p className="text-slate-400 text-[11px] mt-1.5">{teacher.specialty}</p>
                  )}
                  {teacher.bio && (
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-5">{teacher.bio}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <UserGroup size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">اطلاعات اساتید به زودی اضافه خواهد شد</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Student Works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium mb-4">
            <Sparkles size={14} />
            <span>آثار برتر</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">آثار برتر هنرجویان</h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto leading-6">نمونه‌ای از آثار هنری خلق شده توسط هنرجویان</p>
        </div>
        {studentWorks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {studentWorks.map((work) => (
              <div key={work.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {work.image ? (
                    <img src={work.image} alt={work.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Photo size={32} className="text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-sm text-slate-800">{work.title}</h3>
                  <p className="text-primary-600 text-xs mt-1">{work.studentName}</p>
                  {work.description && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-5 flex-1">{work.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <Photo size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm">آثار هنرجویان به زودی نمایش داده خواهد شد</p>
          </div>
        )}
        <div className="text-center mt-10">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm"
          >
            مشاهده گالری کامل
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#0c1929] py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">نظرات هنرجویان</h2>
          </div>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div key={t.id} className="bg-white/[0.07] border border-white/10 rounded-xl p-6">
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} size={14} filled className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-7 mb-5">{t.content}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                    <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                      <UserGroup size={14} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white">{t.name}</p>
                      {t.role && <p className="text-slate-400 text-xs mt-0.5">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-12">
              <p className="text-sm">نظرات به زودی اضافه خواهد شد</p>
            </div>
          )}
        </div>
      </section>

      {/* News Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium mb-4">
            <span>اخبار</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">آخرین اخبار</h2>
        </div>
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((item) => (
              <NewsCard
                key={item.id}
                title={item.title}
                excerpt={item.excerpt}
                image={item.image}
                date={formatDate(item.createdAt)}
                slug={item.slug}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            <p className="text-sm">هنوز خبری منتشر نشده است</p>
          </div>
        )}
        <div className="text-center mt-10">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
          >
            مشاهده همه اخبار
            <ArrowLeft size={16} />
          </Link>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-medium mb-4">
              <Photo size={14} />
              <span>گالری</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-3">گالری تصاویر</h2>
          </div>
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {galleryItems.map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-slate-200 group">
                  <img src={item.image} alt={item.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 py-12">
              <Photo size={40} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm">گالری در حال تکمیل است</p>
            </div>
          )}
          <div className="text-center mt-10">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
            >
              مشاهده گالری کامل
              <ArrowLeft size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="bg-[#0c1929] rounded-2xl p-8 lg:p-14 text-white text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">آماده‌اید شروع کنید؟</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto text-sm leading-7">
            با ما تماس بگیرید تا اطلاعات بیشتری درباره دوره‌های آموزشی و ثبت‌نام دریافت کنید
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3 bg-white text-[#0c1929] rounded-lg font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              تماس با ما
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-7 py-3 border border-slate-500 text-slate-200 rounded-lg font-semibold text-sm hover:bg-white/5 transition-colors"
            >
              مشاهده دوره‌ها
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
