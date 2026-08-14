import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { attendanceId, action } = await request.json();

    if (!attendanceId || !action) {
      return NextResponse.json({ error: "Missing attendanceId or action" }, { status: 400 });
    }

    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
    });

    if (!attendance) {
      return NextResponse.json({ error: "Attendance record not found." }, { status: 404 });
    }

    if (action === "in") {
      // Reversing an "in" action means completely deleting the attendance record
      await prisma.attendance.delete({
        where: { id: attendanceId },
      });
      return NextResponse.json({ message: "Check-in undone successfully." });
    } else if (action === "out") {
      // Reversing an "out" action means nullifying the timeOut and totalHours
      await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          timeOut: null,
          totalHours: null,
        },
      });
      return NextResponse.json({ message: "Check-out undone successfully." });
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }
  } catch (error) {
    console.error("Undo error:", error);
    return NextResponse.json({ error: "Failed to undo scan." }, { status: 500 });
  }
}
