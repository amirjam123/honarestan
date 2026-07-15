import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(testimonials);
  } catch {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { name, role, content, image, rating, sortOrder, published } = body;

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role: role || null,
        content,
        image: image || null,
        rating: rating || 5,
        sortOrder: sortOrder || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(testimonial, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}
