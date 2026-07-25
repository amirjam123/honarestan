import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://honarestan-hadi.ir";

interface SeoData {
  pagePath: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl?: string | null;
  robots?: string;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  jsonLd?: string;
}

const PAGE_DEFAULTS: Record<string, { title: string; description: string }> = {
  "/": { title: "صفحه اصلی", description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق. آموزش نقاشی، مجسمه‌سازی، خوشنویسی، عکاسی و گرافیک با بهترین اساتید." },
  "/about": { title: "درباره ما", description: "آشنایی با تاریخچه، ارزش‌ها و اهداف هنرستان هادی. مرکز آموزش هنرهای زیبا در تهران." },
  "/gallery": { title: "گالری تصاویر", description: "گالری تصاویر هنرستان هادی. مشاهده آثار هنری هنرجویان و اساتید." },
  "/news": { title: "اخبار", description: "آخرین اخبار و اطلاعیه‌های هنرستان هادی. رویدادها و اخبار آموزشی." },
  "/contact": { title: "تماس با ما", description: "اطلاعات تماس هنرستان هادی. آدرس، تلفن و ایمیل برای ارتباط با ما." },
  "/courses": { title: "دوره‌ها", description: "دوره‌های آموزشی هنرستان هادی. نقاشی، خوشنویسی، مجسمه‌سازی، گرافیک و عکاسی." },
  "/events": { title: "رویدادها", description: "رویدادهای هنرستان هادی. نمایشگاه‌ها، جشنواره‌ها و برنامه‌های ویژه." },
  "/teachers": { title: "اساتید", description: "اساتید مجرب هنرستان هادی. معرفی کادر آموزشی با تجربه." },
  "/student-works": { title: "آثار هنرجویان", description: "آثار هنری خلق شده توسط هنرجویان هنرستان هادی." },
};

export async function getSeoForPage(pagePath: string): Promise<SeoData> {
  const seoSetting = await prisma.seoSetting.findUnique({
    where: { pagePath },
  });

  const defaults = PAGE_DEFAULTS[pagePath] || { title: "", description: "" };

  if (!seoSetting) {
    return {
      pagePath,
      metaTitle: defaults.title || pagePath,
      metaDescription: defaults.description,
    };
  }

  return {
    pagePath: seoSetting.pagePath,
    metaTitle: seoSetting.metaTitle,
    metaDescription: seoSetting.metaDescription,
    canonicalUrl: seoSetting.canonicalUrl,
    robots: seoSetting.robots,
    ogTitle: seoSetting.ogTitle,
    ogDescription: seoSetting.ogDescription,
    ogImage: seoSetting.ogImage,
    ogType: seoSetting.ogType,
    twitterCard: seoSetting.twitterCard,
    twitterTitle: seoSetting.twitterTitle,
    twitterDescription: seoSetting.twitterDescription,
    twitterImage: seoSetting.twitterImage,
    jsonLd: seoSetting.jsonLd,
  };
}

export async function generateSeoMetadata(pagePath: string): Promise<Metadata> {
  const seo = await getSeoForPage(pagePath);
  const canonical = seo.canonicalUrl || `${SITE_URL}${pagePath}`;
  const ogImage = seo.ogImage || seo.twitterImage || `${SITE_URL}/og-default.png`;

  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    robots: seo.robots || "index, follow",
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: canonical,
      siteName: "هنرستان هادی",
      locale: "fa_IR",
      type: (seo.ogType as "website" | "article") || "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: seo.ogTitle || seo.metaTitle,
        },
      ],
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [seo.twitterImage || ogImage],
    },
  };
}

export function generateJsonLd(pagePath: string, seo: SeoData): Record<string, unknown> | null {
  if (!seo.jsonLd || seo.jsonLd === "{}") return null;
  try {
    return JSON.parse(seo.jsonLd);
  } catch {
    return null;
  }
}

export function generateSchoolJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: "Persian",
    },
    sameAs: [],
  };
}

export { SITE_URL };
