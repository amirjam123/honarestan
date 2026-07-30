import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { deletedAt: null, published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(news);
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, content, excerpt, image, telegramFileId, published } = body;

    let slug = slugify(title);

    // Handle duplicate slugs by appending a counter
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      let counter = 2;
      let newSlug = `${slug}-${counter}`;
      while (await prisma.news.findUnique({ where: { slug: newSlug } })) {
        counter++;
        newSlug = `${slug}-${counter}`;
      }
      slug = newSlug;
    }

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        image: image || null,
        telegramFileId: telegramFileId || null,
        published: published || false,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("News creation error:", error);
    return NextResponse.json({ error: "Failed to create news" }, { status: 500 });
  }
}
