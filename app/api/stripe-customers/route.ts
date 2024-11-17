import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, accountId } = await req.json();
    const supabase = createClient();
    
    // First check if there's an existing customer ID in the profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("email", email.toLowerCase())
      .single();

    // Get the account's Stripe ID
    const { data: account } = await supabase
      .from("accounts")
      .select("stripe_id")
      .eq("id", accountId)
      .single();

    if (profile?.stripe_customer_id) {
      return NextResponse.json({ customerId: profile.stripe_customer_id });
    }

    // If no existing customer, create one through Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
      stripeAccount: account?.stripe_id,
    });

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: {
        source: "athletes.app"
      }
    });

    // Save the customer ID to the profile
    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("email", email.toLowerCase());

    return NextResponse.json({ customerId: customer.id });
  } catch (error: any) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
