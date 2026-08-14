import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    // Pass safe user data to session
    // await login({ id: user.id, username: user.username, role: user.role });
    const expires = new Date(Date.now() + 10 * 60 * 60 * 1000);
    const session = await encrypt({ user: { id: user.id, username: user.username, role: user.role }, expires });

    const response = NextResponse.json({ success: true, role: user.role });
    response.cookies.set("session", session, { 
      expires, 
      maxAge: 10 * 60 * 60, 
      httpOnly: true, 
      secure: true,
      sameSite: "lax",
      path: "/" 
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
