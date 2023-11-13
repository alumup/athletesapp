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
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CreatePaymentModal({account, profile, person, fee, roster}: {account: any, profile: any, person: any, fee: any, roster:any}) {
 
  const modal = useModal();

  const [clientSecret, setClientSecret] = useState("");
  const [hasRendered, setHasRendered] = useState(false);

  


  // This useEffect hook changes hasRendered to true after the component has mounted
  useEffect(() => {
    setHasRendered(true);
  }, []);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    if (hasRendered) {
      fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: account,
          profile: profile,
          person: person,
          roster: roster,
          fee: fee
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [hasRendered]);


  const appearance: { theme: 'stripe' | 'night' | 'flat' } = {
    theme: 'flat',
  };

  const options = {
    clientSecret,
    appearance,
  };



  return (
    <div
      tabIndex={-1}
      className="w-full rounded-md bg-white md:max-w-md md:border md:border-stone-200 md:shadow"
    >
      <div tabIndex={1} className="relative flex flex-col space-y-4 px-5 pb-20 pt-10 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Payment</h2>


        <div className="flex flex-col space-y-2 bg-gray-100 border border-gray-200 rounded p-2">
          <div className="flex justify-between">
            <p className="font-cal text-xs">Team:</p>
            <p className="font-cal text-xs">{roster?.teams.name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-cal text-xs">Fee Name:</p>
            <p className="font-cal text-xs">{fee?.name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-cal text-xs">Fee Amount:</p>
            <p className="font-cal text-xs">${fee?.amount}</p>
          </div>

          <div className="flex justify-between">
            <p className="font-cal text-xs">On behalf of:</p>
            <p className="font-cal text-xs">{person?.name}</p>
          </div>
        </div>

        <div className="h-[600px] md:h-full p-1">
          {!clientSecret && (
            <div className="w-full h-full flex justify-center items-center text-center">
              <LoadingSpinner />
            </div>
          )}

          {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
              <StripeElements modal={modal} />
            </Elements>
          )}
        </div>
 
      </div>
    </div>
  );
}

