'use client'
import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Messages from './messages'
import { useSearchParams } from 'next/navigation'
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import LoadingDots from '@/components/icons/loading-dots'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { decryptId } from '@/app/utils/ecryption'


export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient();
  const [emailIsSending, setEmailIsSending] = useState(false)

  const account_id = searchParams.get('account_id')
  const people_id = searchParams.get('people_id')
  const email = decryptId(searchParams.get('email') as string)
  const sign_up = searchParams.get('sign_up')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [account, setAccount] = useState<any>(null)

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

  useEffect(() => {

    const fetchAccountData = async () => {
      if (account_id) {
        console.log("ACCOUNT ID", account_id)
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', account_id)
          .single()

        if (error) {
          console.error('Error: ', error)
        } else {
          console.log('ACCOUNT', data)
          setAccount(data)
        }
      }
    }
    fetchAccountData()
  }, [account_id])


  const signUp = sign_up === 'true' ? true : false


  const handleSignIn = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true); // Set emailIsSending to true before making the request

    const formData = new FormData(event.target);
    const response = await fetch('/api/auth/sign-in', {
      method: 'POST',
      body: formData,
    });


    if (!response.ok) {
      setEmailIsSending(false); // Set emailIsSending to false after the request is complete
      toast.error('Sign in failed')
    }

    if (response.ok) {
      router.push('/')
    }
  };

  const handleSignUp = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true); // Set emailIsSending to true before making the request

    const formData = new FormData(event.target);
    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      body: formData,
    });

    setEmailIsSending(false); // Set emailIsSending to false after the request is complete

    if (!response.ok) {
      toast.error('Sign up failed')
    }

    if (response.ok) {
      router.push('/dashboard')
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <img src="athletes.svg" className="w-[150px] h-auto" />
      </div>

      <div className="mt-5 p-3 bg-gray-50 border border-gray-100 rounded shadow w-[300px] md:w-[400px]">
        {account?.name && (
          <div className="bg-gray-100 border border-gray-300 p-5 rounded">
            <p className="text-sm text-center">Sign up to manage your <span className="font-bold">{account?.name}</span> athletes.</p>
          </div>
        )}

        <Tabs defaultValue={signUp ? 'signUp' : 'signIn'} className="mt-5 w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-gray-200 border border-gray-300 rounded p-1 mb-5">
            <TabsTrigger value="signIn" className="rounded data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 bg-gray-200 text-zinc-900">Sign In</TabsTrigger>
            <TabsTrigger value="signUp" className="rounded data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100 bg-gray-200 text-zinc-900">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signIn">
            <Messages />
            <form
              className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
              onSubmit={handleSignIn}
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
              <div className="relative overflow-hidden flex items-center justify-center w-full">
                <input
                  className="w-full  border bg-inherit rounded-md px-4 py-2 pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute z-30 inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </div>
              </div>
              <button className="mt-6 bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2 w-full">
                {emailIsSending ? <LoadingDots color='#808080' /> : <span>Sign In</span>}
              </button>
            </form>
            <div className="mt-5 flex justify-center p-2 text-lg cursor-pointer text-black hover:text-gray-400" onClick={() => {
              router.push("/forgot-password")
            }}>
              Forgot password?
            </div>
          </TabsContent>

          <TabsContent value="signUp">
            <Messages />
            <form
              className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
              onSubmit={handleSignUp}
            >
              <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
                name="first_name"
                defaultValue={firstName || ''}
                required
              />
              <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
                name="last_name"
                defaultValue={lastName || ''}
                required
              />
              <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
                name="account_id"
                defaultValue={account_id || ''}
                required
              />
              <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6 hidden"
                name="people_id"
                defaultValue={people_id || ''}
                required
              />
              <label className="text-md" htmlFor="email">
                Email
              </label>
              <input
                className="rounded-md px-4 py-2 bg-inherit border mb-6 disabled:opacity-75"
                name="email"
                placeholder="you@example.com"
                defaultValue={email || ''}
                required
                disabled
              />
              <label className="text-md" htmlFor="password">
                Password
              </label>
              <div className="relative overflow-hidden flex items-center justify-center w-full">
                <input
                  className="w-full  border bg-inherit rounded-md px-4 py-2 pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute z-30 inset-y-0 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </div>
              </div>
              <button className="mt-6 bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2 w-full">
                {emailIsSending ? <LoadingDots color='#808080' /> : <span>Create Account</span>}
              </button>

            </form>
          </TabsContent>
        </Tabs>
      </div>
      <div className="mt-5 flex justify-center p-2 text-[10px]">
        Powered by Athletes App.
      </div>
    </div>
  )
}
