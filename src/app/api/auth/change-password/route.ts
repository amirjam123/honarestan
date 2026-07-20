import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, hashPassword, verifyPassword } from "@/lib/auth";
import { checkPasswordStrength, sanitizePassword } from "@/lib/password";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const ip = getClientIp(request);
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "رمز عبور فعلی و جدید الزامی است" },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedCurrent = sanitizePassword(currentPassword);
    const sanitizedNew = sanitizePassword(newPassword);

    // Check new password strength
    const strength = checkPasswordStrength(sanitizedNew);
    if (!strength.isValid) {
      return NextResponse.json(
        { 
          error: "رمز عبور جدید به اندازه کافی قوی نیست",
          feedback: strength.feedback,
          score: strength.score,
        },
        { status: 400 }
      );
    }

    // Get current user
    const user = await prisma.adminUser.findUnique({
      where: { id: admin.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    // Verify current password
    const isValid = await verifyPassword(sanitizedCurrent, user.passwordHash);
    if (!isValid) {
      await logSecurityEvent({
        event: "password_change",
        ip,
        username: admin.username,
        details: "Failed - invalid current password",
        path: "/api/auth/change-password",
      });

      return NextResponse.json(
        { error: "رمز عبور فعلی اشتباه است" },
        { status: 401 }
      );
    }

    // Hash and save new password
    const newHash = await hashPassword(sanitizedNew);
    await prisma.adminUser.update({
      where: { id: admin.userId },
      data: { passwordHash: newHash },
    });

    // Log password change
    await logSecurityEvent({
      event: "password_change",
      ip,
      username: admin.username,
      details: "Success",
      path: "/api/auth/change-password",
    });

    return NextResponse.json({ 
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Password change error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
