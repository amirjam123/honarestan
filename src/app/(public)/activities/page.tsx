import type { Metadata } from "next";
import Link from "next/link";
import { Photo, ArrowLeft } from "../components/icons";
import { getActivities } from "../lib/activities";
import ActivitiesList from "../components/ui/ActivitiesList";

const PAGE_SIZE = 12;

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "فعالیت‌ها | هنرستان هادی",
    description: "آخرین اخبار، تصاویر و رویدادهای هنرستان هادی.",
  };
}

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const rawType = typeof params.type === "string" ? params.type : undefined;
  const rawPage = typeof params.page === "string" ? params.page : undefined;

  let activityType: "gallery" | "news" | "event" | undefined;
  if (rawType === "gallery" || rawType === "news" || rawType === "event") {
    activityType = rawType;
  }

  const pageNumber = Math.max(1, Number.parseInt(rawPage ?? "1", 10) || 1);

  const { items } = await getActivities({ type: activityType });

  const startIndex = (pageNumber - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, items.length);

  return (
    <div>
      <section className="bg-[#0c1929] rounded-2xl p-8 lg:p-14 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-primary-300 text-xs font-medium uppercase tracking-wider">
                فعالیت‌ها
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold mt-2">آرشیو فعالیت‌ها</h1>
              <p className="text-slate-300 mt-2 text-sm max-w-2xl">
                آخرین اخبار، تصاویر و رویدادهای منتشر شده هنرستان هادی.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              <ArrowLeft size={16} />
              بازگشت به خانه
            </Link>
            <form method="get" className="flex flex-wrap items-center gap-2" role="group" aria-label="فیلتر فعالیت‌ها">
              <label htmlFor="activity-filter" className="text-xs text-slate-500">
                نوع فعالیت
              </label>
              <select
                id="activity-filter"
                name="type"
                defaultValue=""
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
              >
                <option value="">همه گونه‌ها</option>
                <option value="news">خبر</option>
                <option value="gallery">گالری</option>
                <option value="event">رویداد</option>
              </select>
              <button
                type="submit"
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 transition-colors"
              >
                فیلتر
              </button>
            </form>

            <div className="mt-8 max-w-2xl">
              {items.length === 0 ? (
                <p className="text-xs text-slate-400">هنوز فعالیتی منتشر نشده است.</p>
              ) : (
                <p className="text-xs text-slate-400">
                  {startIndex + 1} تا {endIndex} از {items.length} فعالیت
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {items.length === 0 ? (
          <div className="text-center py-20">
            <Photo className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-4 text-sm text-slate-500">
              این مدت فعالیتی منتشر نشده است.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={16} />
              برگرد به صفحه اصلی
            </Link>
          </div>
        ) : (
          <ActivitiesList
            activities={items}
            pageNumber={pageNumber}
            hasPreviousPage={pageNumber > 1}
            hasNextPage={endIndex < items.length}
            totalCount={items.length}
          />
        )}
      </div>
    </div>
  );
}
