import { NextResponse, NextRequest } from 'next/server'
import { stripe } from "@/lib/stripe";
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const body = await req.json()
  const {account, profile, person, fee } = body;
  console.log("PROFILE IN CHECKOUT", profile)
  let customer = null;

  // search for customer
  const { data: customerData } = await stripe.customers.list({
    email: profile.people.email,
    limit: 1,
  });

  if (customerData.length > 0) {
    customer = customerData[0];

    // update customer object
    customer = await stripe.customers.update(customer.id, {
      phone: profile.people.phone,
    });

  } else {
    // Create a new customer object
    customer = await stripe.customers.create({
      email: profile.people.email,
      name: profile.people.name,
      phone: profile.people.phone,
    })
  }

  // Create a PaymentIntent with the customers amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: fee.amount * 100,
    customer: customer.id,
    currency: "usd",
    setup_future_usage: 'off_session',
    receipt_email: profile.email,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      fee_id: fee.id,
      profile_id: profile.id,
      person_id: person.id,
    },
  });

  if (!paymentIntent) throw new Error("paymentIntent could not be created");

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert([
      {
        account_id: profile.accounts.id,
        person_id: person.id,
        profile_id: profile.id,
        payment_intent_id: paymentIntent.id,
        fee_id: fee.id,
        amount: fee.amount,
        status: 'pending',
      },
    ])
    .select('*');

  if (paymentError) {
    console.log("SUPABASE PAYMENT ERROR", paymentError)
  }

  if (!payment) throw new Error("payment could not be created");

  // Rest of your code...
  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}