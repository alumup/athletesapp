"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Messages from "./messages";
import { useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { decryptId } from "@/app/utils/ecryption";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const [emailIsSending, setEmailIsSending] = useState(false);

  const account_id = searchParams.get("account_id");
  const people_id = searchParams.get("people_id");
  const email = decryptId(searchParams.get("email") as string) || "";
  const sign_up = searchParams.get("sign_up");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (people_id) {
        const { data, error } = await supabase
          .from("people")
          .select("first_name, last_name")
          .eq("id", people_id)
          .single();

        if (error) {
          console.error("Error: ", error);
        } else {
          setFirstName(data.first_name);
          setLastName(data.last_name);
        }
      }
    };
    fetchPersonData();
  }, [people_id]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (account_id) {
        console.log("ACCOUNT ID", account_id);
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", account_id)
          .single();

        if (error) {
          console.error("Error: ", error);
        } else {
          console.log("ACCOUNT", data);
          setAccount(data);
        }
      }
    };
    fetchAccountData();
  }, [account_id]);

  const signUp = sign_up === "true" ? true : false;

  const handleSignIn = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true); // Set emailIsSending to true before making the request

    const formData = new FormData(event.target);
    const response = await fetch("/api/auth/sign-in", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setEmailIsSending(false); // Set emailIsSending to false after the request is complete
      toast.error("Invalid login credentials");
    }

    if (response.ok) {
      router.push("/");
    }
  };

  const handleSignUp = async (event: any) => {
    event.preventDefault();

    setEmailIsSending(true); // Set emailIsSending to true before making the request

    const formData = new FormData(event.target);

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      setEmailIsSending(false); // Set emailIsSending to false after the request is complete
      toast.error("Sign up failed");
    }

    if (response.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <img src="athletes.svg" className="h-auto w-[150px]" />
      </div>

      <div className="mt-5 w-[300px] rounded border border-gray-100 bg-gray-50 p-3 shadow md:w-[400px]">
        {account?.name && (
          <div className="rounded border border-gray-300 bg-gray-100 p-5">
            <p className="text-center text-sm">
              Sign up to manage your{" "}
              <span className="font-bold">{account?.name}</span> athletes.
            </p>
          </div>
        )}

        <Tabs
          defaultValue={signUp ? "signUp" : "signIn"}
          className="mt-5 w-full"
        >
          <TabsList className="mb-5 grid w-full grid-cols-2 gap-2 rounded border border-gray-300 bg-gray-200 p-1">
            <TabsTrigger
              value="signIn"
              className="rounded bg-gray-200 text-zinc-900 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signUp"
              className="rounded bg-gray-200 text-zinc-900 data-[state=active]:bg-zinc-900 data-[state=active]:text-zinc-100"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signIn">
            <Messages />
            <form
              className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground"
              onSubmit={handleSignIn}
            >
              <label className="text-md" htmlFor="email">
                Email
              </label>
              <input
                className="mb-6 rounded-md border bg-inherit px-4 py-2"
                name="email"
                placeholder="you@example.com"
                required
              />
              <label className="text-md" htmlFor="password">
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
              <button
                disabled={emailIsSending}
                className="mb-2 mt-6 w-full rounded bg-[#77dd77] px-4 py-2 text-black shadow"
              >
                {emailIsSending ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
            <div
              className="mt-5 flex cursor-pointer justify-center p-2 text-lg text-black hover:text-gray-400"
              onClick={() => {
                router.push("/forgot-password");
              }}
            >
              Forgot password?
            </div>
          </TabsContent>

          <TabsContent value="signUp">
            <Messages />
            <form
              className="flex w-full flex-1 flex-col justify-center gap-2 text-foreground"
              onSubmit={handleSignUp}
            >
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="first_name"
                defaultValue={firstName || ""}
                required
              />
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="last_name"
                defaultValue={lastName || ""}
                required
              />
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="account_id"
                defaultValue={account_id || ""}
                required
              />
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="people_id"
                defaultValue={people_id || ""}
                required
              />
              <label className="text-md" htmlFor="email">
                Email
              </label>
              <input
                className="mb-6 cursor-not-allowed rounded-md border bg-inherit px-4 py-2 disabled:opacity-75"
                name="email"
                placeholder="you@example.com"
                value={email}
                required
              />
              <label className="text-md" htmlFor="password">
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
              <button
                disabled={emailIsSending}
                className="mb-2 mt-6 w-full rounded bg-[#77dd77] px-4 py-2 text-black shadow"
              >
                {emailIsSending ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      <div className="mt-5 flex justify-center p-2 text-[10px]">
        Powered by Athletes App.
      </div>
    </div>
  );
}
