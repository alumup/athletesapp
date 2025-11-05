import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

export async function proxy(request: NextRequest) {
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
  const path = url.pathname

  // Handle www redirect
  if (url.hostname.startsWith('www.')) {
    const newUrl = new URL(`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}${path}`, request.url)
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/forgot-password", "/update-password", "/public"]
  const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath))

  // Redirect logic
  if (!session && !isPublicPath && !path.includes("/public/")) {
    // Redirect to login if not authenticated and trying to access protected route
    return NextResponse.redirect(new URL("/login", request.url))
  } else if (session && path === "/login") {
    // Redirect to home if authenticated and trying to access login page
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}