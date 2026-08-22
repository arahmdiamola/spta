import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.user?.role === "TEACHER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await request.json();
    const { name, contactInfo, children } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const parent = await prisma.parent.create({
      data: {
        name,
        contactInfo,
        children: {
          create: children?.map((child: any) => ({
            name: child.name,
            grade: child.grade,
          })) || [],
        },
      },
      include: { children: true },
    });

    if (session) {
      await logAudit({
        action: "CREATE",
        entity: "Parent",
        details: `Registered parent: ${name} with ${children?.length || 0} child(ren).`,
        session
      });
    }

    return NextResponse.json(parent, { status: 201 });
  } catch (error) {
    console.error("Error creating parent:", error);
    return NextResponse.json({ error: "Failed to create parent" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const parents = await prisma.parent.findMany({
      include: {
        children: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(parents);
  } catch (error) {
    console.error("Error fetching parents:", error);
    return NextResponse.json({ error: "Failed to fetch parents" }, { status: 500 });
  }
}
