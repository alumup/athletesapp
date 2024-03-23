"use client";

import LoadingDots from "@/components/icons/loading-dots";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ForgotPassword() {
  const router = useRouter();
  const [emailIsSending, setEmailIsSending] = useState(false);
  const [email, setEmail] = useState("");
  const handleForgotPassword = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true);

    const formData = new FormData(event.target);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setEmailIsSending(false);
      toast.error("Error sending password reset token.");
    }

    if (response.ok) {
      setEmailIsSending(false);
      toast.success("Reset token sent successfully.");
      router.push("/");
    }
  };

  return (
    <>
      <div className="mt-5 w-[300px] rounded border border-gray-100 bg-gray-50 p-3 shadow md:w-[400px]">
        <p className="text-center text-2xl">Reset Password</p>

        <form
          className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground"
          onSubmit={handleForgotPassword}
        >
          <div>
            <p className="flex justify-center text-sm">
              Forgot your password? Don't worry though, just enter your email
              address and we'll send you a message with a reset link
            </p>
          </div>
          <label className="text-md" htmlFor="email">
            Email
          </label>
          <input
            className="mb-6 rounded-md border bg-inherit px-4 py-2"
            name="email"
            placeholder="you@example.com"
            required
          />

          <button className="mb-2 mt-3 w-full rounded bg-[#77dd77] px-4 py-2 text-black shadow">
            {emailIsSending ? (
              <LoadingDots color="#808080" />
            ) : (
              <span>Send me a reset link</span>
            )}
          </button>
          <div className="mt-3 flex justify-center p-2">
            <Link className="text-black hover:text-gray-300" href={"/"}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
