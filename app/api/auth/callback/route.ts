import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  return redirect(requestUrl.origin)
}
