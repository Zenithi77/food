import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "oh_session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
