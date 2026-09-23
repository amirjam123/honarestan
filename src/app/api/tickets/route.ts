import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subject, name, email, phone, message } = body;

    if (!subject || !name || !email || !message) {
      return NextResponse.json(
        { error: "موضوع، نام، ایمیل و پیام الزامی است" },
        { status: 400 }
      );
    }

    // Check for duplicate active tickets
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        userEmail: email,
        status: { not: "closed" },
        hiddenFromUser: false,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingTicket) {
      const lastMessage = await prisma.ticketMessage.findFirst({
        where: { ticketId: existingTicket.id },
        orderBy: { createdAt: "desc" },
      });

      // If last message was from admin and less than 24h ago, suggest continuing
      if (lastMessage?.senderType === "admin") {
        const hoursSinceReply = (Date.now() - new Date(lastMessage.createdAt).getTime()) / (1000 * 60 * 60);
        if (hoursSinceReply < 24) {
          return NextResponse.json({
            duplicate: true,
            ticketId: existingTicket.id,
            message: "شما یک تیکت فعال دارید. آیا می‌خواهید به همان تیکت پاسخ دهید؟",
          });
        }
      }
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        userName: name,
        userEmail: email,
        userPhone: phone || null,
        messages: {
          create: {
            message,
            senderType: "user",
            senderName: name,
          },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        userEmail: email,
        hiddenFromUser: false,
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
