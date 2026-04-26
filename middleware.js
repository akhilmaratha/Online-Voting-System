import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  const isAuthPage = ["/login", "/register"].some((p) => pathname.startsWith(p));
  const isVoterPage = pathname.startsWith("/voter");
  const isAdminPage = pathname.startsWith("/admin");

  if (isAuthPage && session) {
    const url = session.user?.role === "admin" ? "/admin/dashboard" : "/voter/dashboard";
    return NextResponse.redirect(new URL(url, req.url));
  }

  if ((isVoterPage || isAdminPage) && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isAdminPage && session?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/voter/dashboard", req.url));
  }

  if (isVoterPage && session?.user?.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/login", "/register", "/voter/:path*", "/admin/:path*"],
};