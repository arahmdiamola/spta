import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.user?.role === "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, grade, parentId } = body;

    if (!name || !grade || !parentId) {
      return NextResponse.json({ error: "Name, grade, and parentId are required" }, { status: 400 });
    }

    const child = await prisma.child.create({
      data: {
        name,
        grade,
        parentId,
      },
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error("Error creating child:", error);
    return NextResponse.json({ error: "Failed to add child" }, { status: 500 });
  }
}
