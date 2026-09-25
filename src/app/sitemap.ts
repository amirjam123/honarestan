import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, isPageIndexable } from "@/lib/seo";

/**
 * صفحات عمومی واقعی سایت.
 * فقط مسیرهایی که هم route عمومی دارند و هم در metadata آن‌ها noindex نیست وارد sitemap می‌شوند.
 */
const PUBLIC_PAGES = ["/", "/about", "/contact", "/news"] as const;

/**
 * صفحاتی که در حال حاضر محتوای واقعی ندارند و موقتاً noindex هستند
 * (teachers, events, student-works, gallery) و صفحات مدیریتی/api که هرگز وارد sitemap نمی‌شوند.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [];

  for (const path of PUBLIC_PAGES) {
    if (!(await isPageIndexable(path))) continue;
    staticPages.push({
      // هماهنگ با canonical صفحات: صفحه اصلی بدون اسلش انتهایی
      url: path === "/" ? SITE_URL : `${SITE_URL}${path}`,
      // بدون lastModified ساختگی: تاریخ واقعی برای صفحات ثابت در دسترس نیست
      changeFrequency: "weekly",
      priority: path === "/" ? 1.0 : 0.7,
    });
  }

  const news = await prisma.news.findMany({
    where: { published: true, deletedAt: null },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${SITE_URL}/news/${item.id}`,
    lastModified: item.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages];
}
