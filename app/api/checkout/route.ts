import { NextResponse, NextRequest } from "next/server";
// import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await req.json();
    const { roster, profile, person, fee } = body;
    console.log("PROFILE IN CHECKOUT", profile);
    let customer = null;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
      stripeAccount: profile.accounts.stripe_id,
    });

    // search for customer
    const { data: customerData } = await stripe.customers.list(
      {
        email: profile.people.email,
        limit: 1,
      },
      {
        stripeAccount: profile.accounts.stripe_id,
      },
    );

    if (customerData.length > 0) {
      customer = customerData[0];

      // update customer object
      customer = await stripe.customers.update(
        customer.id,
        {
          phone: profile.people.phone,
        },
        {
          stripeAccount: profile.accounts.stripe_id,
        },
      );
    } else {
      // Create a new customer object
      customer = await stripe.customers.create(
        {
          email: profile.people.email,
          name: profile.people.name,
          phone: profile.people.phone,
        },
        {
          stripeAccount: profile.accounts.stripe_id,
        },
      );
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("roster_id", roster.id)
      .eq("account_id", profile.accounts.id)
      .eq("person_id", person.id)
      .eq("profile_id", profile.id)
      .eq("fee_id", fee.id)
      .neq("status", "succeeded");

    if (paymentError) console.log("PAYERROR: ", paymentError);

    if (payment && payment.length === 0) {
      // Create a PaymentIntent with the customers amount and currency
      let paymentIntent;
      if (profile.accounts.stripe_id && profile.accounts.application_fee) {
        paymentIntent = await stripe.paymentIntents.create(
          {
            amount: fee.amount * 100,
            customer: customer.id,
            currency: "usd",
            setup_future_usage: "off_session",
            receipt_email: profile.email,
            automatic_payment_methods: {
              enabled: true,
            },
            application_fee_amount:
              fee.amount * profile.accounts.application_fee,
            metadata: {
              fee_id: fee.id,
              roster_id: roster.id,
              profile_id: profile.id,
              person_id: person.id,
            },
          },
          {
            stripeAccount: profile.accounts.stripe_id,
          },
        );
      } else {
        paymentIntent = await stripe.paymentIntents.create({
          amount: fee.amount * 100,
          customer: customer.id,
          currency: "usd",
          setup_future_usage: "off_session",
          receipt_email: profile.email,
          automatic_payment_methods: {
            enabled: true,
          },

          metadata: {
            fee_id: fee.id,
            roster_id: roster.id,
            profile_id: profile.id,
            person_id: person.id,
          },
        });
      }

      if (!paymentIntent) throw new Error("paymentIntent could not be created");

      const { data: payment, error: paymentError } = await supabase
        .from("payments")
        .insert([
          {
            account_id: profile.accounts.id,
            person_id: person.id,
            profile_id: profile.id,
            payment_intent_id: paymentIntent.id,
            roster_id: roster.id,
            fee_id: fee.id,
            amount: fee.amount,
            status: "pending",
          },
        ])
        .select("*");

      if (paymentError) {
        console.log("SUPABASE PAYMENT ERROR", paymentError);
      }

      if (!payment) throw new Error("payment could not be created");

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    } else if (payment && payment.length > 0) {
      console.log("found payment intent\n\n");

      const paymentIntent = await stripe.paymentIntents.retrieve(
        payment[0].payment_intent_id,
        {
          stripeAccount: profile.accounts.stripe_id,
        },
      );
      if (!paymentIntent)
        throw new Error("paymentIntent could not be retrieved");
      console.log(paymentIntent, "<< payment intent");

      return NextResponse.json({ clientSecret: paymentIntent.client_secret });
    }

    return NextResponse.json({});
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message, customMessage: "Error on checkout" },
      {
        status: 400,
      },
    );
  }
}
