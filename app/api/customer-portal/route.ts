import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const supabase = createClient();

    // Get profile with account info
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, stripe_customer_id, email, account:accounts(stripe_id)")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const connectedAccountId = 'acct_1M46tAL4RG6ujCAq'
    if (!connectedAccountId) {
      return NextResponse.json(
        { error: "No connected Stripe account found" },
        { status: 400 }
      );
    }

    let stripeCustomerId = profile.stripe_customer_id;

    // If no Stripe customer exists, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        metadata: {
          profileId: profile.id
        }
      }, {
        stripeAccount: connectedAccountId
      });

      // Save the new customer ID to the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("id", profile.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return NextResponse.json(
          { error: "Failed to update profile" },
          { status: 500 }
        );
      }

      stripeCustomerId = customer.id;
    }

    // Create billing portal session with connected account
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://athletes.app'
      : 'http://localhost:3000';

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}`,
    }, {
      stripeAccount: connectedAccountId
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
