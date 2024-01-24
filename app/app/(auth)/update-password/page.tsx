'use client'

import LoadingDots from "@/components/icons/loading-dots"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { toast } from "sonner"

export default function UpdatePassword() {
    const router = useRouter()
    const [emailIsSending, setEmailIsSending] = useState(false)
    const [password, setPassword] = useState("")
    const handleChangePassword = async (event: any) => {
        event.preventDefault()

        setEmailIsSending(true)

        const formData = new FormData(event.target);
        const response = await fetch("/api/auth/update-password", {
            method: "POST",
            body: formData
        })

        if (!response.ok) {
            setEmailIsSending(false)
            toast.error("Error updating password.")
        }

        if (response.ok) {
            // setEmailIsSending(false)
            toast.success("Password set successfully")
            router.push("/portal")

        }
    }

    return (
        <>
            <div className="mt-5 p-3 bg-gray-50 border border-gray-100 rounded shadow w-[300px] md:w-[400px]">
                <p className="text-2xl text-center">Update Password</p>

                <form
                    className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground"
                    onSubmit={handleChangePassword}
                >

                    <label className="text-md" htmlFor="email">
                        Password
                    </label>
                    <input
                        className="rounded-md px-4 py-2 bg-inherit border mb-6"
                        name="password"
                        required
                    />

                    <button className="mt-3 bg-[#77dd77] rounded shadow px-4 py-2 text-black mb-2 w-full">
                        {emailIsSending ? <LoadingDots color='#808080' /> : <span>Update Password</span>}
                    </button>
                    <div className="mt-3 flex justify-center p-2">
                        <Link className='text-black hover:text-blue-300' href={"/"} >Cancel</Link>
                    </div>
                </form>
            </div>
        </>
    )
}
