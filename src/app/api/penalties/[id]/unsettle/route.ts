import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role === "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const penalty = await prisma.penalty.findUnique({
      where: { id },
      include: {
        parent: { select: { name: true } },
        event: { select: { name: true } },
      },
    });

    if (!penalty) {
      return NextResponse.json({ error: "Penalty not found" }, { status: 404 });
    }

    const updatedPenalty = await prisma.penalty.update({
      where: { id },
      data: {
        isPaid: false,
        settledAt: null,
        settledBy: null,
      },
    });

    await logAudit({
      action: "UNDO",
      entity: "Penalty",
      details: `Unsettled penalty ₱${penalty.amount} for Parent: ${penalty.parent.name} (Event: ${penalty.event.name})`,
      session,
    });

    return NextResponse.json(updatedPenalty);
  } catch (error) {
    console.error("Failed to unsettle penalty:", error);
    return NextResponse.json({ error: "Failed to unsettle penalty" }, { status: 500 });
  }
}
