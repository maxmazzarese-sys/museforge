import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = ["/login", "/signup"];

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.STRIPE_SECRET_KEY;
  return new TextEncoder().encode(secret || "dev-only-change-AUTH_SECRET");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  let loggedIn = false;
  if (token) {
    try {
      await jwtVerify(token, getSecret());
      loggedIn = true;
    } catch {
      loggedIn = false;
    }
  }

  if (!loggedIn && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (loggedIn && (pathname === "/login" || pathname === "/signup")) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
