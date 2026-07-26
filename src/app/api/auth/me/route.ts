import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  console.log("[auth/me] request cookie present:", !!token);

  const admin = await getAdminFromRequest();
  console.log("[auth/me] getAdminFromRequest:", admin ? admin.username : "null");

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(admin);
}
