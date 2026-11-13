import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, read } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin/sign-in")) return NextResponse.next();
  const s = await read(req.cookies.get(COOKIE)?.value);
  if (!s) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/sign-in";
    url.search = "";
    return NextResponse.redirect(url);
  }
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
