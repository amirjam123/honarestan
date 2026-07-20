import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const works = await prisma.studentWork.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(works);
  } catch {
    return NextResponse.json({ error: "Failed to fetch student works" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, studentName, description, image, category, year, featured, published } = body;

    const work = await prisma.studentWork.create({
      data: {
        title,
        studentName,
        description: description || null,
        image,
        category: category || "general",
        year: year || null,
        featured: featured || false,
        published: published !== false,
      },
    });

    return NextResponse.json(work, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create student work" }, { status: 500 });
  }
}
