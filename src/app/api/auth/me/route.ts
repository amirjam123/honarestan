import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  console.log("[auth/me] cookie present:", !!token, "token length:", token?.length);

  const admin = await getAdminFromRequest();
  console.log("[auth/me] admin:", admin ? admin.username : "null");

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(admin);
}
