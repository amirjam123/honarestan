import { NextRequest, NextResponse } from "next/server";
import { getTelegramFilePath, getTelegramFileUrl } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  const fileId = request.nextUrl.searchParams.get("file_id");
  if (!fileId) {
    return NextResponse.json({ error: "file_id required" }, { status: 400 });
  }

  try {
    const filePath = await getTelegramFilePath(fileId);
    if (!filePath) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileUrl = getTelegramFileUrl(filePath);
    const response = await fetch(fileUrl);

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
