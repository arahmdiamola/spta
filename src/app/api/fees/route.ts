import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const fees = await prisma.feeCategory.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(fees);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  
  if (session?.user?.role === "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();
    const { name, amount, type, year, applicableGrades } = data;

    if (!name || amount === undefined || !type || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const fee = await prisma.feeCategory.create({
      data: {
        name,
        amount: parseFloat(amount),
        type,
        year: parseInt(year),
        applicableGrades: applicableGrades || null
      }
    });

    if (session) {
      await logAudit({
        action: "CREATE",
        entity: "FeeCategory",
        details: `Created new fee category: ${name} (₱${amount})`,
        session
      });
    }

    return NextResponse.json(fee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 });
  }
}
