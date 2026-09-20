import { NextRequest, NextResponse } from "next/server";
import { logSecurityEvent, getClientIp } from "@/lib/security-logger";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  await logSecurityEvent({
    event: "logout",
    ip,
    path: "/api/auth/logout",
  });

  const response = NextResponse.json({ success: true });
  
  // Clear the auth cookie
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  return response;
}
