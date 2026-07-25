import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

// GET: List media items with advanced filtering
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const mimeType = searchParams.get("mimeType");
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const where: Record<string, unknown> = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { alt: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
        { tags: { contains: search, mode: "insensitive" } },
        { filename: { contains: search, mode: "insensitive" } },
      ];
    }

    if (folder && folder !== "all") {
      where.folder = folder;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    if (tag) {
      where.tags = { contains: tag, mode: "insensitive" };
    }

    if (mimeType && mimeType !== "all") {
      if (mimeType === "image") {
        where.mimeType = { startsWith: "image/" };
      } else if (mimeType === "video") {
        where.mimeType = { startsWith: "video/" };
      } else if (mimeType === "document") {
        where.OR = [
          { mimeType: { startsWith: "application/pdf" } },
          { mimeType: { startsWith: "application/msword" } },
          { mimeType: { startsWith: "application/vnd.openxmlformats" } },
          { mimeType: { startsWith: "text/" } },
        ];
      }
    }

    let orderBy: Record<string, string>;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "name":
        orderBy = { originalName: "asc" };
        break;
      case "name-desc":
        orderBy = { originalName: "desc" };
        break;
      case "size":
        orderBy = { size: "asc" };
        break;
      case "size-desc":
        orderBy = { size: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [items, total, folders, categories, tags, stats] = await Promise.all([
      prisma.mediaItem.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.mediaItem.count({ where }),
      prisma.mediaItem.findMany({
        where: { deletedAt: null },
        select: { folder: true },
        distinct: ["folder"],
      }),
      prisma.mediaItem.findMany({
        where: { deletedAt: null },
        select: { category: true },
        distinct: ["category"],
      }),
      prisma.mediaItem.findMany({
        where: { deletedAt: null },
        select: { tags: true },
      }),
      prisma.mediaItem.aggregate({
        where: { deletedAt: null },
        _sum: { size: true },
        _count: true,
      }),
    ]);

    // Extract unique tags from all items
    const allTags = new Set<string>();
    tags.forEach((item) => {
      try {
        const parsed = JSON.parse(item.tags);
        if (Array.isArray(parsed)) {
          parsed.forEach((t: string) => allTags.add(t));
        }
      } catch {
        // ignore
      }
    });

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.ceil(total / limit),
      folders: folders.map((f) => f.folder),
      categories: categories.map((c) => c.category),
      tags: Array.from(allTags).sort(),
      stats: {
        totalSize: stats._sum.size || 0,
        totalCount: stats._count,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

// POST: Upload or create media item
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);

    const body = await request.json();
    const {
      filename,
      originalName,
      url,
      mimeType,
      size,
      width,
      height,
      alt,
      title,
      caption,
      folder,
      tags,
      category,
    } = body;

    if (!url || !originalName || !mimeType) {
      return NextResponse.json(
        { error: "url, originalName, and mimeType are required" },
        { status: 400 }
      );
    }

    const item = await prisma.mediaItem.create({
      data: {
        filename: filename || originalName,
        originalName,
        url,
        mimeType,
        size: size || 0,
        width: width || null,
        height: height || null,
        alt: alt || null,
        title: title || null,
        caption: caption || null,
        folder: folder || "uploads",
        tags: tags ? JSON.stringify(tags) : "[]",
        category: category || "general",
        uploadedBy: admin.username,
      },
    });

    await logSecurityEvent({
      event: "file_upload",
      ip,
      username: admin.username,
      details: `Media uploaded: ${originalName} (${(size / 1024).toFixed(1)}KB)`,
      path: "/api/media",
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create media item" }, { status: 500 });
  }
}

// PUT: Update media item, restore, or replace
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);

    const body = await request.json();
    const { id, restore, permanentDelete, bulkDelete, bulkRestore, ...data } = body;

    // Bulk restore
    if (bulkRestore && Array.isArray(bulkRestore)) {
      const results = await prisma.mediaItem.updateMany({
        where: { id: { in: bulkRestore } },
        data: { deletedAt: null, deletedBy: null },
      });

      await logSecurityEvent({
        event: "media_bulk_restore",
        ip,
        username: admin.username,
        details: `Bulk restored ${results.count} media items`,
        path: "/api/media",
      });

      return NextResponse.json({ success: true, count: results.count });
    }

    // Bulk permanent delete
    if (bulkDelete && Array.isArray(bulkDelete)) {
      const results = await prisma.mediaItem.deleteMany({
        where: { id: { in: bulkDelete } },
      });

      await logSecurityEvent({
        event: "media_bulk_delete_permanent",
        ip,
        username: admin.username,
        details: `Bulk permanently deleted ${results.count} media items`,
        path: "/api/media",
      });

      return NextResponse.json({ success: true, count: results.count });
    }

    // Single restore
    if (id && restore) {
      const item = await prisma.mediaItem.update({
        where: { id },
        data: { deletedAt: null, deletedBy: null },
      });

      await logSecurityEvent({
        event: "media_restore",
        ip,
        username: admin.username,
        details: `Restored media: ${item.originalName}`,
        path: "/api/media",
      });

      return NextResponse.json(item);
    }

    // Single permanent delete
    if (id && permanentDelete) {
      await prisma.mediaItem.delete({ where: { id } });

      await logSecurityEvent({
        event: "media_delete_permanent",
        ip,
        username: admin.username,
        details: `Permanently deleted media item ${id}`,
        path: "/api/media",
      });

      return NextResponse.json({ success: true });
    }

    // Regular update
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (data.tags && Array.isArray(data.tags)) {
      data.tags = JSON.stringify(data.tags);
    }

    const item = await prisma.mediaItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to update media item" }, { status: 500 });
  }
}

// DELETE: Soft delete or permanent delete media item
export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    if (permanent) {
      await prisma.mediaItem.delete({ where: { id } });

      await logSecurityEvent({
        event: "media_delete_permanent",
        ip,
        username: admin.username,
        details: `Permanently deleted media item ${id}`,
        path: "/api/media",
      });
    } else {
      await prisma.mediaItem.update({
        where: { id },
        data: { deletedAt: new Date(), deletedBy: admin.username },
      });

      await logSecurityEvent({
        event: "media_delete",
        ip,
        username: admin.username,
        details: `Soft deleted media item ${id}`,
        path: "/api/media",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to delete media item" }, { status: 500 });
  }
}
