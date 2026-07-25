import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap() {
  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/gallery`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/courses`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/events`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/teachers`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/student-works`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
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
