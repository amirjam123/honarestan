import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await prisma.schoolProfile.findFirst();
    return NextResponse.json(profile || null);
  } catch (error) {
    console.error("Error fetching school profile:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await prisma.schoolProfile.findFirst();

    const data = {
      overview: body.overview || "",
      history: body.history || "",
      vision: body.vision || "",
      mission: body.mission || "",
      educationalGoals: body.educationalGoals || "",
      departments: body.departments || "",
      facilities: body.facilities || "",
      statistics: body.statistics || "{}",
      galleryImages: body.galleryImages || "[]",
      additionalInfo: body.additionalInfo || "",
      published: body.published ?? true,
    };

    let profile;
    if (existing) {
      profile = await prisma.schoolProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      profile = await prisma.schoolProfile.create({ data });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating school profile:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی اطلاعات" }, { status: 500 });
  }
}
