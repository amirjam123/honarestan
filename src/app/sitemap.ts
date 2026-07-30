import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

const STATIC_LAST_MODIFIED = new Date("2026-07-01T00:00:00Z");

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/gallery`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/events`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/teachers`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/student-works`, lastModified: STATIC_LAST_MODIFIED, changeFrequency: "weekly", priority: 0.7 },
  ];

  const news = await prisma.news.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
  });

  const newsPages = news.map((item) => ({
    url: `${SITE_URL}/news/${item.slug}`,
    lastModified: item.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...newsPages];
}
