import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await prisma.principalProfile.findFirst();
    return NextResponse.json(profile || null);
  } catch (error) {
    console.error("Error fetching principal profile:", error);
    return NextResponse.json({ error: "خطا در دریافت اطلاعات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const existing = await prisma.principalProfile.findFirst();

    const data = {
      name: body.name || "",
      photo: body.photo || null,
      position: body.position || "",
      biography: body.biography || "",
      welcomeMessage: body.welcomeMessage || "",
      resume: body.resume || "",
      achievements: body.achievements || "[]",
      contactInfo: body.contactInfo || null,
      published: body.published ?? true,
    };

    let profile;
    if (existing) {
      profile = await prisma.principalProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      profile = await prisma.principalProfile.create({ data });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating principal profile:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی اطلاعات" }, { status: 500 });
  }
}
