import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sanitizeString, validateEmail, validateRequired, validateLength, validateInput } from "@/lib/validation";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

// Rate limiting for contact form
const contactRateLimit = new Map<string, { count: number; resetAt: number }>();
const CONTACT_RATE_LIMIT = 5; // Max messages per window
const CONTACT_RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = contactRateLimit.get(ip);

  if (!record || now > record.resetAt) {
    contactRateLimit.set(ip, { count: 1, resetAt: now + CONTACT_RATE_WINDOW });
    return true;
  }

  if (record.count >= CONTACT_RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET() {
  try {
    await requireAdmin();
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(messages);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check rate limit
    if (!checkContactRateLimit(ip)) {
      await logSecurityEvent({
        event: "rate_limit_hit",
        ip,
        path: "/api/contact",
      });

      return NextResponse.json(
        { error: "تعداد پیام‌های ارسالی زیاد بود. لطفاً بعداً تلاش کنید." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    const validation = validateInput(body, {
      name: (v) => validateRequired(v, "نام") || validateLength(v as string, 2, 100, "نام"),
      email: (v) => validateRequired(v, "ایمیل") || (!validateEmail(v as string) ? "ایمیل نامعتبر است" : null),
      message: (v) => validateRequired(v, "پیام") || validateLength(v as string, 10, 5000, "پیام"),
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors[0] },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeString(name),
      email: sanitizeString(email).toLowerCase(),
      phone: phone ? sanitizeString(phone) : null,
      subject: subject ? sanitizeString(subject) : null,
      message: sanitizeString(message),
    };

    await prisma.contactMessage.create({
      data: sanitizedData,
    });

    await logSecurityEvent({
      event: "record_create",
      ip,
      details: `Contact message from ${sanitizedData.email}`,
      path: "/api/contact",
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
