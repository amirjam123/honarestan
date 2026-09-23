import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const ip = searchParams.get("ip");
    const username = searchParams.get("username");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (ip) where.ip = ip;
    if (username) where.username = username;

    const [attempts, total] = await Promise.all([
      prisma.loginAttempt.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.loginAttempt.count({ where }),
    ]);

    // Get summary stats
    const [successCount, failedCount, uniqueIps] = await Promise.all([
      prisma.loginAttempt.count({ where: { ...where, success: true } }),
      prisma.loginAttempt.count({ where: { ...where, success: false } }),
      prisma.loginAttempt.findMany({
        where,
        distinct: ["ip"],
        select: { ip: true },
      }),
    ]);

    return NextResponse.json({
      attempts,
      stats: {
        total,
        success: successCount,
        failed: failedCount,
        uniqueIps: uniqueIps.length,
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch login attempts" }, { status: 500 });
  }
}
