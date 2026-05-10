import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible function to quickly verify if a JWT is structurally valid and not expired
function isTokenValid(token: string): boolean {
  try {
    const payloadBase64 = token.split(".")[1];
    const decodedJson = JSON.parse(atob(payloadBase64));

    if (decodedJson.exp && decodedJson.exp * 1000 > Date.now()) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export default function proxy(request: NextRequest) {
  // 🚀 THE FIX: Prevent Middleware from intercepting and breaking Next.js Server Actions
  // If this is a Server Action (like our syncAuthCookie), let it pass through uninterrupted.
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("coop_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect private routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token || !isTokenValid(token)) {
      // Clear the invalid cookie and redirect
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("coop_token");
      return response;
    }
  }

  // Redirect authenticated users away from public auth pages
  if (pathname === "/login" || pathname === "/register") {
    if (token && isTokenValid(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
