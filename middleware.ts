import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Check for session cookie (Edge-compatible - no Prisma needed)
  const sessionToken = req.cookies.get("authjs.session-token")?.value
  const isLoggedIn = !!sessionToken

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup"]
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // API auth routes should be public (including OAuth callbacks)
  const isAuthApiRoute = pathname.startsWith("/api/auth/")
  
  // Debug route should be accessible
  const isDebugRoute = pathname === "/api/debug-session"

  // Allow OAuth callback to complete without redirect
  if (isAuthApiRoute) {
    return NextResponse.next()
  }

  // If trying to access authenticated routes without login, redirect to login
  if (!isLoggedIn && !isPublicRoute && !isDebugRoute) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access login/signup or landing page, redirect to home
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup" || pathname === "/")) {
    return NextResponse.redirect(new URL("/home", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

