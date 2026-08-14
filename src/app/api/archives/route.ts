import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const archives = await prisma.archive.findMany({
      select: {
        id: true,
        yearName: true,
        createdAt: true,
        // We do NOT select 'data' here because it can be massive.
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(archives);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch archives" }, { status: 500 });
  }
}
