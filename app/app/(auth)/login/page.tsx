'use client'

import { useState, useEffect, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Messages from "./messages";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import LoadingDots from "@/components/icons/loading-dots";
import { toast } from "sonner";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { decryptId } from "@/app/utils/ecryption";
import { signup, login } from './actions';
import Image from 'next/image';

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [emailIsSending, setEmailIsSending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from_events = searchParams.get("from_events");
  const account_id = searchParams.get("account_id");
  const people_id = searchParams.get("people_id");
  const email = from_events === "true"
    ? (searchParams.get("email") as string) || ""
    : decryptId(searchParams.get("email") as string);
  const sign_up = searchParams.get("sign_up");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [account, setAccount] = useState<any>(null);

  const isDisabled = email !== "";
  const signUp = sign_up === "true";

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
  }, [people_id, supabase]);

  useEffect(() => {
    const fetchAccountData = async () => {
      if (account_id) {
        const { data, error } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", account_id)
          .single();

        if (error) {
          console.error("Error: ", error);
        } else {
          setAccount(data);
        }
      }
    };
    fetchAccountData();
  }, [account_id, people_id, supabase]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailIsSending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await login(formData);
      
      if (result && result.error) {
        setEmailIsSending(false);
        toast.error(result.error);
      } else {
        // The login action will handle the redirect
        toast.success("Logged in successfully!");
      }
    } catch (error) {
      setEmailIsSending(false);
      toast.error("Login failed");
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailIsSending(true);

    const formData = new FormData(event.currentTarget);
    formData.append("from_events", from_events || "");
    formData.append("account_id", account_id || "");

    try {
      const result = await signup(formData);
      
      if (result?.error) {
        setEmailIsSending(false);
        toast.error(result.error);
      } else {
        // The signup action will handle the redirect, so we don't need to do it here
        toast.success("Account created successfully!");
      }
    } catch (error) {
      setEmailIsSending(false);
      toast.error("Sign up failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-center">
        <Image src="/athletes-logo.svg" width={75} height={75} alt="Athletes Logo" />
      </div>

      <div className="mt-5 w-[300px] rounded border border-gray-100 bg-gray-50 p-3 shadow md:w-[400px]">
        {account?.name && (
          <div className="rounded border border-gray-300 bg-gray-100 p-5">
            <p className="text-center text-sm">
              Sign up to manage your <span className="font-bold">{account?.name}</span> athletes.
            </p>
          </div>
        )}

        <Tabs defaultValue={signUp ? "signUp" : "signIn"} className="mt-5 w-full">
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
                  className="w-full rounded-md border bg-inherit px-4 py-2 pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute inset-y-0 right-3 z-30 flex items-center cursor-pointer"
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
              <label className="text-md" htmlFor="first_name">
                First Name
              </label>
              <input
                className="mb-6 rounded-md border bg-inherit px-4 py-2"
                name="first_name"
                placeholder="First Name"
                defaultValue={firstName || ""}
                required
              />
              <label className="text-md" htmlFor="last_name">
                Last Name
              </label>
              <input
                className="mb-6 rounded-md border bg-inherit px-4 py-2"
                name="last_name"
                placeholder="Last Name"
                defaultValue={lastName || ""}
                required
              />
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="account_id"
                defaultValue={account_id || ""}
                required
                aria-label="Account ID"
              />
              <input
                className="mb-6 hidden rounded-md border bg-inherit px-4 py-2"
                name="people_id"
                defaultValue={people_id || ""}
                aria-label="People ID"
              />
              <label className="text-md" htmlFor="email">
                Email
              </label>
              <input
                className="mb-6 cursor-not-allowed rounded-md border bg-inherit px-4 py-2 disabled:opacity-75"
                name="email"
                placeholder="you@example.com"
                defaultValue={email}
                required
                readOnly={isDisabled}
              />
              <label className="text-md" htmlFor="password">
                Password
              </label>
              <div className="relative flex w-full items-center justify-center overflow-hidden">
                <input
                  className="w-full rounded-md border bg-inherit px-4 py-2 pr-10"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                />
                <div
                  className="absolute inset-y-0 right-3 z-30 flex items-center cursor-pointer"
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
              <input
                type="hidden"
                name="from_events"
                value={from_events || ""}
                aria-label="From Events"
              />
              <input
                type="hidden"
                name="account_id"
                value={account_id || ""}
                aria-label="Account ID"
              />
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