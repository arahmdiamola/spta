import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parent = await prisma.parent.findUnique({
      where: { id },
      select: { photo: true },
    });

    if (!parent || !parent.photo) {
      return new NextResponse(null, { status: 404 });
    }

    // Assuming photo is a base64 data URL, we can return it as text or redirect
    // If it's used as <img src="/api/parents/id/photo" /> it should return the raw image
    // However, if the photo string in DB is already a data URL (e.g. "data:image/jpeg;base64,..."),
    // the frontend can just use <img src={parent.photo} /> directly.
    // If the frontend explicitly calls this endpoint, we'll return a redirect to the data URL or parse it.
    
    // If it's a base64 string without data: prefix, we'd need to construct it. 
    // Let's just return the data URL directly as a response, wait, if it's an img src, we should return the raw bytes.
    const photoData = parent.photo;
    if (photoData.startsWith('data:image/')) {
      const [header, base64] = photoData.split(',');
      const mimeMatch = header.match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const buffer = Buffer.from(base64, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } else {
      // If it doesn't have the data prefix, assume it's raw base64 jpeg
      const buffer = Buffer.from(photoData, 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch (error) {
    console.error("Photo fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch photo" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { photo } = await request.json();

    const parent = await prisma.parent.update({
      where: { id },
      data: { photo },
    });

    return NextResponse.json(parent);
  } catch (error) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: "Failed to update photo" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return POST(request, { params });
}
