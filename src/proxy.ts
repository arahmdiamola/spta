import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')

  // If user is logged in and trying to access login page, redirect to home
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user is NOT logged in and trying to access a protected route
  if (!isAuthPage && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If trying to access /parents/ids, we need to check if user is SUPER_ADMIN
  if (sessionCookie) {
    try {
      const { jwtVerify } = await import('jose');
      const secretKey = process.env.JWT_SECRET || "super-secret-spta-key";
      const key = new TextEncoder().encode(secretKey);
      
      const { payload } = await jwtVerify(sessionCookie, key, { algorithms: ["HS256"] });
      const user = payload.user as any;
      
      if (request.nextUrl.pathname === '/parents/ids' && user.role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Block TEACHER from accessing /parents and /settings
      if (
        user.role === 'TEACHER' && 
        (request.nextUrl.pathname.startsWith('/parents') || request.nextUrl.pathname.startsWith('/settings'))
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (e) {
      // If token is invalid, let them fall through to normal auth handling (which will likely fail later)
      // or we can just redirect to login here
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.webmanifest
     * - icon.png
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.png).*)',
  ],
}
