'use client'

import LoadingDots from "@/components/icons/loading-dots"
import { EyeSlashIcon } from "@heroicons/react/24/outline"
import { EyeIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { useState } from "react"
import { toast } from "sonner"

export default function UpdatePassword() {
    const router = useRouter()
    const [emailIsSending, setEmailIsSending] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
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
