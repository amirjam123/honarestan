import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface SearchResult {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  excerpt: string;
  image: string | null;
  href: string;
  createdAt: string;
}

const MAX_PER_TYPE = 5;

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const where = { contains: q, mode: "insensitive" as const };

    const [
      news,
      teachers,
      gallery,
      studentWorks,
      messages,
      tickets,
      pages,
    ] = await Promise.all([
      // News
      prisma.news.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: where },
            { content: where },
            { excerpt: where },
          ],
        },
        select: {
          id: true,
          title: true,
          excerpt: true,
          image: true,
          slug: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Teachers
      prisma.teacher.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: where },
            { title: where },
            { bio: where },
            { specialty: where },
          ],
        },
        select: {
          id: true,
          name: true,
          title: true,
          specialty: true,
          bio: true,
          image: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Gallery
      prisma.gallery.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: where },
            { description: where },
            { category: where },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Student Works
      prisma.studentWork.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: where },
            { studentName: where },
            { description: where },
            { category: where },
          ],
        },
        select: {
          id: true,
          title: true,
          studentName: true,
          description: true,
          image: true,
          category: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Contact Messages
      prisma.contactMessage.findMany({
        where: {
          deletedAt: null,
          OR: [
            { name: where },
            { email: where },
            { subject: where },
            { message: where },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Tickets
      prisma.ticket.findMany({
        where: {
          OR: [
            { subject: where },
            { userName: where },
            { userEmail: where },
          ],
        },
        select: {
          id: true,
          subject: true,
          userName: true,
          userEmail: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: MAX_PER_TYPE,
      }),

      // Pages
      prisma.page.findMany({
        where: {
          OR: [
            { title: where },
            { content: where },
            { slug: where },
          ],
        },
        select: {
          id: true,
          title: true,
          content: true,
          slug: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: MAX_PER_TYPE,
      }),
    ]);

    // Build results
    const results: SearchResult[] = [];

    news.forEach((item) => {
      results.push({
        id: item.id,
        type: "news",
        typeLabel: "اخبار",
        title: item.title,
        excerpt: item.excerpt || stripHtml(item.title),
        image: item.image,
        href: `/news/${item.id}`,
        createdAt: item.createdAt.toISOString(),
      });
    });

    teachers.forEach((item) => {
      results.push({
        id: item.id,
        type: "teachers",
        typeLabel: "اساتید",
        title: item.name,
        excerpt: item.specialty || item.title || stripHtml(item.bio || ""),
        image: item.image,
        href: "/teachers",
        createdAt: item.createdAt.toISOString(),
      });
    });

    gallery.forEach((item) => {
      results.push({
        id: item.id,
        type: "gallery",
        typeLabel: "گالری",
        title: item.title,
        excerpt: item.description || item.category,
        image: item.image,
        href: "/gallery",
        createdAt: item.createdAt.toISOString(),
      });
    });

    studentWorks.forEach((item) => {
      results.push({
        id: item.id,
        type: "student-works",
        typeLabel: "آثار هنرجویان",
        title: item.title,
        excerpt: `${item.studentName}${item.description ? " — " + stripHtml(item.description) : ""}`,
        image: item.image,
        href: "/student-works",
        createdAt: item.createdAt.toISOString(),
      });
    });

    messages.forEach((item) => {
      results.push({
        id: item.id,
        type: "messages",
        typeLabel: "پیام‌ها",
        title: item.subject || item.name,
        excerpt: `${item.name} — ${item.email}${item.message ? ": " + stripHtml(item.message).slice(0, 100) : ""}`,
        image: null,
        href: "/messages",
        createdAt: item.createdAt.toISOString(),
      });
    });

    tickets.forEach((item) => {
      const statusLabel =
        item.status === "open" ? "باز" : item.status === "answered" ? "پاسخ داده شده" : "بسته شده";
      results.push({
        id: item.id,
        type: "tickets",
        typeLabel: "تیکت‌ها",
        title: item.subject,
        excerpt: `${item.userName} — ${statusLabel}`,
        image: null,
        href: `/tickets`,
        createdAt: item.createdAt.toISOString(),
      });
    });

    pages.forEach((item) => {
      results.push({
        id: item.id,
        type: "pages",
        typeLabel: "صفحات",
        title: item.title,
        excerpt: `/${item.slug}`,
        image: null,
        href: `/pages`,
        createdAt: item.updatedAt.toISOString(),
      });
    });

    return NextResponse.json({
      results,
      total: results.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&[^;]+;/g, " ")
    .trim()
    .slice(0, 150);
}
