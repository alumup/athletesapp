import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const url = request.nextUrl
  let hostname = request.headers.get("host")!
  if (!hostname.includes(`${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`)) {
    hostname = `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  }


  const path = url.pathname

  if (hostname == `app.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    const { data: { session } } = await supabase.auth.getSession()

    const noRedirectPaths = ["/login", "/forgot-password", "/update-password", "/public"]

    if (!session && !noRedirectPaths.includes(path) && !path.includes("/public/")) {
      return NextResponse.redirect(new URL("/login", request.url))
    } else if (session && path === "/login") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    
    return NextResponse.rewrite(new URL(`/app${path === "/" ? "" : path}`, request.url))
  }

  if (hostname === "localhost:3000" || hostname === `${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`) {
    return NextResponse.rewrite(new URL(`/home${path}`, request.url))
  }

  return NextResponse.rewrite(new URL(`/${hostname}${path}`, request.url))
}