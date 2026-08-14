import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Need to duplicate getSession logic here because Next.js middleware runs on edge
const secretKey = "super-secret-spta-key";
const key = new TextEncoder().encode(secretKey);

export async function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, key, {
      algorithms: ["HS256"],
    });

    const user = payload.user as any;

    if (request.nextUrl.pathname === '/parents/ids') {
      if (user.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    // Set header so we can read the role in client components if needed, or just let components call getSession
    const response = NextResponse.next();
    response.headers.set('x-user-role', user.role);
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
