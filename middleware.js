import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const authPages = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAuthPage = authPages.some((page) => pathname.startsWith(page));
  const isVoterPage = pathname.startsWith("/voter");
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && session) {
    const redirectUrl = session.user?.role === "admin" ? "/admin/dashboard" : "/voter/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if ((isVoterPage || isAdminPage) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminPage && session.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/voter/dashboard", req.url));
  }

  if (isVoterPage && session.user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/register", "/voter/:path*", "/admin/:path*"],
};
