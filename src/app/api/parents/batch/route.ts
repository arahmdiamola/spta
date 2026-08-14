import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const parents = await request.json();

    if (!Array.isArray(parents)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let createdCount = 0;

    // Use a transaction or sequential creation to handle nested children
    for (const p of parents) {
      if (!p.name) continue;

      await prisma.parent.create({
        data: {
          name: p.name,
          contactInfo: p.contactInfo || null,
          children: {
            create: p.children.map((c: any) => ({
              name: c.name,
              grade: c.grade,
            }))
          }
        }
      });
      createdCount++;
    }

    return NextResponse.json({ message: `Successfully created ${createdCount} parents` }, { status: 201 });
  } catch (error) {
    console.error("Error in batch upload:", error);
    return NextResponse.json({ error: "Failed to process batch upload" }, { status: 500 });
  }
}
