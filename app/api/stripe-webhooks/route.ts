import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


// Disable body parsing, we need the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  const supabase = createClient();
  
  // Get the raw body
  const rawBody = await req.text();
  
  try {
    // Get the Stripe-Account header to identify if this is from a connected account
    const stripeAccount = req.headers.get("stripe-account");
    
    // Choose the appropriate webhook secret based on the source
    const webhookSecret = stripeAccount 
      ? process.env.STRIPE_CONNECT_WEBHOOK_SECRET_KEY 
      : process.env.STRIPE_WEBHOOK_SECRET_KEY;

    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No stripe signature found");
    }

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret as string
    );

    // Log the source of the webhook
    console.log(`Webhook received from ${stripeAccount ? 'connected account: ' + stripeAccount : 'platform account'}`);
    console.log('Event type:', event.type);

    switch (event.type) {
      case "payment_intent.created":
      case "payment_intent.canceled":
      case "payment_intent.processing":
      case "payment_intent.payment_failed":
      case "payment_intent.succeeded":
      case "invoice.created":
      case "invoice.finalized":
      case "invoice.paid":
      case "invoice.payment_failed":
      case "invoice.payment_succeeded":
        await updateSupabase(event, supabase);
        break;


      default:
        console.log(`Unhandled event type ${event.type}`);
        return NextResponse.json(
          { message: "UNHANDLED EVENT TYPE: FAILED" },
          { status: 400 },
        );
    }

    return NextResponse.json(
      { message: "EVENT PROCESSED SUCCESSFULLY" },
      { status: 200 },
    );
  } catch (err) {
    console.error("Error processing event:", err);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

const updateSupabase = async (event: any, supabase: any) => {
  console.log("EVENT: ", event);
  
  // Handle invoice events
  if (event.type.startsWith('invoice.')) {
    const stripeInvoice = event.data.object;
    const status = getStatusFromInvoiceEvent(event.type);
    
    // First update the invoice record
    const { error: invoiceError } = await supabase
      .from("invoices")
      .update({
        status: status === 'succeeded' ? 'paid' : status,
        metadata: {
          ...stripeInvoice,
          last_event: event.type
        }
      })
      .eq("id", stripeInvoice.metadata.invoice_id)
      .single();

    if (invoiceError) {
      console.log("Error updating invoice status:", invoiceError);
      throw new Error(invoiceError);
    }

    // If payment was successful, create a payment record
    if (status === 'succeeded') {
      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          invoice_id: stripeInvoice.metadata.invoice_id,
          person_id: stripeInvoice.metadata.person_id,
          account_id: stripeInvoice.metadata.account_id,
          amount: stripeInvoice.amount_paid / 100, // Convert from cents
          status: 'succeeded',
          payment_method: 'stripe',
          metadata: {
            stripe_invoice_id: stripeInvoice.id,
            stripe_payment_intent_id: stripeInvoice.payment_intent,
            payment_method_details: stripeInvoice.payment_method_details
          }
        });

      if (paymentError) {
        console.log("Error creating payment record:", paymentError);
        throw new Error(paymentError);
      }
    }

    return;
  }

  // Handle payment intent events (for non-invoice payments)
  if (event.type.startsWith('payment_intent.')) {
    const paymentIntent = event.data.object;
    
    // Only create/update payment record if we have an invoice_id in metadata
    if (paymentIntent.metadata.invoice_id) {
      const { error: paymentError } = await supabase
        .from("payments")
        .upsert({
          invoice_id: paymentIntent.metadata.invoice_id,
          person_id: paymentIntent.metadata.person_id,
          account_id: paymentIntent.metadata.account_id,
          amount: paymentIntent.amount / 100,
          status: paymentIntent.status,
          payment_method: 'stripe',
          metadata: {
            stripe_payment_intent_id: paymentIntent.id,
            payment_method_details: paymentIntent.payment_method_details
          }
        });

      if (paymentError) {
        console.log("Error updating payment record:", paymentError);
        throw new Error(paymentError);
      }
    }
  }

  // Handle metadata updates (existing code)
  const metadata = event.data.object.metadata;
  if (metadata && metadata.rsvp && event.data.object.status === "succeeded") {
    console.log("Updating rsvp for single entry", JSON.stringify(metadata));
    const { error: rsvpError } = await supabase
      .from("rsvp")
      .update({
        status: "paid",
      })
      .eq("id", metadata.rsvp);

    if (rsvpError) console.log(rsvpError, "----- RSVP webhook update error");

    console.log("Multi RSVP Updated successfully", JSON.stringify(metadata));
  } else if (
    metadata &&
    metadata.rsvp_ids &&
    event.data.object.status === "succeeded"
  ) {
    console.log("Updating rsvp for multiple entry", JSON.stringify(metadata));
    const rsvpIds = metadata.rsvp_ids.split(",");
    const { error: rsvpError } = await supabase
      .from("rsvp")
      .update({
        status: "paid",
      })
      .in("id", rsvpIds)
      .single();

    if (rsvpError)
      console.log(rsvpError, "----- Multiple RSVP webhook update error");

    console.log("Multi RSVP Updated successfully", JSON.stringify(metadata));
  }
};

// Update status mapping function
function getStatusFromInvoiceEvent(eventType: string): string {
  switch (eventType) {
    case 'invoice.created':
      return 'draft';
    case 'invoice.finalized':
      return 'sent';
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      return 'succeeded';
    case 'invoice.payment_failed':
      return 'failed';
    default:
      return 'pending';
  }
}

