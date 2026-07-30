import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://honarestan-hadi.ir";

const ORG_ID = `${SITE_URL}#organization`;
const SITE_ID = `${SITE_URL}#website`;

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

export function generateBreadcrumbJsonLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    inLanguage: "fa",
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "هنرستان هادی",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.svg`,
      },
    },
  };
}

export function generateOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
    },
    image: `${SITE_URL}/icon.svg`,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Persian", "Farsi"],
    },
    sameAs: [],
  };
}

export function generateEducationalOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
    },
    image: `${SITE_URL}/icon.svg`,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Persian", "Farsi"],
    },
    sameAs: [],
  };
}

export function generateSchoolJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": ORG_ID,
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
    },
    image: `${SITE_URL}/icon.svg`,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Persian", "Farsi"],
    },
    sameAs: [],
  };
}

export function generateWebPageJsonLd(
  pagePath: string,
  name: string,
  description: string
): Record<string, unknown> {
  const pageUrl = `${SITE_URL}${pagePath}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: name,
    description: description,
    inLanguage: "fa",
    isPartOf: {
      "@type": "WebSite",
      "@id": SITE_ID,
    },
    about: {
      "@type": "Organization",
      "@id": ORG_ID,
    },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: `${SITE_URL}/og-default.png`,
    },
  };
}

export function generateLocalBusinessJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}#localbusiness`,
    name: "هنرستان هادی",
    alternateName: "Honarestan Hadi",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/icon.svg`,
    },
    image: `${SITE_URL}/icon.svg`,
    description: "هنرستان هادی - مرکز آموزش هنرهای زیبا و صنایع خلاق",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 35.6892,
      longitude: 51.389,
    },
    telephone: "",
    email: "",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Persian", "Farsi"],
    },
    areaServed: {
      "@type": "Country",
      name: "ایران",
    },
    sameAs: [],
  };
}

export function generateContactPointJsonLd(
  telephone?: string,
  email?: string
): Record<string, unknown> {
  const contactPoint: Record<string, unknown> = {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Persian", "Farsi"],
  };
  if (telephone) contactPoint.telephone = telephone;
  if (email) contactPoint.email = email;
  return contactPoint;
}

export function generateEventJsonLd(event: {
  title: string;
  description: string;
  date: Date;
  location?: string | null;
  image?: string | null;
  url: string;
}): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.date.toISOString(),
    url: event.url,
    organizer: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "هنرستان هادی",
      url: SITE_URL,
    },
    location: event.location
      ? {
          "@type": "Place",
          name: event.location,
          address: {
            "@type": "PostalAddress",
            addressLocality: "تهران",
            addressCountry: "IR",
          },
        }
      : {
          "@type": "Place",
          name: "هنرستان هادی",
          address: {
            "@type": "PostalAddress",
            addressLocality: "تهران",
            addressCountry: "IR",
          },
        },
    performer: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: "هنرستان هادی",
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
  if (event.image) {
    schema.image = event.image;
  }
  return schema;
}

export { SITE_URL };
