import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pagePath: string }> }
) {
  try {
    const { pagePath } = await params;
    const decodedPath = decodeURIComponent(pagePath);
    const seoSetting = await prisma.seoSetting.findUnique({
      where: { pagePath: decodedPath },
    });

    if (!seoSetting) {
      return NextResponse.json(
        { error: "تنظیمات SEO برای این صفحه یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(seoSetting);
  } catch (error) {
    console.error("Error fetching SEO setting:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تنظیمات SEO" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ pagePath: string }> }
) {
  try {
    await requireAdmin();
    const { pagePath } = await params;
    const decodedPath = decodeURIComponent(pagePath);

    await prisma.seoSetting.delete({
      where: { pagePath: decodedPath },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error deleting SEO setting:", error);
    return NextResponse.json(
      { error: "خطا در حذف تنظیمات SEO" },
      { status: 500 }
    );
  }
}
