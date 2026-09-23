import { NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromRequest();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(admin);
}
