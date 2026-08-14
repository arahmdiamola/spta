import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const archive = await prisma.archive.findUnique({
      where: { id: resolvedParams.id }
    });

    if (!archive) {
      return NextResponse.json({ error: "Archive not found" }, { status: 404 });
    }

    return NextResponse.json(archive);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch archive" }, { status: 500 });
  }
}
