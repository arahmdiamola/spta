import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { qrCodeId, eventId } = await request.json();

    if (!qrCodeId || !eventId) {
      return NextResponse.json({ error: "Missing qrCodeId or eventId" }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({
      where: { qrCodeId },
    });

    if (!parent) {
      return NextResponse.json({ error: "Invalid QR code. Parent not found." }, { status: 404 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        parentId: parent.id,
        eventId: event.id,
      },
    });

    if (!existingAttendance) {
      // First scan = time in
      const newAttendance = await prisma.attendance.create({
        data: {
          parentId: parent.id,
          eventId: event.id,
          timeIn: new Date(),
        },
      });
      return NextResponse.json({ 
        message: `Checked IN: ${parent.name}`, 
        type: "in",
        attendanceId: newAttendance.id
      });
    } else if (!existingAttendance.timeOut) {
      // Second scan = time out
      const timeOut = new Date();
      const timeIn = existingAttendance.timeIn ? new Date(existingAttendance.timeIn) : new Date();
      const hours = Math.abs(timeOut.getTime() - timeIn.getTime()) / 36e5;

      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          timeOut,
          totalHours: hours, // calculate hours for all event types, doesn't hurt
        },
      });
      return NextResponse.json({ 
        message: `Checked OUT: ${parent.name}`, 
        type: "out",
        attendanceId: updated.id
      });
    } else {
      // Already checked out
      return NextResponse.json({ 
        message: `Already checked out: ${parent.name}`, 
        type: "info" 
      });
    }
  } catch (error) {
    console.error("Scan error:", error);
    return NextResponse.json({ error: "Failed to process scan." }, { status: 500 });
  }
}
