import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        attendances: true,
        penalties: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const body = await request.json();
    const { name, type, date } = body;

    if (!name || !type || !date) {
      return NextResponse.json({ error: "Name, type, and date are required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        name,
        type,
        date: new Date(date),
      },
    });

    if (session) {
      await logAudit({
        action: "CREATE",
        entity: "Event",
        details: `Created event: ${name} (${type})`,
        session
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
