import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Delete parent (cascade delete should handle children, penalties, etc. depending on schema,
    // but Prisma doesn't cascade by default unless specified in schema. Let's delete related records manually if needed,
    // or rely on schema cascade)
    // To be safe, we will first delete children, penalties, and contributions.
    await prisma.$transaction([
      prisma.child.deleteMany({ where: { parentId: id } }),
      prisma.penalty.deleteMany({ where: { parentId: id } }),
      prisma.contribution.deleteMany({ where: { parentId: id } }),
      prisma.parent.delete({ where: { id } })
    ]);

    await logAudit({
      action: "DELETE",
      entity: "Parent",
      details: `Deleted parent ID: ${id}`,
      session
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete parent:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
