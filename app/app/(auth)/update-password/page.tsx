"use client";

import LoadingDots from "@/components/icons/loading-dots";
import { EyeSlashIcon } from "@heroicons/react/24/outline";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { EyeIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function UpdatePassword() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [emailIsSending, setEmailIsSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true);

    const formData = new FormData(event.target);
    const password = String(formData.get("password"));

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setEmailIsSending(false);
      console.log(error, "<< Error updating password");
      toast.error("Error updating password.");
      return;
    } else {
      // setEmailIsSending(false)
      toast.success("Password set successfully");
      router.push("/");
    }
  };

  return (
    <>
      <div className="mt-5 w-[300px] rounded border border-gray-100 bg-gray-50 p-3 shadow md:w-[400px]">
        <p className="text-center text-2xl">Update Password</p>

        <form
          className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground"
          onSubmit={handleChangePassword}
        >
          <label className="text-md" htmlFor="email">
            Password
          </label>
          <div className="relative flex w-full items-center justify-center overflow-hidden">
            <input
              className="w-full  rounded-md border bg-inherit px-4 py-2 pr-10"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              required
            />
            <div
              className="absolute inset-y-0 right-3 z-30 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </div>
          </div>

          <button className="mb-2 mt-3 w-full rounded bg-[#77dd77] px-4 py-2 text-black shadow">
            {emailIsSending ? (
              <LoadingDots color="#808080" />
            ) : (
              <span>Update Password</span>
            )}
          </button>
          <div className="mt-3 flex justify-center p-2">
            <Link className="text-black hover:text-blue-300" href={"/"}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
