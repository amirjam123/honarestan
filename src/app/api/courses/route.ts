import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(courses);
  } catch {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, description, image, duration, level, sortOrder, published } = body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        image: image || null,
        duration: duration || null,
        level: level || "beginner",
        sortOrder: sortOrder || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}
