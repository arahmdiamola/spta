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
    const body = await request.json();
    const { amountPaid, feeCategoryId } = body;

    const parsedAmount = parseFloat(amountPaid);
    if (!amountPaid || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const createdContribution = await prisma.contribution.create({
      data: {
        parentId: id,
        year: new Date().getFullYear(),
        amountPaid: parsedAmount,
        feeCategoryId: feeCategoryId || null,
        recordedBy: session?.user?.username || "SYSTEM",
      },
    });

    const contribution = await prisma.contribution.findUnique({
      where: { id: createdContribution.id },
      include: {
        parent: { select: { name: true } },
        feeCategory: { select: { name: true } },
      },
    });

    if (!contribution) {
      return NextResponse.json({ error: "Failed to retrieve contribution" }, { status: 500 });
    }

    await logAudit({
      action: "CREATE",
      entity: "Contribution",
      details: `Recorded payment ₱${contribution.amountPaid} for Parent: ${contribution.parent.name} (Receipt #${contribution.receiptNumber})`,
      session,
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
