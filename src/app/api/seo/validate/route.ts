import { NextRequest, NextResponse } from "next/server";

interface SeoValidation {
  field: string;
  status: "ok" | "warning" | "error";
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metaTitle, metaDescription, canonicalUrl, ogTitle, ogDescription, ogImage, twitterTitle, twitterDescription, twitterImage } = body;

    const results: SeoValidation[] = [];

    // Meta Title validation
    if (!metaTitle) {
      results.push({ field: "metaTitle", status: "error", message: "عنوان meta الزامی است" });
    } else if (metaTitle.length < 30) {
      results.push({ field: "metaTitle", status: "warning", message: `عنوان meta خیلی کوتاه است (${metaTitle.length} کاراکتر). حداقل ۳۰ کاراکتر توصیه می‌شود` });
    } else if (metaTitle.length > 60) {
      results.push({ field: "metaTitle", status: "warning", message: `عنوان meta خیلی بلند است (${metaTitle.length} کاراکتر). حداکثر ۶۰ کاراکتر توصیه می‌شود` });
    } else {
      results.push({ field: "metaTitle", status: "ok", message: `عنوان meta مناسب است (${metaTitle.length} کاراکتر)` });
    }

    // Meta Description validation
    if (!metaDescription) {
      results.push({ field: "metaDescription", status: "error", message: "توضیحات meta الزامی است" });
    } else if (metaDescription.length < 70) {
      results.push({ field: "metaDescription", status: "warning", message: `توضیحات meta خیلی کوتاه است (${metaDescription.length} کاراکتر). حداقل ۷۰ کاراکتر توصیه می‌شود` });
    } else if (metaDescription.length > 160) {
      results.push({ field: "metaDescription", status: "warning", message: `توضیحات meta خیلی بلند است (${metaDescription.length} کاراکتر). حداکثر ۱۶۰ کاراکتر توصیه می‌شود` });
    } else {
      results.push({ field: "metaDescription", status: "ok", message: `توضیحات meta مناسب است (${metaDescription.length} کاراکتر)` });
    }

    // Canonical URL validation
    if (canonicalUrl) {
      try {
        new URL(canonicalUrl);
        results.push({ field: "canonicalUrl", status: "ok", message: "آدرس canonical معتبر است" });
      } catch {
        results.push({ field: "canonicalUrl", status: "error", message: "آدرس canonical نامعتبر است" });
      }
    } else {
      results.push({ field: "canonicalUrl", status: "warning", message: "آدرس canonical تنظیم نشده است" });
    }

    // Open Graph validation
    if (!ogTitle) {
      results.push({ field: "ogTitle", status: "warning", message: "عنوان Open Graph تنظیم نشده است" });
    } else if (ogTitle.length > 95) {
      results.push({ field: "ogTitle", status: "warning", message: `عنوان Open Graph خیلی بلند است (${ogTitle.length} کاراکتر)` });
    } else {
      results.push({ field: "ogTitle", status: "ok", message: `عنوان Open Graph مناسب است (${ogTitle.length} کاراکتر)` });
    }

    if (!ogDescription) {
      results.push({ field: "ogDescription", status: "warning", message: "توضیحات Open Graph تنظیم نشده است" });
    } else if (ogDescription.length > 200) {
      results.push({ field: "ogDescription", status: "warning", message: `توضیحات Open Graph خیلی بلند است (${ogDescription.length} کاراکتر)` });
    } else {
      results.push({ field: "ogDescription", status: "ok", message: `توضیحات Open Graph مناسب است (${ogDescription.length} کاراکتر)` });
    }

    if (!ogImage) {
      results.push({ field: "ogImage", status: "warning", message: "تصویر Open Graph تنظیم نشده است. تصویر OG برای اشتراک‌گذاری در شبکه‌های اجتماعی مهم است" });
    } else {
      results.push({ field: "ogImage", status: "ok", message: "تصویر Open Graph تنظیم شده است" });
    }

    // Twitter Card validation
    if (!twitterTitle) {
      results.push({ field: "twitterTitle", status: "warning", message: "عنوان Twitter تنظیم نشده است" });
    } else {
      results.push({ field: "twitterTitle", status: "ok", message: "عنوان Twitter تنظیم شده است" });
    }

    if (!twitterDescription) {
      results.push({ field: "twitterDescription", status: "warning", message: "توضیحات Twitter تنظیم نشده است" });
    } else {
      results.push({ field: "twitterDescription", status: "ok", message: "توضیحات Twitter تنظیم شده است" });
    }

    if (!twitterImage) {
      results.push({ field: "twitterImage", status: "warning", message: "تصویر Twitter تنظیم نشده است" });
    } else {
      results.push({ field: "twitterImage", status: "ok", message: "تصویر Twitter تنظیم شده است" });
    }

    const errors = results.filter((r) => r.status === "error").length;
    const warnings = results.filter((r) => r.status === "warning").length;
    const oks = results.filter((r) => r.status === "ok").length;

    let score: "excellent" | "good" | "needs_work" | "poor";
    if (errors === 0 && warnings === 0) score = "excellent";
    else if (errors === 0 && warnings <= 3) score = "good";
    else if (errors <= 1) score = "needs_work";
    else score = "poor";

    return NextResponse.json({
      results,
      summary: { errors, warnings, oks, score },
    });
  } catch (error) {
    console.error("Error validating SEO:", error);
    return NextResponse.json(
      { error: "خطا در اعتبارسنجی" },
      { status: 500 }
    );
  }
}
