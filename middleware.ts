import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const config = {
  matcher: [
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

export default async function middleware(req: NextRequest) {
  const url = req.nextUrl;

  const hostname = req.headers
    .get("host")!
    .replace(".localhost:3000", `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`);

  const path = url.pathname;

  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const { data: {session}, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log("ERROR", error.message)
    }


    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.rewrite(
      new URL(`/app${path === "/" ? "" : path}`, req.url),
    );
  }

  if (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ) {
    return NextResponse.rewrite(new URL(`/home${path}`, req.url));
  }


  return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
}
