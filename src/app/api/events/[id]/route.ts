import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        attendances: { include: { parent: true } },
        penalties: { include: { parent: true } },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// Finalize a voluntary work event — assign penalties to absent parents
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { attendances: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get penalty amount from settings
    const penaltySetting = await prisma.settings.findUnique({
      where: { key: `${event.type}_ABSENCE_PENALTY` },
    });
    const fallbackSetting = await prisma.settings.findUnique({
      where: { key: "ABSENCE_PENALTY" },
    });
    const penaltyAmount = penaltySetting 
      ? parseFloat(penaltySetting.value) 
      : (fallbackSetting ? parseFloat(fallbackSetting.value) : 100);

    // Get all parents
    const allParents = await prisma.parent.findMany();

    // Find parents who attended
    const attendedParentIds = new Set(event.attendances.map((a: { parentId: string }) => a.parentId));

    // Find absent parents — those not in the attendance list
    const absentParents = allParents.filter((p) => !attendedParentIds.has(p.id));

    // Create penalties for absent parents (skip if already penalized for this event)
    const existingPenalties = await prisma.penalty.findMany({
      where: { eventId: id },
    });
    const alreadyPenalizedIds = new Set(existingPenalties.map((p) => p.parentId));

    const newPenalties = absentParents
      .filter((p) => !alreadyPenalizedIds.has(p.id))
      .map((p) => ({
        parentId: p.id,
        eventId: id,
        amount: penaltyAmount,
        isPaid: false,
      }));

    if (newPenalties.length > 0) {
      await prisma.penalty.createMany({ data: newPenalties });
    }

    return NextResponse.json({
      message: `Penalties assigned to ${newPenalties.length} absent parent(s).`,
      penalized: newPenalties.length,
    });
  } catch (error) {
    console.error("Error finalizing event:", error);
    return NextResponse.json({ error: "Failed to finalize event" }, { status: 500 });
  }
}
