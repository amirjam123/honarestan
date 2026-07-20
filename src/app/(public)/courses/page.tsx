import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import Link from "next/link";
import { BookOpen, Clock, Chart, ArrowLeft, Envelope } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { published: true },
    orderBy: { sortOrder: "asc" },
  });

  const levelLabels: Record<string, string> = {
    beginner: "مبتدی",
    intermediate: "متوسط",
    advanced: "پیشرفته",
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-50 text-emerald-700",
    intermediate: "bg-amber-50 text-amber-700",
    advanced: "bg-red-50 text-red-700",
  };

  return (
    <div>
      <Hero title="دوره‌های آموزشی" subtitle="دوره‌های متنوع هنری برای تمام سنین و سطوح" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
                <div className="h-1.5 bg-gradient-to-l from-primary-500 to-primary-600" />
                <div className="p-6">
                  <h2 className="text-base font-bold mb-3 text-slate-800 group-hover:text-primary-700 transition-colors">
                    {course.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-7 mb-5">{course.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {course.duration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 text-slate-600 rounded-md text-xs">
                        <Clock size={12} />
                        {course.duration}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${levelColors[course.level] || "bg-primary-50 text-primary-700"}`}>
                      <Chart size={12} />
                      {levelLabels[course.level] || course.level}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-20">
            <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base text-slate-500">دوره‌ای ثبت نشده است</p>
            <p className="text-slate-400 text-sm mt-1">اطلاعات دوره‌ها به زودی اضافه خواهد شد</p>
          </div>
        )}

        <div className="mt-16 bg-[#0c1929] rounded-2xl p-8 lg:p-12 text-white text-center">
          <Envelope size={28} className="mx-auto mb-3 text-slate-400" />
          <h2 className="text-xl font-bold mb-3">سوالی دارید؟</h2>
          <p className="text-slate-300 text-sm mb-6">
            برای اطلاعات بیشتر درباره دوره‌ها و شرایط ثبت‌نام با ما تماس بگیرید
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-100 transition-colors"
          >
            تماس با ما
            <ArrowLeft size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
