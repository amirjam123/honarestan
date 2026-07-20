import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/auth";
import { logSecurityEvent, logLoginAttempt, getClientIp } from "@/lib/security-logger";

// Rate limiting with progressive blocking
const loginAttempts = new Map<string, { 
  count: number; 
  resetAt: number; 
  blockedUntil?: number;
}>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes after max attempts

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Reset if window expired
  if (now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  // Check attempt count
  if (record.count >= MAX_ATTEMPTS) {
    record.blockedUntil = now + BLOCK_DURATION_MS;
    record.resetAt = now + BLOCK_DURATION_MS;
    const retryAfter = Math.ceil(BLOCK_DURATION_MS / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check rate limit
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      await logSecurityEvent({
        event: "rate_limit_hit",
        ip,
        details: `Blocked for ${rateLimit.retryAfter} seconds`,
        path: "/api/auth",
      });

      return NextResponse.json(
        { 
          error: "تعداد تلاش‌های ناموفق زیاد بود. لطفاً بعداً تلاش کنید.",
          retryAfter: rateLimit.retryAfter,
        },
        { 
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
          },
        }
      );
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "نام کاربری و رمز عبور الزامی است" },
        { status: 400 }
      );
    }

    // Validate input length to prevent abuse
    if (username.length > 50 || password.length > 100) {
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور نامعتبر است" },
        { status: 400 }
      );
    }

    const token = await loginAdmin(username, password);

    if (!token) {
      // Log failed attempt to database
      await logLoginAttempt(ip, username, false);
      
      // Log failed attempt to security log
      await logSecurityEvent({
        event: "login_failed",
        ip,
        username,
        details: "Invalid credentials",
        path: "/api/auth",
      });

      // Generic error message (don't reveal if username exists)
      return NextResponse.json(
        { error: "نام کاربری یا رمز عبور اشتباه است" },
        { status: 401 }
      );
    }

    // Clear failed attempts on successful login
    loginAttempts.delete(ip);

    // Log successful login to database
    await logLoginAttempt(ip, username, true);
    
    // Log successful login to security log
    await logSecurityEvent({
      event: "login_success",
      ip,
      username,
      path: "/api/auth",
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
