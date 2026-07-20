import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(teachers);
  } catch {
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, title, bio, image, specialty, sortOrder, published } = body;

    const teacher = await prisma.teacher.create({
      data: {
        name,
        title,
        bio: bio || null,
        image: image || null,
        specialty: specialty || null,
        sortOrder: sortOrder || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create teacher" }, { status: 500 });
  }
}
