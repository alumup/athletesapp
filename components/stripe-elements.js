'use client'
import { useEffect, useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { toast } from "sonner";


export const StripeElements = ({modal}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState({});
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(null)
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) return;

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage({type: 'success', text: "Payment succeeded!"});
          break;
        case "processing":
          setMessage({type: 'info', text: "Your payment is processing."});
          break;
        case "requires_payment_method":
          setMessage({type: 'error', text: "Your payment was not successful, please try again."});
          break;
        default:
          setMessage({type: 'error', text: "Something went wrong."});
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setMessage(null);
    setPaymentError(null);

    const paymentElement = elements.getElement(PaymentElement);
    const { error } = paymentElement.update();

    if (error) {
      setPaymentError(error.message);
      return;
    }

    setIsLoading(true);

    const confirmError = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: {
        return_url: "http://provo.athletes.app",
      },
    });

    if (confirmError.error) {
      setMessage(confirmError.error.message);
    } else {
      setMessage({ type: 'success', text: "Payment succeeded!" });
      setPaymentSuccess(true);
      modal.hide()
      toast.success("Payment successful!")
    }

    setIsLoading(false);
  };

  const paymentElementOptions = {
    layout: "tabs",
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      {paymentError && (
        <div id="payment-errors" className="text-red-500">
          {paymentError}
        </div>
      )}
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      <div className="fixed md:relative bottom-0 inset-x-0 flex items-center justify-end bg-white p-5 border-t border-gray-200 shadow-sm">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          type="submit"
          className="bg-black text-white px-5 py-2 rounded"
        >
          <span id="button-text" className="whitespace-nowrap">
            {isLoading ? "Loading..." : "Pay now"}
          </span>
        </button>
      </div>
    </form>
  );
};
