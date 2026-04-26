import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const authPages = ["/login", "/register"];

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
   // ADD THIS
   console.log("Cookie header:", req.headers.get("cookie"));
   console.log("Token result:", token);
  const { pathname } = req.nextUrl;

  const isAuthPage = authPages.some((page) => pathname.startsWith(page));
  const isVoterPage = pathname.startsWith("/voter");
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && token) {
    const redirectUrl = token.role === "admin" ? "/admin/dashboard" : "/voter/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
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
