import { prisma } from "@/lib/prisma";
import Hero from "@/components/ui/Hero";
import GalleryItem from "@/components/ui/GalleryItem";
import { Photo } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const items = await prisma.gallery.findMany({
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div>
      <Hero title="گالری تصاویر" subtitle="نمایش آثار هنری و تصاویر هنرستان" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {items.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <span className="px-3.5 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium">
                همه
              </span>
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <GalleryItem
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  image={item.image}
                  description={item.description}
                  category={item.category}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 py-20">
            <Photo size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base text-slate-500">گالری در حال تکمیل است</p>
            <p className="text-slate-400 text-sm mt-1">تصاویر به زودی اضافه خواهند شد</p>
          </div>
        )}
      </div>
    </div>
  );
}
