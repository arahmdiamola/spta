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
