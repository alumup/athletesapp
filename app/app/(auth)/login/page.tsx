'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClientComponentClient()

  // const handleSignUp = async () => {
  //   await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: `${location.origin}/auth/callback`,
  //     },
  //   })
  //   router.refresh()
  // }

  const handleSignIn = async () => {
   const {error} = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      alert(error.message)
      return
    }

    
    router.refresh()
  }

  // const handleSignOut = async () => {
  //   await supabase.auth.signOut()
  //   router.refresh()
  // }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <div className="max-w-md mx-3 w-full border border-gray-100 shadow rounded p-5">
        <div className="relative w-full h-[150px] bg-black rounded overflow-hidden">
          
        </div>
        <div className="flex justify-center mt-5">
          <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-300">
            Sign In
          </h1>
        </div>
        <div>
          <input 
            name="email" 
            title='email' 
            placeholder='email' 
            className="mt-5 border border-gray-200 rounded p-2 w-full"
            onChange={(e) => setEmail(e.target.value)} 
            value={email} />
        </div>
        <div>
          <input
            type="password"
            title='password'
            placeholder='password'
            name="password"
            className="border border-gray-200 rounded p-2 w-full mt-5"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>
        <div className="mt-5 flex flex-col space-y-2">
          {/* <button onClick={handleSignUp} className="bg-indigo-400 textt-white rounded px-4 py-2">Sign up</button> */}
          <button type="button" onClick={handleSignIn} className="bg-black  text-white rounded px-4 py-2 uppercase text-sm">Sign In</button>
        </div>

      </div>

      <div className="flex justify-center w-full mt-5">
        <span className="text-xs text-gray-500 font-semibold">Powered by Gigg®</span>
      </div>
    </div>
  )
}