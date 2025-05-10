import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.has('auth_token')
  const isLoginPage = request.nextUrl.pathname === '/login'

  // If user is not authenticated and not on login page, redirect to login
  // if (!isAuthenticated && !isLoginPage) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  // If user is authenticated and tries to access login page, redirect to dashboard
  // if (isAuthenticated && isLoginPage) {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}