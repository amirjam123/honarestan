import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const pages = await prisma.page.findMany({ orderBy: { slug: "asc" } });
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { slug, title, content } = body;

    const page = await prisma.page.upsert({
      where: { slug },
      update: { title, content },
      create: { slug, title, content },
    });

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to save page" }, { status: 500 });
  }
}
