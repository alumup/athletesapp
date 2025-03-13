"use client";

import LoadingDots from "@/components/icons/loading-dots";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();

  const scope = searchParams.get("scope");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [connecting, setConnecting] = useState(true);
  const [user, setUser] = useState<any>();
  const [stripeConnected, setStripeConnected] = useState();
  const [stripeAccount, setStripeAccount] = useState<any>();
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*, accounts(*, senders(*))")
        .eq("id", user?.id)
        .single();

      if (profileError) throw profileError;

      setUser(profile);
      setStripeConnected(profile.accounts.stripe_id);
    };

    getUser();

    if (scope && code && state) {
      setConnecting(true);
    } else {
      setConnecting(false);
    }
  }, []);

  useEffect(() => {
    if (scope && code && state && user) {
      const connectPlatformAccount = async () => {
        const response = await fetch("/api/connect", {
          method: "POST",
          body: JSON.stringify({
            scope: scope,
            code: code,
            state: state,
          }),
        });

        if (response.status === 200) {
          const resp = await response.json();
          const { data: updateAccount, error } = await supabase
            .from("accounts")
            .update({ stripe_id: resp.connected_account_id })
            .eq("id", user?.account_id)
            .select();

          if (error) toast("Error connecting stripe.");
          setStripeConnected(updateAccount?.[0]?.stripe_id);
        }
      };

      connectPlatformAccount();
    }
  }, [scope, code, state, user]);

  useEffect(() => {
    if (stripeConnected) {
      const getAccounts = async () => {
        const response = await fetch("/api/connect/account", {
          method: "POST",
          body: JSON.stringify({ account_id: stripeConnected }),
        });

        const account = await response.json();
        setStripeAccount(account);
      };

      getAccounts();
    }
  }, [stripeConnected]);

  return (
    <div className="flex max-w-screen-xl flex-col space-y-12 py-8">
      <div className="flex flex-col space-y-6">
        <h1 className="font-cal text-3xl font-bold dark:text-white">
          Settings
        </h1>

        <div className="relative border border-gray-100 bg-white p-6">
          <span className="whitespace-nowrap bg-blue-400 px-3 py-1.5 text-xs font-medium">
            {" "}
            Stripe{" "}
          </span>

          {!stripeConnected && (
            <button
              disabled={connecting}
              className="mx-3 mb-2 mt-6 w-auto rounded bg-[#77dd77] px-4 py-2 text-black shadow"
              onClick={() => {
                if (window) {
                  setConnecting(true);
                  const url = `https://dashboard.stripe.com/oauth/authorize?response_type=code&client_id=${
                    process.env.NEXT_PUBLIC_STRIPE_OAUTH_CLIENT_ID
                  }&scope=read_write&state=${
                    Math.random() * 100
                  }&redirect_uri=${process.env.NEXT_PUBLIC_BASE_URL}/settings`;

                  window.document.location.href = url;
                }
              }}
            >
              {connecting ? (
                <LoadingDots color="#808080" />
              ) : (
                <span>Connect Stripe</span>
              )}
            </button>
          )}

          {stripeConnected && (
            <>
              <h2 className="text-black-900 mt-4 text-2xl font-bold">
                {stripeAccount?.business_profile?.name ||
                  stripeAccount?.business_profile?.url ||
                  stripeAccount?.email}
                <span className="px-2 text-sm text-gray-700">
                  {stripeAccount?.id}{" "}
                </span>
              </h2>

              <p className="text-black-700 mt-1.5 text-lg">
                Payouts Enabled:{" "}
                <span className="text-sm text-gray-700">
                  {stripeAccount?.payout_enabled ? "true" : "false"}
                </span>
              </p>
              <p className="text-black-700 mt-1.5 text-lg">
                Type:{" "}
                <span className="text-sm text-gray-700">
                  {stripeAccount?.type}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
