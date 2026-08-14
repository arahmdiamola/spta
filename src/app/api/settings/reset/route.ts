import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST() {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete in order to avoid foreign key constraint errors
    await prisma.expense.deleteMany({});
    await prisma.contribution.deleteMany({});
    await prisma.penalty.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.child.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.event.deleteMany({}); // optionally wipe events too

    await logAudit({
      action: "RESET",
      entity: "Database",
      details: "Hard reset the entire database without archiving.",
      session
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reset database", error);
    return NextResponse.json({ error: "Failed to reset database" }, { status: 500 });
  }
}
