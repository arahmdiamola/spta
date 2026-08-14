import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { photo } = await request.json();

    const parent = await prisma.parent.update({
      where: { id },
      data: { photo },
    });

    return NextResponse.json(parent);
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}
