import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { Resend } from 'resend';
import resend from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const { email, sendEmail } = await req.json();
    const supabase = createClient();

    // Get person with account info
    const { data: person, error } = await supabase
      .from("people")
      .select("id, stripe_customer_id, email")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !person) {
      return NextResponse.json(
        { error: "Person not found" },
        { status: 404 }
      );
    }

    const connectedAccountId = 'acct_1M46tAL4RG6ujCAq';
    if (!connectedAccountId) {
      return NextResponse.json(
        { error: "No connected Stripe account found" },
        { status: 400 }
      );
    }

    let stripeCustomerId = person.stripe_customer_id;

    // If no Stripe customer exists, create one
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: email.toLowerCase(),
        metadata: {
          person_id: person.id
        }
      }, {
        stripeAccount: connectedAccountId
      });

      // Save the new customer ID to the person
      const { error: updateError } = await supabase
        .from("people")
        .update({ stripe_customer_id: customer.id })
        .eq("id", person.id);

      if (updateError) {
        console.error("Error updating person:", updateError);
        return NextResponse.json(
          { error: "Failed to update person" },
          { status: 500 }
        );
      }

      stripeCustomerId = customer.id;
    }

    // Ensure we have a complete URL for the return_url
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://athletes.app'
      : 'http://localhost:3000';

    // Create billing portal session with complete URL
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    }, {
      stripeAccount: connectedAccountId
    });

    if (sendEmail) {
      try {
        const emailResponse = await resend.emails.send({
          from: 'Athletes App <portal@email.athletes.app>',
          to: email.toLowerCase(),
          subject: 'Your Athletes App Billing Portal Link',
          html: `
            <h2>Access Your Billing Portal</h2>
            <p>Here's your secure link to manage your athletes:</p>
            <p><a href="${session.url}">Click here to access the billing portal</a></p>
            <p>This link will expire in 30 minutes for security purposes.</p>
            <p>If you didn't request this link, please ignore this email.</p>
          `,
        });

        console.log('Email sending response:', emailResponse);
        
        return NextResponse.json({ 
          success: true,
          message: 'Billing portal link sent to email'
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json(
          { error: "Failed to send email", details: emailError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
