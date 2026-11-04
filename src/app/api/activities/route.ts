import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch from all relevant models concurrently
    const [news, gallery, events] = await Promise.all([
      // News: only published, no deleted
      prisma.news.findMany({
        where: { deletedAt: null, published: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          excerpt: true,
          image: true,
          createdAt: true,
        },
      }),
      // Gallery: only non-deleted
      prisma.gallery.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          category: true,
          createdAt: true,
        },
      }),
      // Events: only published, no deleted
      prisma.event.findMany({
        where: { published: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          date: true,
          createdAt: true,
        },
      }),
    ]);

    // Transform to a unified format
    const activities = [
      // News items
      ...news.map((n) => ({
        id: n.id,
        type: "news" as const,
        title: n.title,
        excerpt: n.excerpt || "",
        image: n.image,
        date: n.createdAt,
        slug: n.slug,
      })),
      // Gallery items
      ...gallery.map((g) => ({
        id: g.id,
        type: "gallery" as const,
        title: g.title,
        excerpt: g.description || "",
        image: g.image,
        date: g.createdAt,
      })),
      // Events
      ...events.map((e) => ({
        id: e.id,
        type: "event" as const,
        title: e.title,
        excerpt: e.description || "",
        image: e.image,
        date: e.date || e.createdAt,
      })),
    ];

    // Sort all activities by date, newest first
    activities.sort((a, b) => {
      const aDate = a.date instanceof Date ? a.date : new Date(a.date);
      const bDate = b.date instanceof Date ? b.date : new Date(b.date);
      return bDate.getTime() - aDate.getTime();
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Activities fetch error:", error);
    return NextResponse.json({ activities: [] }, { status: 500 });
  }
}