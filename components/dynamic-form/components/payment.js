"use client";
import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { StripeElements } from "@/components/stripe-elements";
import { Elements } from "@stripe/react-stripe-js";
import LoadingSpinner from "@/components/form/loading-spinner";

import { useFormData } from "@/providers/form-provider";

// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// This is your test publishable API key.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export const Payment = ({ isLastStep, isFirstStep, formStep, setFormStep }) => {
  const { orderData, formData } = useFormData();

  const [clientSecret, setClientSecret] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const order = localStorage.getItem("order") || null;

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
          customers: formData[0].people,
          sponsors: formData[0].sponsors,
          assigned_tickets: formData[0].assigned_tickets,
          assigned_sponsorships: formData[0].assigned_sponsorships,
          order: orderData,
          order_id: order,
        }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret));
    }
  }, [hasRendered]);

  const appearance = {
    theme: "stripe",
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="h-full w-full">
      <div>
        <p className="text-xl leading-6 text-gray-700 md:text-2xl">Payment</p>
        <p className="mb-5 text-sm font-light leading-6 text-gray-500 md:text-base">
          Please enter your payment information below.
        </p>
        <div className="mb-5 flex w-full flex-col items-center rounded border border-gray-200 p-5">
          <div className="flex w-full justify-between font-bold">
            <span>Total:</span>
            <span>
              {(orderData.totalAmount / 100).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </span>
          </div>
        </div>
        {!clientSecret && (
          <div className="flex w-full justify-center">
            <LoadingSpinner />
          </div>
        )}

        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <StripeElements
              isLastStep={isLastStep}
              isFirstStep={isFirstStep}
              formStep={formStep}
              setFormStep={setFormStep}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};
