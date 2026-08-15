import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (session?.user?.role === "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;

    const fee = await prisma.feeCategory.findUnique({ where: { id } });
    if (!fee) {
      return NextResponse.json({ error: "Fee not found" }, { status: 404 });
    }

    // Check if there are any contributions linked to this fee
    const count = await prisma.contribution.count({ where: { feeCategoryId: id } });
    if (count > 0) {
      return NextResponse.json({ error: "Cannot delete fee category because it has linked payments." }, { status: 400 });
    }

    await prisma.feeCategory.delete({
      where: { id }
    });

    if (session) {
      await logAudit({
        action: "DELETE",
        entity: "FeeCategory",
        details: `Deleted fee category: ${fee.name}`,
        session
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete fee" }, { status: 500 });
  }
}
