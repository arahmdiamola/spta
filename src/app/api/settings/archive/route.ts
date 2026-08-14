import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function POST(req: Request) {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { yearName } = await req.json();

    if (!yearName) {
      return NextResponse.json({ error: "Year name is required" }, { status: 400 });
    }

    // 1. Fetch all data
    const parents = await prisma.parent.findMany({ include: { children: true } });
    const events = await prisma.event.findMany({ include: { attendances: true } });
    const expenses = await prisma.expense.findMany();
    const contributions = await prisma.contribution.findMany();
    const penalties = await prisma.penalty.findMany();

    const snapshot = {
      timestamp: new Date().toISOString(),
      parents,
      events,
      expenses,
      contributions,
      penalties,
    };

    // 2. Save snapshot to Archive table
    await prisma.archive.create({
      data: {
        yearName,
        data: JSON.stringify(snapshot),
      },
    });

    // 3. Clear existing live data
    await prisma.expense.deleteMany({});
    await prisma.contribution.deleteMany({});
    await prisma.penalty.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.child.deleteMany({});
    await prisma.parent.deleteMany({});
    await prisma.event.deleteMany({});

    await logAudit({
      action: "ARCHIVE",
      entity: "Database",
      details: `Archived school year as ${yearName} and cleared live data.`,
      session
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to archive database:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "An archive with this year name already exists." }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to archive database: " + (error.message || String(error)) }, { status: 500 });
  }
}
