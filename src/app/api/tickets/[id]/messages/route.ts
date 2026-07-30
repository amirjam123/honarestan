import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { message, senderType, senderName, email } = body;

    if (!message || !senderType || !senderName) {
      return NextResponse.json(
        { error: "Message and sender info required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Verify ownership for user messages
    if (senderType === "user" && email && ticket.userEmail !== email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Users cannot reply to closed tickets
    if (senderType === "user" && ticket.status === "closed") {
      return NextResponse.json(
        { error: "تیکت بسته شده و امکان ارسال پیام وجود ندارد" },
        { status: 403 }
      );
    }

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        message,
        senderType,
        senderName,
      },
    });

    // Update ticket status
    const newStatus = senderType === "admin" ? "answered" : "open";
    await prisma.ticket.update({
      where: { id },
      data: { status: newStatus, updatedAt: new Date() },
    });

    return NextResponse.json(newMessage, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
