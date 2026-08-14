import prisma from "@/lib/prisma";

export async function logAudit({
  action,
  entity,
  details,
  session
}: {
  action: "CREATE" | "UPDATE" | "DELETE" | "RESET" | "ARCHIVE";
  entity: string;
  details?: string;
  session: any;
}) {
  try {
    const username = session?.user?.username || "SYSTEM";
    
    await prisma.auditLog.create({
      data: {
        username,
        action,
        entity,
        details,
      }
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
