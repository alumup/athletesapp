"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useForm } from 'react-hook-form';
import { useRouter } from "next/navigation";


import { useModal } from "./provider";

import { loadStripe } from "@stripe/stripe-js";
import { StripeElements } from "@/components/stripe-elements";
import { Elements } from "@stripe/react-stripe-js";
import LoadingSpinner from "../form/loading-spinner";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function CreatePaymentModal({account, profile, person, fee}: {account: any, profile: any, person: any, fee: any}) {
  const { refresh }= useRouter();
  const modal = useModal();

  const supabase = createClientComponentClient();
  const { register, handleSubmit, formState: { errors }, } = useForm();

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
          fee: fee
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [hasRendered]);


  const appearance: { theme: 'stripe' | 'night' | 'flat' } = {
    theme: 'stripe',
  };

  const options = {
    clientSecret,
    appearance,
  };



  return (
    <div
      tabIndex={-1}
      className="w-full rounded-md bg-white dark:bg-black md:max-w-md md:border md:border-stone-200 md:shadow dark:md:border-stone-700"
    >
      <div tabIndex={1} className="relative flex flex-col space-y-4 px-5 pb-20 pt-10 md:p-10">
        <h2 className="font-cal text-2xl dark:text-white">Payment</h2>


        <div className="flex flex-col space-y-2">
          <div className="flex justify-between">
            <p className="font-cal text-base dark:text-white">Fee Name:</p>
            <p className="font-cal text-base dark:text-white">{fee?.name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-cal text-base dark:text-white">Fee Amount:</p>
            <p className="font-cal text-base dark:text-white">${fee?.amount}</p>
          </div>

          <div className="flex justify-between">
            <p className="font-cal text-base dark:text-white">On behalf of:</p>
            <p className="font-cal text-base dark:text-white">{person?.name}</p>
          </div>
        </div>

        {!clientSecret && (
          <div className="w-full h-full flex justify-center items-center">
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
  );
}

