import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await requireAdmin();

    await Promise.all([
      prisma.siteSetting.upsert({
        where: { key: "setup_complete" },
        update: { value: "false" },
        create: { key: "setup_complete", value: "false" },
      }),
      prisma.siteSetting.upsert({
        where: { key: "setup_skipped" },
        update: { value: "false" },
        create: { key: "setup_skipped", value: "false" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error resetting setup:", error);
    return NextResponse.json(
      { error: "خطا در بازنشانی وضعیت راه‌اندازی" },
      { status: 500 }
    );
  }
}
