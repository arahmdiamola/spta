import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role === "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

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
