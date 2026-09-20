import { NextRequest, NextResponse } from "next/server";

const CANONICAL_HOST = "tuflor.vercel.app";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

export function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;
  if (hostname === CANONICAL_HOST || LOCAL_HOSTS.has(hostname)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.protocol = "https";
  url.hostname = CANONICAL_HOST;
  url.port = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};