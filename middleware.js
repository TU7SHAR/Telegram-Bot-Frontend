import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 1. Get the cookie we set manually in the login/register pages
  const authCookie = request.cookies.get("sb-access-auth-token");

  // 2. Define which routes are "Public" (Login and Register)
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // 3. Logic: If no cookie and trying to access the dashboard (anything but auth pages)
  if (!authCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Logic: If they have a cookie and try to go to login/register, send them to dashboard
  if (authCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Ensure this only runs on the dashboard and auth pages, not on images or static files
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
