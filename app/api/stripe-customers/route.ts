import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { email, accountId } = await req.json();
    const supabase = await createClient();
    
    // Find person by email AND account_id
    const { data: person, error: personError } = await supabase
      .from("people")
      .select("id, stripe_customer_id")
      .eq("email", email.toLowerCase())
      .eq("account_id", accountId)
      .single();

    if (personError) {
      console.error('Person lookup error:', personError);
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }

    // Return existing customer ID if found
    if (person?.stripe_customer_id) {
      return NextResponse.json({ customerId: person.stripe_customer_id });
    }

    // Get the account's Stripe ID
    const { data: account } = await supabase
      .from("accounts")
      .select("stripe_id")
      .eq("id", accountId)
      .single();

    // Create new customer through Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
      stripeAccount: account?.stripe_id,
    });

    const customer = await stripe.customers.create({
      email,
      metadata: {
        source: "athletes.app",
        person_id: person.id
      }
    });

    // Save the customer ID to the person record
    const { error: updateError } = await supabase
      .from("people")
      .update({ stripe_customer_id: customer.id })
      .eq("id", person.id);

    if (updateError) {
      console.error('Error updating person with customer ID:', updateError);
      return NextResponse.json(
        { error: "Failed to update person record" },
        { status: 500 }
      );
    }

    return NextResponse.json({ customerId: customer.id });
  } catch (error: any) {
    console.error('Customer creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
