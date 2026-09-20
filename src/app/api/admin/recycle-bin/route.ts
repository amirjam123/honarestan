import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

const MODELS = {
  news: "news",
  gallery: "gallery",
  teachers: "teachers",
  courses: "courses",
  "student-works": "studentWorks",
  events: "events",
  messages: "messages",
} as const;

type ModelKey = keyof typeof MODELS;

function getModelDelegate(model: string) {
  const map: Record<string, unknown> = {
    news: prisma.news,
    gallery: prisma.gallery,
    teachers: prisma.teacher,
    courses: prisma.course,
    "student-works": prisma.studentWork,
    events: prisma.event,
    messages: prisma.contactMessage,
  };
  return map[model] as {
    findMany: (args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
    update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    delete: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
    count: (args?: Record<string, unknown>) => Promise<number>;
  } | null;
}

function getTitleField(model: string): string {
  const map: Record<string, string> = {
    news: "title",
    gallery: "title",
    teachers: "name",
    courses: "title",
    "student-works": "title",
    events: "title",
    messages: "name",
  };
  return map[model] || "title";
}

// GET: List deleted items
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    if (model && model !== "all") {
      const delegate = getModelDelegate(model);
      if (!delegate) {
        return NextResponse.json({ error: "Invalid model" }, { status: 400 });
      }

      const where: Record<string, unknown> = {
        deletedAt: { not: null },
      };

      if (search) {
        const titleField = getTitleField(model);
        where[titleField] = { contains: search, mode: "insensitive" };
      }

      const [items, total] = await Promise.all([
        delegate.findMany({
          where,
          orderBy: { deletedAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        delegate.count({ where }),
      ]);

      return NextResponse.json({
        items: items.map((item) => ({ ...item, _model: model })),
        total,
        page,
        pages: Math.ceil(total / limit),
      });
    }

    // Fetch deleted items from all models
    const allModels: ModelKey[] = ["news", "gallery", "teachers", "courses", "student-works", "events", "messages"];
    const results = await Promise.all(
      allModels.map(async (m) => {
        const delegate = getModelDelegate(m)!;
        const titleField = getTitleField(m);
        const where: Record<string, unknown> = { deletedAt: { not: null } };
        if (search) {
          where[titleField] = { contains: search, mode: "insensitive" };
        }
        const items = await delegate.findMany({
          where,
          orderBy: { deletedAt: "desc" },
          take: 20,
        }) as Record<string, unknown>[];
        return items.map((item) => ({ ...item, _model: m }));
      })
    );

    const allItems = (results.flat() as Record<string, unknown>[])
      .sort((a, b) => {
        const dateA = a.deletedAt ? new Date(String(a.deletedAt)).getTime() : 0;
        const dateB = b.deletedAt ? new Date(String(b.deletedAt)).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);

    return NextResponse.json({ items: allItems, total: allItems.length, page: 1, pages: 1 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch deleted items" }, { status: 500 });
  }
}

// PUT: Restore a deleted item
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { model, id } = body;

    if (!model || !id) {
      return NextResponse.json({ error: "Model and ID are required" }, { status: 400 });
    }

    const delegate = getModelDelegate(model);
    if (!delegate) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    const item = await delegate.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });

    const ip = getClientIp(request);
    await logSecurityEvent({
      event: "record_restore",
      ip,
      username: admin.username,
      details: `Restored ${model} item ${id}`,
      path: "/api/admin/recycle-bin",
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to restore item" }, { status: 500 });
  }
}

// DELETE: Permanently delete an item
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(request.url);
    const model = searchParams.get("model");
    const id = searchParams.get("id");

    if (!model || !id) {
      return NextResponse.json({ error: "Model and ID are required" }, { status: 400 });
    }

    const delegate = getModelDelegate(model);
    if (!delegate) {
      return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    await delegate.delete({ where: { id } });

    const ip = getClientIp(request);
    await logSecurityEvent({
      event: "record_delete_permanent",
      ip,
      username: admin.username,
      details: `Permanently deleted ${model} item ${id}`,
      path: "/api/admin/recycle-bin",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to permanently delete item" }, { status: 500 });
  }
}
