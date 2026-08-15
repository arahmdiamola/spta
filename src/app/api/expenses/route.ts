import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await getSession();

  try {
    const body = await request.json();
    const { amount, description, requestedBy, documentUrl } = body;

    if (!amount || amount <= 0 || !description || !requestedBy) {
      return NextResponse.json({ error: "Invalid expense data" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        amount: parseFloat(amount),
        description,
        requestedBy,
        documentUrl,
      },
    });

    if (session) {
      await logAudit({
        action: "CREATE",
        entity: "Expense",
        details: `Recorded expense of PHP ${amount} for ${description}`,
        session
      });
    }

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
