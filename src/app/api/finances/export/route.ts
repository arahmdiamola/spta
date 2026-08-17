import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const feeCategories = await prisma.feeCategory.findMany({
      orderBy: { name: 'asc' }
    });

    // For CSV export, we unfortunately have to fetch all parents, but doing it in the API route
    // prevents shipping megabytes of JSON to the client browser.
    const parents = await prisma.parent.findMany({
      include: {
        _count: { select: { children: true } },
        contributions: true
      },
      orderBy: { name: 'asc' }
    });

    const rows: string[] = [];
    rows.push("Fee Category,Parent Name,Children Count,Expected (Due),Paid,Balance,Status");

    feeCategories.forEach(fee => {
      const feeName = fee.name.replace(/,/g, ''); 
      
      parents.forEach((parent) => {
        const due = fee.type === 'PER_PARENT' ? fee.amount : fee.amount * parent._count.children;
        const paid = parent.contributions
          .filter(c => c.feeCategoryId === fee.id)
          .reduce((sum, c) => sum + c.amountPaid, 0);
          
        if (due > 0 || paid > 0) {
          const balance = due - paid;
          const parentName = parent.name.replace(/,/g, '');
          let status = "Unpaid";
          if (balance <= 0) status = "Settled";
          else if (paid > 0) status = "Partial";

          rows.push(`${feeName},${parentName},${parent._count.children},${due},${paid},${balance},${status}`);
        }
      });
    });

    const csvContent = rows.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Finances_Report_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error("Failed to generate CSV:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
