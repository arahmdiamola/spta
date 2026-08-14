import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const penalty = await prisma.penalty.update({
      where: { id },
      data: { isPaid: true },
    });

    return NextResponse.json(penalty);
  } catch (error) {
    console.error("Failed to settle penalty", error);
    return NextResponse.json({ error: "Failed to settle penalty" }, { status: 500 });
  }
}
