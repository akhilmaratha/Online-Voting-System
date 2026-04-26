import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authPages = ["/login", "/register"];

export async function middleware(req) {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  const isSecure = req.nextUrl.protocol === "https:";
  let token = null;

  if (secret) {
    try {
      token = await getToken({
        req,
        secret,
        secureCookie: isSecure,
      });
    } catch {
      token = null;
    }
  }

  const { pathname } = req.nextUrl;

  const isAuthPage = authPages.some((p) => pathname.startsWith(p));
  const isVoterPage = pathname.startsWith("/voter");
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && token) {
    const url = token.role === "admin" ? "/admin/dashboard" : "/voter/dashboard";
    return NextResponse.redirect(new URL(url, req.url));
  }

  if ((isVoterPage || isAdminPage) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminPage && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/voter/dashboard", req.url));
  }

  if (isVoterPage && token?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/voter/:path*", "/admin/:path*"],
};