import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import NewsCard from "@/components/ui/NewsCard";
import { formatDate } from "@/lib/utils";
import { Chart } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <Hero title="اخبار و اطلاعیه‌ها" subtitle="آخرین اخبار و رویدادهای هنرستان هادی" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
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
          <div className="text-center text-slate-400 py-20">
            <Chart size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base text-slate-500">هنوز خبری منتشر نشده است</p>
            <p className="text-slate-400 text-sm mt-1">اخبار به زودی اضافه خواهند شد</p>
          </div>
        )}
      </div>
    </div>
  );
}
