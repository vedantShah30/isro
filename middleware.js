import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip middleware for auth routes and API calls
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Check if password protection is enabled
  const passwordProtectionEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_PROTECTION === "true";

  if (!passwordProtectionEnabled) {
    return NextResponse.next();
  }

  // Check if user has the password cookie
  const passwordCookie = request.cookies.get("password_verified");

  if (passwordCookie?.value === "true") {
    return NextResponse.next();
  }

  // Allow access to password page
  if (pathname === "/password") {
    return NextResponse.next();
  }

  // Redirect to password page
  const response = NextResponse.redirect(new URL("/password", request.url));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
