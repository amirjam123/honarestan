import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import { generateSeoMetadata, getSeoForPage, generateBreadcrumbJsonLd, generateWebPageJsonLd, generateJsonLd, SITE_URL } from "@/lib/seo";
import { ArrowLeft, Calendar } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let news = null;
  try {
    news = await prisma.news.findFirst({
      where: { slug },
      select: { title: true, excerpt: true, image: true, deletedAt: true },
    });
  } catch {
    return {};
  }
  if (!news || news.deletedAt) return {};
  const seo = await getSeoForPage(`/news/${slug}`);
  const canonical = seo.canonicalUrl || `${SITE_URL}/news/${slug}`;
  const ogImage = news.image || `${SITE_URL}/og-default.png`;
  return {
    title: seo.metaTitle || news.title,
    description: seo.metaDescription || news.excerpt,
    alternates: { canonical },
    openGraph: {
      title: seo.ogTitle || news.title,
      description: seo.ogDescription || news.excerpt,
      url: canonical,
      type: "article" as const,
      images: news.image ? [{ url: news.image, width: 1200, height: 630, alt: news.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || news.title,
      description: seo.twitterDescription || seo.ogDescription || news.excerpt,
      images: [seo.twitterImage || ogImage],
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let news = null;
  try {
    news = await prisma.news.findFirst({ where: { slug } });
  } catch {
    notFound();
  }

  if (!news || !news.published || news.deletedAt) notFound();

  const seo = await getSeoForPage(`/news/${slug}`);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <JsonLd data={generateWebPageJsonLd(`/news/${slug}`, news.title, news.excerpt || news.title)} />
      {generateJsonLd(`/news/${slug}`, seo) && <JsonLd data={generateJsonLd(`/news/${slug}`, seo)!} />}
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: news.title,
        description: news.excerpt,
        image: news.image,
        datePublished: news.createdAt.toISOString(),
        dateModified: news.updatedAt.toISOString(),
        author: { "@type": "Organization", name: "هنرستان هادی", "@id": `${SITE_URL}#organization` },
        publisher: {
          "@type": "Organization",
          name: "هنرستان هادی",
          "@id": `${SITE_URL}#organization`,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${slug}#webpage` },
        inLanguage: "fa",
      }} />
      <JsonLd data={generateBreadcrumbJsonLd([
        { name: "صفحه اصلی", url: SITE_URL },
        { name: "اخبار", url: `${SITE_URL}/news` },
        { name: news.title, url: `${SITE_URL}/news/${slug}` },
      ])} />
      <Link
        href="/news"
        className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 mb-8 transition-colors text-sm font-medium"
      >
        <ArrowLeft size={16} />
        بازگشت به اخبار
      </Link>

      <article className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {news.image && (
          <div className="aspect-[16/9] bg-slate-100">
            <img
              src={news.image}
              alt={news.title}
              width={1200}
              height={675}
              fetchPriority="high"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 lg:p-10">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
            <Calendar size={14} />
            <span>{formatDate(news.createdAt)}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-6 text-slate-900 leading-snug">{news.title}</h1>
          <div className="prose-content text-slate-600">
            {news.content.split("\n").map((paragraph, i) => (
              <p key={i}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
