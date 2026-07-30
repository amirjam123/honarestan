import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const [settings, teacherCount, courseCount, newsCount, schoolProfile, principalProfile] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.teacher.count({ where: { deletedAt: null } }),
      prisma.course.count({ where: { deletedAt: null } }),
      prisma.news.count({ where: { deletedAt: null } }),
      prisma.schoolProfile.findFirst(),
      prisma.principalProfile.findFirst(),
    ]);

    const settingsMap = settings.reduce(
      (acc, s) => ({ ...acc, [s.key]: s.value }),
      {} as Record<string, string>
    );

    const setupComplete = settingsMap["setup_complete"] === "true";
    const setupSkipped = settingsMap["setup_skipped"] === "true";

    const steps = {
      changePassword: setupComplete,
      uploadLogo: !!settingsMap["logo_url"],
      schoolName: !!settingsMap["school_name"] && settingsMap["school_name"] !== "هنرستان هادی",
      contactInfo: !!settingsMap["address"] && !!settingsMap["phone"] && !!settingsMap["email"],
      homepage: !!settingsMap["hero_title"] && settingsMap["hero_title"] !== "هنرستان هادی",
      principalProfile: !!principalProfile?.name && !!principalProfile?.welcomeMessage,
      schoolProfile: !!schoolProfile?.overview && schoolProfile.overview.length > 10,
      firstTeacher: teacherCount > 0,
      firstCourse: courseCount > 0,
      firstNews: newsCount > 0,
      verifyWebsite: false,
    };

    const completedCount = Object.values(steps).filter(Boolean).length;
    const totalSteps = Object.keys(steps).length;

    return NextResponse.json({
      setupComplete,
      setupSkipped,
      steps,
      completedCount,
      totalSteps,
      progress: Math.round((completedCount / totalSteps) * 100),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "غیرمجاز" }, { status: 401 });
    }
    console.error("Error checking setup status:", error);
    return NextResponse.json(
      { error: "خطا در بررسی وضعیت راه‌اندازی" },
      { status: 500 }
    );
  }
}
