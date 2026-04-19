import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = ["/", "/login", "/signup"];

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // 1. Skip API routes, Next.js internals, and static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Check Auth Status
  // We check both NEXTAUTH_SECRET and AUTH_SECRET to be safe
  const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
  
  const token = await getToken({
    req,
    secret,
    // On Vercel (HTTPS), we need to ensure we look for the secure cookie
    secureCookie: process.env.NODE_ENV === "production" || req.url.startsWith("https://"),
  });
  
  const isLoggedIn = !!token;

  // 3. Check if the path is public
  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // 4. Redirect logged-in users away from auth pages to dashboard
  if (isLoggedIn && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 5. Redirect unauthenticated users to login if they try to access private pages
  if (!isPublic && !isLoggedIn) {
    // If we're already on a public path but not exactly /, allow it
    if (pathname === "/") return NextResponse.next();
    
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 6. Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
