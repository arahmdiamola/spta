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

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      include: {
        parent: { select: { name: true } },
        feeCategory: { select: { name: true } },
      },
    });

    if (!contribution) {
      return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
    }

    await prisma.contribution.delete({
      where: { id },
    });

    await logAudit({
      action: "UNDO",
      entity: "Contribution",
      details: `Undid payment ₱${contribution.amountPaid} for Parent: ${contribution.parent.name} (Receipt #${contribution.receiptNumber})`,
      session,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to undo contribution:", error);
    return NextResponse.json({ error: "Failed to undo payment" }, { status: 500 });
  }
}
