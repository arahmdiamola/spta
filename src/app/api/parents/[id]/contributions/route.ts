import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amountPaid, feeCategoryId } = body;

    if (!amountPaid || amountPaid <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const contribution = await prisma.contribution.create({
      data: {
        parentId: id,
        year: new Date().getFullYear(),
        amountPaid: parseFloat(amountPaid),
        feeCategoryId: feeCategoryId || null,
      },
    });

    return NextResponse.json(contribution, { status: 201 });
  } catch (error) {
    console.error("Error creating contribution:", error);
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
