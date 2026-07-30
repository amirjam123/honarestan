import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

interface AttachmentInput {
  fileId: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { message, attachments } = body;

    if (!message && (!attachments || attachments.length === 0)) {
      return NextResponse.json({ error: "Message or attachment required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        message: message || "",
        senderType: "admin",
        senderName: admin.username,
        attachments: attachments?.length > 0 ? {
          create: (attachments as AttachmentInput[]).map((a) => ({
            filename: a.filename,
            mimeType: a.mimeType,
            size: a.size,
            telegramFileId: a.fileId,
            url: a.url,
          })),
        } : undefined,
      },
      include: { attachments: true },
    });

    // Update ticket status to answered
    await prisma.ticket.update({
      where: { id },
      data: { status: "answered", updatedAt: new Date() },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
