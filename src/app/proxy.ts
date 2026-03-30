import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    await cookies(),
    sessionOptions
  );
  const { pathname } = request.nextUrl;

  // Public routes -- login page, api, static assets
  if (
    pathname === "/login" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets")
  ) {
    if (pathname === "/login" && session.isLoggedIn) {
      const url = session.role === "coach" ? "/coach/dashboard" : "/";
      return NextResponse.redirect(new URL(url, request.url));
    }
    return NextResponse.next();
  }

  // Protected: redirect unauthenticated to login
  if (!session.isLoggedIn) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role guard: only coaches can access /coach routes
  if (pathname.startsWith("/coach") && session.role !== "coach") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets|favicon.ico).*)"],
};
