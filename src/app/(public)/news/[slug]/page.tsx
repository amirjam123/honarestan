import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/ui/JsonLd";
import { generateSeoMetadata, getSeoForPage } from "@/lib/seo";
import { ArrowLeft, Calendar } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await prisma.news.findUnique({ where: { slug }, select: { title: true, excerpt: true } });
  if (!news) return {};
  const seo = await getSeoForPage(`/news/${slug}`);
  return {
    title: seo.metaTitle || news.title,
    description: seo.metaDescription || news.excerpt,
    openGraph: { title: seo.ogTitle || news.title, description: seo.ogDescription || news.excerpt },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await prisma.news.findUnique({
    where: { slug },
  });

  if (!news || !news.published) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: news.title,
        description: news.excerpt,
        image: news.image,
        datePublished: news.createdAt.toISOString(),
        publisher: { "@type": "Organization", name: "هنرستان هادی" },
      }} />
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
