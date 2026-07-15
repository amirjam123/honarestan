import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import { Photo, Sparkles } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StudentWorksPage() {
  const works = await prisma.studentWork.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set(works.map((w) => w.category))];

  const categoryLabels: Record<string, string> = {
    general: "عمومی",
    painting: "نقاشی",
    sculpture: "مجسمه‌سازی",
    calligraphy: "خوشنویسی",
    photography: "عکاسی",
    digital: "دیجیتال آرت",
    graphic: "گرافیک",
  };

  return (
    <div>
      <Hero title="آثار هنرجویان" subtitle="نمایش آثار هنری خلق شده توسط هنرجویان مستعد هنرستان هادی" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            <span className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium">
              همه
            </span>
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {categoryLabels[cat] || cat}
              </span>
            ))}
          </div>
        )}

        {works.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {works.map((work) => (
              <div key={work.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-slate-300 transition-all duration-300">
                <div className="aspect-square bg-slate-100 relative overflow-hidden">
                  {work.image ? (
                    <img
                      src={work.image}
                      alt={work.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Photo size={36} className="text-slate-300" />
                    </div>
                  )}
                  {work.featured && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400 text-amber-900 rounded text-[10px] font-bold">
                        <Sparkles size={10} />
                        برتر
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-slate-800 mb-0.5">{work.title}</h3>
                  <p className="text-primary-600 text-xs font-medium">{work.studentName}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span>{categoryLabels[work.category] || work.category}</span>
                    {work.year && <span>&middot; {work.year}</span>}
                  </div>
                  {work.description && (
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 leading-5">{work.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-20">
            <Photo size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base text-slate-500">آثار هنرجویان به زودی نمایش داده خواهد شد</p>
            <p className="text-slate-400 text-sm mt-1">از طریق پنل مدیریت می‌توانید آثار را اضافه کنید</p>
          </div>
        )}
      </div>
    </div>
  );
}
