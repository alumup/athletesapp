"use client";
import { useEffect, useState } from "react";

import { useModal } from "./provider";

import { loadStripe } from "@stripe/stripe-js";
import { StripeElements } from "@/components/stripe-elements";
import { Elements } from "@stripe/react-stripe-js";
import LoadingSpinner from "../form/loading-spinner";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CreatePaymentModal({
  account,
  profile,
  person,
  fee,
  roster,
  rsvp,
}: {
  account: any;
  profile: any;
  person: any;
  fee: any;
  roster?: any;
  rsvp?: any;
}) {
  const modal = useModal();

  const [clientSecret, setClientSecret] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const [stripePromise, setStripePromise] = useState<any>(null);

  // This useEffect hook changes hasRendered to true after the component has mounted
  useEffect(() => {
    const setupStripe = async () => {
      const accountDetais = account;

      let loadedStripe;
      if (accountDetais.stripe_id) {
        loadedStripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
          {
            stripeAccount: accountDetais.stripe_id,
          },
        );
      } else {
        loadedStripe = await loadStripe(
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
        );
      }

      setStripePromise(loadedStripe);
    };

    setupStripe();

    setHasRendered(true);
  }, []);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    if (hasRendered) {
      if (rsvp && !roster) {
        fetch("/api/checkout/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account: account,
            profile: profile,
            person: person,
            rsvp: rsvp,
            fee: fee,
          }),
        })
          .then((res) => res.json())
          .then((data) => setClientSecret(data.clientSecret));
      } else if (roster && !rsvp) {
        fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            account: account,
            profile: profile,
            person: person,
            roster: roster,
            fee: fee,
          }),
        })
          .then((res) => res.json())
          .then((data) => setClientSecret(data.clientSecret));
      }
    }
  }, [hasRendered]);

  const appearance: { theme: "stripe" | "night" | "flat" } = {
    theme: "flat",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div
      tabIndex={-1}
      className="relative h-auto max-h-screen w-full overflow-y-scroll rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow"
    >
      <div
        tabIndex={1}
        className="relative flex flex-col space-y-4 px-3 pb-10 pt-5 md:p-10"
      >
        <h2 className="font-cal text-xl font-bold md:text-2xl">Payment</h2>

        <div>
          {!clientSecret && (
            <div className="flex h-full w-full items-center justify-center text-center">
              <LoadingSpinner />
            </div>
          )}

          {clientSecret && stripePromise && (
            <Elements options={options} stripe={stripePromise}>
              <StripeElements modal={modal} fee={fee} person={person} />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
