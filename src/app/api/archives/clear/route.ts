import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

export async function DELETE() {
  const session = await getSession();
  
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await prisma.archive.deleteMany({});
    
    await logAudit({
      action: "DELETE",
      entity: "Archive",
      details: `Cleared all ${deleted.count} historical archives.`,
      session
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to clear archives:", error);
    return NextResponse.json({ error: "Failed to clear archives" }, { status: 500 });
  }
}
