import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const account_id = String(formData.get('account_id'))
  const people_id = String(formData.get('people_id'))
  const first_name = String(formData.get('first_name'))
  const last_name = String(formData.get('last_name'))
  const supabase = createRouteHandlerClient({ cookies })

  const domain = process.env.NODE_ENV === 'production' ? 'https://app.athletes.app' : 'http://app.localhost:3000'

  

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${domain}/auth/callback`,
      data: {
        first_name: first_name,
        last_name: last_name,
        account_id: account_id,
        people_id: people_id,
        role: 'general'
      }
    },
  })

  if (error) {
    console.log("SIGN UP ERROR", {...error})
    return NextResponse.redirect(
      `${domain}/login?error=Could not authenticate user`,
      {
        // a 301 status is required to redirect from a POST to a GET route
        status: 301,
      }
    )
  }

  return NextResponse.redirect(
    `${domain}/login?message=Check email to continue sign in process`,
    {
      // a 301 status is required to redirect from a POST to a GET route
      status: 301,
    }
  )
}
