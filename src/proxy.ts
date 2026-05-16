import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

async function isTokenValid(token: string): Promise<boolean> {
  try {
    const secretString =
      process.env.JWT_SECRET || "your_super_secure_jwt_secret";
    const secret = new TextEncoder().encode(secretString);

    await jwtVerify(token, secret);
    return true;
  } catch (e: any) {
    console.error("🔒 JWT Verification Failed in Middleware:", e.message);
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  if (request.headers.has("next-action")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("coop_token")?.value;
  const { pathname } = request.nextUrl;

  // Protect private routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    const isValid = token ? await isTokenValid(token) : false;

    if (!token || !isValid) {
      console.log(`🚫 Rejecting access to ${pathname}. Redirecting to /login.`);
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("coop_token");
      return response;
    }
  }

  // Redirect authenticated users away from public auth pages
  if (pathname === "/login" || pathname === "/register") {
    // 🚀 FIX: Actively intercept the logout/maintenance clearing flag
    if (request.nextUrl.searchParams.get("clear") === "true") {
      const response = NextResponse.next();
      response.cookies.delete("coop_token");
      return response;
    }

    const isValid = token ? await isTokenValid(token) : false;
    if (token && isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
