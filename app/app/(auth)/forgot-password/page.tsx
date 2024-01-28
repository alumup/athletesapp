'use client'

import LoadingDots from "@/components/icons/loading-dots"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

export default function ForgotPassword() {
  const [emailIsSending, setEmailIsSending] = useState(false)
  const [email, setEmail] = useState("")
  const handleForgotPassword = async (event: any) => {
    event.preventDefault()

    setEmailIsSending(true)

    const formData = new FormData(event.target);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: formData
    })

    if (!response.ok) {
      setEmailIsSending(false)
      toast.error("Error sending password reset token.")
    }

    if (response.ok) {
      setEmailIsSending(false)
      toast.success("Reset token sent successfully.")
    }
  }

  return (
    <>
      <div className="mt-5 p-3 bg-gray-50 border border-gray-100 rounded shadow w-[300px] md:w-[400px]">
        <p className="text-2xl text-center">Reset Password</p>

        <form
          className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
          onSubmit={handleForgotPassword}
        >
          <div>
            <p className="text-sm flex justify-center">
              Forgot your password? Don't worry though, just enter your email address and we'll send you a message with a reset link
            </p>
          </div>
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border mb-6"
            name="email"
            placeholder="you@example.com"
            required
          />

          <button className="mt-3 bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2 w-full">
            {emailIsSending ? <LoadingDots color='#808080' /> : <span>Send me a reset link</span>}
          </button>
          <div className="mt-3 flex justify-center p-2">
            <Link className='text-black hover:text-gray-300' href={"/"} >Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}
