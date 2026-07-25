import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

// Export all data from the database
async function exportAllData() {
  const [news, gallery, teachers, courses, studentWorks, events, pages, settings, contactMessages, tickets, ticketMessages, testimonials] =
    await Promise.all([
      prisma.news.findMany(),
      prisma.gallery.findMany(),
      prisma.teacher.findMany(),
      prisma.course.findMany(),
      prisma.studentWork.findMany(),
      prisma.event.findMany(),
      prisma.page.findMany(),
      prisma.siteSetting.findMany(),
      prisma.contactMessage.findMany(),
      prisma.ticket.findMany(),
      prisma.ticketMessage.findMany(),
      prisma.testimonial.findMany(),
    ]);

  const data = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    tables: {
      news,
      gallery,
      teachers,
      courses,
      studentWorks,
      events,
      pages,
      settings,
      contactMessages,
      tickets,
      ticketMessages,
      testimonials,
    },
  };

  const records =
    news.length +
    gallery.length +
    teachers.length +
    courses.length +
    studentWorks.length +
    events.length +
    pages.length +
    settings.length +
    contactMessages.length +
    tickets.length +
    ticketMessages.length +
    testimonials.length;

  const tableCounts = {
    news: news.length,
    gallery: gallery.length,
    teachers: teachers.length,
    courses: courses.length,
    studentWorks: studentWorks.length,
    events: events.length,
    pages: pages.length,
    settings: settings.length,
    contactMessages: contactMessages.length,
    tickets: tickets.length,
    ticketMessages: ticketMessages.length,
    testimonials: testimonials.length,
  };

  const json = JSON.stringify(data, null, 2);
  const size = new TextEncoder().encode(json).length;

  // Generate checksum
  const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(json));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const checksum = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  return { data, json, size, records, tableCounts, checksum };
}

// GET: List backup history
export async function GET() {
  try {
    await requireAdmin();

    const backups = await prisma.backupLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ backups });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch backups" }, { status: 500 });
  }
}

// POST: Create a backup
export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);

    const body = await request.json().catch(() => ({}));
    const type = body.type || "manual";

    // Create backup log entry
    const backupLog = await prisma.backupLog.create({
      data: {
        type,
        status: "pending",
        createdBy: admin.username,
      },
    });

    try {
      const { json, size, records, tableCounts, checksum } = await exportAllData();

      // Update backup log with completion info
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: "completed",
          size,
          records,
          tables: JSON.stringify(tableCounts),
          checksum,
          completedAt: new Date(),
        },
      });

      await logSecurityEvent({
        event: "admin_action",
        ip,
        username: admin.username,
        details: `Backup created: ${type}, ${records} records, ${size} bytes`,
        path: "/api/admin/backup",
      });

      // Return the backup data as a downloadable JSON
      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="honarestan-backup-${new Date().toISOString().slice(0, 10)}.json"`,
          "X-Backup-Id": backupLog.id,
          "X-Backup-Size": String(size),
          "X-Backup-Records": String(records),
          "X-Backup-Checksum": checksum,
        },
      });
    } catch (error) {
      // Mark backup as failed
      await prisma.backupLog.update({
        where: { id: backupLog.id },
        data: {
          status: "failed",
          notes: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 });
  }
}

// PUT: Verify or restore a backup
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);

    const body = await request.json();
    const { action, backupId, data } = body;

    if (action === "verify") {
      // Verify backup integrity by re-exporting and comparing checksum
      const backup = await prisma.backupLog.findUnique({ where: { id: backupId } });
      if (!backup) {
        return NextResponse.json({ error: "Backup not found" }, { status: 404 });
      }

      const { checksum, records, size } = await exportAllData();

      const isValid = checksum === backup.checksum && records === backup.records;

      await prisma.backupLog.update({
        where: { id: backupId },
        data: { status: isValid ? "verified" : "failed" },
      });

      await logSecurityEvent({
        event: "admin_action",
        ip,
        username: admin.username,
        details: `Backup verification: ${isValid ? "passed" : "failed"} for ${backupId}`,
        path: "/api/admin/backup",
      });

      return NextResponse.json({
        valid: isValid,
        current: { checksum, records, size },
        backup: { checksum: backup.checksum, records: backup.records, size: backup.size },
      });
    }

    if (action === "restore") {
      if (!data || !data.tables) {
        return NextResponse.json({ error: "Invalid backup data" }, { status: 400 });
      }

      const tables = data.tables;
      let restored = 0;

      // Restore in order (respecting foreign keys)
      if (tables.settings) {
        for (const setting of tables.settings) {
          await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: { key: setting.key, value: setting.value },
          });
          restored++;
        }
      }

      if (tables.news) {
        for (const item of tables.news) {
          await prisma.news.upsert({
            where: { slug: item.slug },
            update: { ...item, id: undefined },
            create: { ...item, id: undefined },
          });
          restored++;
        }
      }

      if (tables.gallery) {
        for (const item of tables.gallery) {
          await prisma.gallery.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      if (tables.teachers) {
        for (const item of tables.teachers) {
          await prisma.teacher.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      if (tables.courses) {
        for (const item of tables.courses) {
          await prisma.course.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      if (tables.studentWorks) {
        for (const item of tables.studentWorks) {
          await prisma.studentWork.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      if (tables.events) {
        for (const item of tables.events) {
          await prisma.event.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      if (tables.pages) {
        for (const item of tables.pages) {
          await prisma.page.upsert({
            where: { slug: item.slug },
            update: { ...item, id: undefined },
            create: { ...item, id: undefined },
          });
          restored++;
        }
      }

      if (tables.testimonials) {
        for (const item of tables.testimonials) {
          await prisma.testimonial.upsert({
            where: { id: item.id },
            update: { ...item },
            create: { ...item },
          });
          restored++;
        }
      }

      await logSecurityEvent({
        event: "admin_action",
        ip,
        username: admin.username,
        details: `Backup restored: ${restored} records from ${backupId || "uploaded file"}`,
        path: "/api/admin/backup",
      });

      return NextResponse.json({ success: true, restored });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to process backup action" }, { status: 500 });
  }
}
