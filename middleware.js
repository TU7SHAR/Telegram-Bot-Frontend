import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const authCookie = request.cookies.get("sb-access-auth-token");
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (!authCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
