'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(formData: any): Promise<{ error?: string } | void> {
  const supabase = await createClient()

  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('Login error:', error.message)
    return { error: error.message }
  }

  // revalidatePath('/dashboard')
  redirect('/')
}

export async function signup(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient()

  const email = String(formData.get("email"))
  const password = String(formData.get("password"))
  const account_id = String(formData.get("account_id"))
  const people_id = String(formData.get("people_id"))
  const first_name = String(formData.get("first_name"))
  const last_name = String(formData.get("last_name"))
  const from_events = formData.get("from_events") as string | null

  const domain =
    process.env.NODE_ENV === "production"
      ? "https://app.athletes.app"
      : "http://app.localhost:3000"

  const payload: any = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    account_id: account_id,
    role: "general",
  }

  if (people_id) {
    payload["people_id"] = people_id
  } else {
    const { data, error } = await supabase
      .from("people")
      .insert({
        account_id: account_id,
        first_name: first_name,
        last_name: last_name,
        email: email,
        name: first_name + " " + last_name,
        dependent: false,
      })
      .select()

    if (error) {
      console.log("-- Error creating people", email)
      return redirect(`/login?error=Could not create user profile`)
    } else {
      payload["people_id"] = data?.[0].id || null
    }
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${domain}/api/auth/callback`,
      data: payload,
    },
  })

  if (signUpError) {
    console.log("SIGN UP ERROR", signUpError)
    return redirect(`/login?error=Could not create user account`)
  }

  // After successful signup, sign in the user
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.log("SIGN IN ERROR", signInError)
    return redirect(`/login?error=Account created but could not sign in. Please try logging in.`)
  }

  let redirectUrl = from_events === "true"
    ? `/dashboard?from_events=true&account_id=${account_id}`
    : `/dashboard`

  revalidatePath('/', 'layout')
  return redirect(redirectUrl)
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  if (!email) {
    return { error: 'Email is required' }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
  })

  if (error) {
    console.error('Reset password error:', error.message)
    return { error: error.message }
  }

  return { success: true }
}