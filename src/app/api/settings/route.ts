import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    const result: Record<string, string> = {};
    settings.forEach(s => result[s.key] = s.value);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  
  try {
    const data = await request.json();
    for (const [key, value] of Object.entries(data)) {
      await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }

    if (session) {
      await logAudit({
        action: "UPDATE",
        entity: "Settings",
        details: "Updated global settings configurations.",
        session
      });
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
