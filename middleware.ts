import { NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
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

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.log("ERROR IN MIDDLEWARE: ", error.message);
    }

    if (!session && path !== "/login") {
      return NextResponse.redirect(new URL("/login", req.url));
    } else if (session && path == "/login") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check user role and redirect if role is 'general'
    const { data: { user } } = await supabase.auth.getUser();
    console.log('USERRRR', user)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    if (profileError) {
      console.log("ERROR IN MIDDLEWARE: ", profileError.message);
    }

    const role = profile?.role;
    
    if (role === 'general' && path !== '/portal') {
      const redirectUrl = process.env.NODE_ENV === 'production'
        ? `https://app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}/portal`
        : `http://localhost:3000/portal`;

      return NextResponse.redirect(redirectUrl);
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