import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH || "hadi-panel-x7k9";

// Rate limiting store (in-memory, resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute

// Login rate limiting store
const loginAttempts = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();
const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const LOGIN_BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function isRateLimited(key: string, max: number, window: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + window });
    return false;
  }

  if (record.count >= max) {
    return true;
  }

  record.count++;
  return false;
}

function isLoginRateLimited(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true };
  }

  // Check if currently blocked
  if (record.blockedUntil && now < record.blockedUntil) {
    const retryAfter = Math.ceil((record.blockedUntil - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Reset if window expired
  if (now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return { allowed: true };
  }

  // Check attempt count
  if (record.count >= LOGIN_MAX_ATTEMPTS) {
    record.blockedUntil = now + LOGIN_BLOCK_DURATION_MS;
    record.resetAt = now + LOGIN_BLOCK_DURATION_MS;
    const retryAfter = Math.ceil(LOGIN_BLOCK_DURATION_MS / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
             request.headers.get("x-real-ip") ||
             "unknown";

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") && !pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    // Special rate limiting for login endpoint
    if (pathname === "/api/auth" && request.method === "POST") {
      const loginCheck = isLoginRateLimited(ip);
      if (!loginCheck.allowed) {
        return NextResponse.json(
          { error: "تعداد تلاش‌های ناموفق زیاد بود. لطفاً بعداً تلاش کنید.", retryAfter: loginCheck.retryAfter },
          { status: 429, headers: { "Retry-After": String(loginCheck.retryAfter) } }
        );
      }
    }

    // General API rate limiting
    const key = getRateLimitKey(ip, "/api");
    if (isRateLimited(key, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  // Protect admin API routes (except login and setup status check)
  if (pathname.startsWith(`/${ADMIN_SECRET_PATH}/api/`) || pathname.startsWith("/api/admin/")) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Add security headers to response
  const response = NextResponse.next();

  // Prevent clickjacking on admin pages
  if (pathname.startsWith(`/${ADMIN_SECRET_PATH}`)) {
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-Content-Type-Options", "nosniff");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
