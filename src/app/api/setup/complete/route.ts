import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await requireAdmin();

    await prisma.siteSetting.upsert({
      where: { key: "setup_complete" },
      update: { value: "true" },
      create: { key: "setup_complete", value: "true" },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error completing setup:", error);
    return NextResponse.json(
      { error: "خطا در ذخیره وضعیت راه‌اندازی" },
      { status: 500 }
    );
  }
}
