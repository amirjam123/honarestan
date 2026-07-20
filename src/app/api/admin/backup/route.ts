import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST() {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(new Request("http://localhost"));

    // Run backup script
    const scriptPath = path.join(process.cwd(), "scripts", "backup.sh");
    
    try {
      await fs.access(scriptPath);
    } catch {
      return NextResponse.json(
        { error: "Backup script not found" },
        { status: 500 }
      );
    }

    const { stdout, stderr } = await execAsync(`bash "${scriptPath}"`, {
      cwd: process.cwd(),
      env: { ...process.env, BACKUP_DIR: "./backups" },
    });

    // Log backup action
    await logSecurityEvent({
      event: "admin_action",
      ip,
      username: admin.username,
      details: "Backup created",
      path: "/api/admin/backup",
    });

    return NextResponse.json({
      success: true,
      message: "بکاپ با موفقیت ایجاد شد",
      output: stdout,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Backup error:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد بکاپ" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await requireAdmin();

    const backupDir = path.join(process.cwd(), "backups");
    
    try {
      await fs.access(backupDir);
    } catch {
      return NextResponse.json({ backups: [] });
    }

    const files = await fs.readdir(backupDir);
    const backups = files
      .filter(f => f.startsWith("db_backup_") && f.endsWith(".sqlite"))
      .map(f => {
        const timestamp = f.replace("db_backup_", "").replace(".sqlite", "");
        return {
          timestamp,
          database: f,
          uploads: files.includes(`uploads_backup_${timestamp}.tar.gz`),
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return NextResponse.json({ backups });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to list backups" }, { status: 500 });
  }
}
