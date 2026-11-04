import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import ImageLightbox from "@/components/ui/ImageLightbox";
import JsonLd from "@/components/ui/JsonLd";
import { generateSeoMetadata, generateBreadcrumbJsonLd, generateWebSiteJsonLd, getSeoForPage, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gallery = await prisma.gallery.findFirst({
    where: { id, deletedAt: null },
  });
  if (!gallery) return {};
  return generateSeoMetadata("/gallery/" + id);
}

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gallery = await prisma.gallery.findFirst({
    where: { id, deletedAt: null },
  });
  if (!gallery) notFound();

  const seo = await getSeoForPage("/gallery/" + id);
  return (
    <div>
      <JsonLd data={generateWebSiteJsonLd()} />
      <h1 className="text-2xl font-bold">{gallery.title}</h1>
      {gallery.image && (
        <ImageLightbox src={gallery.image} alt={gallery.title} />
      )}
      <p>{gallery.description || ""}</p>
      <Link href="/gallery" className="mt-4 text-primary-600 hover:text-primary-700">
        بازگشت به گالری
      </Link>
    </div>
  );
}
