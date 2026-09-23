import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const seoSettings = await prisma.seoSetting.findMany({
      orderBy: { pagePath: "asc" },
    });
    return NextResponse.json(seoSettings);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error fetching SEO settings:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات SEO" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { pagePath, metaTitle, metaDescription, canonicalUrl, robots, ogTitle, ogDescription, ogImage, ogType, twitterCard, twitterTitle, twitterDescription, twitterImage, jsonLd } = body;

    if (!pagePath || !metaTitle || !metaDescription) {
      return NextResponse.json(
        { error: "مسیر صفحه، عنوان و توضیحات الزامی هستند" },
        { status: 400 }
      );
    }

    const seoSetting = await prisma.seoSetting.upsert({
      where: { pagePath },
      update: {
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl || null,
        robots: robots || "index, follow",
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        ogType: ogType || "website",
        twitterCard: twitterCard || "summary_large_image",
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        jsonLd: jsonLd || "{}",
      },
      create: {
        pagePath,
        metaTitle,
        metaDescription,
        canonicalUrl: canonicalUrl || null,
        robots: robots || "index, follow",
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImage: ogImage || null,
        ogType: ogType || "website",
        twitterCard: twitterCard || "summary_large_image",
        twitterTitle: twitterTitle || null,
        twitterDescription: twitterDescription || null,
        twitterImage: twitterImage || null,
        jsonLd: jsonLd || "{}",
      },
    });

    return NextResponse.json(seoSetting);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error saving SEO setting:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره تنظیمات SEO" },
      { status: 500 }
    );
  }
}
