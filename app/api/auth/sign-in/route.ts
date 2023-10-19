import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))


  const supabase = createRouteHandlerClient({ cookies })

  const domain = process.env.NODE_ENV === 'production' ? 'https://app.athletes.app' : 'http://app.localhost:3000'

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  console.log("RETURN ANYTHING")

  if (error) {
    console.log("ERROR", error)
    return NextResponse.redirect(
      `${domain}/login?error=Could not authenticate user`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    )
  }

  return NextResponse.redirect(domain, {
    // a 301 status is required to redirect from a POST to a GET route
    status: 301,
  })
}
