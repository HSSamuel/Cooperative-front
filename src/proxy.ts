import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Check for the HttpOnly cookie set by the Next.js Server Action
  const token = request.cookies.get("coop_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect private routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      // 🚀 Actively enforce edge protection
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Redirect authenticated users away from public auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// Ensure the proxy only runs on necessary routes to save edge compute
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
