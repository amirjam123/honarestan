import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://honarestan-hadi.ir"
).replace(/\/+$/, "");

const ORG_ID = `${SITE_URL}#school`;
const SITE_ID = `${SITE_URL}#website`;

/**
 * اطلاعات قطعی و تأییدشده هنرستان.
 * هیچ مقداری (سال تأسیس، سابقه، آمار، سوابق) بدون تأیید اضافه نمی‌شود.
 */
export const SCHOOL = {
  name: "هنرستان فنی حرفه ای هادی",
  shortName: "هنرستان هادی",
  fields: ["حسابداری", "شبکه و نرم‌افزار"],
  address: "جاجرود، روستای خسروآباد، خیابان سد لتیان، کوچه بوستان",
  phone: "02176201350",
  email: "HonarestanHadi@gmail.com",
  logo: "/icon.svg",
} as const;

const SCHOOL_DESCRIPTION = `${SCHOOL.name} — آموزش فنی و حرفه‌ای در رشته‌های ${SCHOOL.fields.join(" و ")}.`;

/** صفحاتی که فعلاً محتوای واقعی ندارند و نباید ایندکس شوند. */
const NOINDEX_PATHS = new Set(["/teachers", "/events", "/student-works", "/gallery"]);

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
  "/": {
    title: "صفحه اصلی",
    description: SCHOOL_DESCRIPTION,
  },
  "/about": {
    title: "درباره ما",
    description: `معرفی ${SCHOOL.name} و رشته‌های آموزشی ${SCHOOL.fields.join(" و ")}.`,
  },
  "/gallery": { title: "گالری تصاویر", description: `تصاویر ${SCHOOL.name}.` },
  "/news": { title: "اخبار", description: `اخبار و اطلاعیه‌های ${SCHOOL.name}.` },
  "/contact": {
    title: "تماس با ما",
    description: `اطلاعات تماس ${SCHOOL.name}: آدرس، تلفن و ایمیل.`,
  },
  "/events": { title: "رویدادها", description: `رویدادها و برنامه‌های ${SCHOOL.name}.` },
  "/teachers": { title: "کادر آموزشی", description: `معرفی کادر آموزشی ${SCHOOL.name}.` },
  "/student-works": { title: "آثار هنرجویان", description: `آثار هنرجویان ${SCHOOL.name}.` },
};

export async function getSeoForPage(pagePath: string): Promise<SeoData> {
  const seoSetting = await prisma.seoSetting.findUnique({
    where: { pagePath },
  });

  const defaults = PAGE_DEFAULTS[pagePath] || { title: "", description: "" };

  if (!seoSetting) {
    return {
      pagePath,
      // برای مسیرهای بدون پیش‌فرض (مثل صفحه جزئیات خبر) عنوان خالی برگردانده می‌شود
      // تا صفحه بتواند عنوان واقعی رکورد (مثلاً عنوان خبر) را استفاده کند.
      metaTitle: defaults.title,
      metaDescription: defaults.description,
      robots: NOINDEX_PATHS.has(pagePath) ? "noindex, follow" : "index, follow",
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

/** آیا این مسیر باید در sitemap و ایندکس بیاید؟ */
export async function isPageIndexable(pagePath: string): Promise<boolean> {
  if (NOINDEX_PATHS.has(pagePath)) return false;
  const seo = await getSeoForPage(pagePath);
  return !(seo.robots || "").toLowerCase().includes("noindex");
}

export async function generateSeoMetadata(pagePath: string): Promise<Metadata> {
  const seo = await getSeoForPage(pagePath);
  const canonical = seo.canonicalUrl || `${SITE_URL}${pagePath === "/" ? "" : pagePath}`;
  const ogImage = seo.ogImage || seo.twitterImage;

  return {
    // برای صفحه اصلی، عنوان با قالب «%s | نام سایت» دوباره تکرار نشود
    title:
      pagePath === "/"
        ? { absolute: seo.metaTitle || SCHOOL.name }
        : seo.metaTitle || SCHOOL.name,
    description: seo.metaDescription,
    robots: seo.robots || (NOINDEX_PATHS.has(pagePath) ? "noindex, follow" : "index, follow"),
    alternates: {
      canonical: canonical,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle,
      description: seo.ogDescription || seo.metaDescription,
      url: canonical,
      siteName: SCHOOL.name,
      locale: "fa_IR",
      type: (seo.ogType as "website" | "article") || "website",
      // فقط وقتی تصویر واقعی ثبت شده باشد؛ در غیر این صورت هیچ URL شکسته‌ای تولید نمی‌شود
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: seo.ogTitle || seo.metaTitle,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: (seo.twitterCard as "summary" | "summary_large_image") || "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      ...(ogImage ? { images: [ogImage] } : {}),
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

/** آدرس واقعی؛ بدون کدپستی ساختگی و بدون مختصات ساختگی. */
function schoolAddress() {
  return {
    "@type": "PostalAddress",
    addressCountry: "IR",
    addressLocality: "جاجرود، روستای خسروآباد",
    streetAddress: "خیابان سد لتیان، کوچه بوستان",
  };
}

function schoolNode() {
  return {
    "@type": "School",
    "@id": ORG_ID,
    name: SCHOOL.name,
    alternateName: SCHOOL.shortName,
    url: SITE_URL,
    description: SCHOOL_DESCRIPTION,
    address: schoolAddress(),
    telephone: SCHOOL.phone,
    email: SCHOOL.email,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}${SCHOOL.logo}`,
    },
  };
}

export function generateWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SCHOOL.name,
    url: SITE_URL,
    description: SCHOOL_DESCRIPTION,
    inLanguage: "fa-IR",
    publisher: { "@id": ORG_ID },
  };
}

/** تنها هویت سازمانی سایت (School). */
export function generateSchoolJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    ...schoolNode(),
  };
}

/** نگاشت‌های سازگار با کد قدیمی — همگی به همان هویت School اشاره می‌کنند. */
export function generateOrganizationJsonLd(): Record<string, unknown> {
  return { "@context": "https://schema.org", ...schoolNode() };
}

export function generateEducationalOrganizationJsonLd(): Record<string, unknown> {
  return { "@context": "https://schema.org", ...schoolNode() };
}

export function generateLocalBusinessJsonLd(): Record<string, unknown> {
  return { "@context": "https://schema.org", ...schoolNode() };
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
    inLanguage: "fa-IR",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
  };
}

export function generateContactPointJsonLd(
  telephone?: string,
  email?: string
): Record<string, unknown> {
  const contactPoint: Record<string, unknown> = {
    "@type": "ContactPoint",
    contactType: "admissions",
    contactOption: "TollFree",
    availableLanguage: ["fa"],
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
    organizer: { "@id": ORG_ID },
    location: {
      "@type": "Place",
      name: event.location || SCHOOL.name,
      address: schoolAddress(),
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };
  if (event.image) {
    schema.image = event.image;
  }
  return schema;
}

export { SITE_URL, ORG_ID, SITE_ID };
