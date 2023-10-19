'use client'
import {useState, useEffect} from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Messages from './messages'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"



export default function Login() {

  const searchParams = useSearchParams()
  const supabase = createClientComponentClient();

  const account_id = searchParams.get('account_id')
  const people_id = searchParams.get('people_id')
  const email = searchParams.get('email')
  const sign_up = searchParams.get('sign_up')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  useEffect(() => {
    const fetchPersonData = async () => {
      if (people_id) {
        const { data, error } = await supabase
          .from('people')
          .select('first_name, last_name')
          .eq('id', people_id)
          .single()

        if (error) {
          console.error('Error: ', error)
        } else {
          setFirstName(data.first_name)
          setLastName(data.last_name)
        }
      }
    }
    fetchPersonData()
  }, [people_id])

  const signUp = sign_up === 'true' ? true : false

  return (
    <Tabs defaultValue={signUp ? 'signUp' : 'signIn'} className="w-[300px] md:w-[400px]">
      <TabsList className="grid w-full grid-cols-2 gap-2 bg-gray-100 rounded p-1">
        <TabsTrigger value="signIn" className="rounded data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 bg-gray-100 text-zinc-900">Sign In</TabsTrigger>
        <TabsTrigger value="signUp" className="rounded data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 bg-gray-100 text-zinc-900">Sign Up</TabsTrigger>
      </TabsList>

      <TabsContent value="signIn">
        <Messages />
        <form
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          action="api/auth/sign-in"
          method="POST"
        >
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
          <button className="bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2">
            Sign In
          </button>
        </form>
      </TabsContent>

      <TabsContent value="signUp">
        <Messages />
        <form
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          action="api/auth/sign-up"
          method="POST"
        >
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
            name="first_name"
            value={firstName || ''}
            required
          />
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
            name="last_name"
            value={lastName || ''}
            required
          />
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
            name="account_id"
            value={account_id || ''}
            required
          />
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
            name="people_id"
            value={people_id || ''}
            required
          />
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            value={email || ''}
            required
          />
          <label className="text-md" htmlFor="password">
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />
         <button className="bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2">
            Sign Up
          </button>
        
        </form>
      </TabsContent>
    </Tabs>
  )
}
