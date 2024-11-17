import { stripe } from "@/lib/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
import { cookies } from "next/headers";

export async function POST(req: any) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await buffer(req.body);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    );

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
    const { error } = await supabase
      .from("payments")
      .update({
        status: getStatusFromInvoiceEvent(event.type),
        data: {
          ...event.data.object,
          invoice_id: event.data.object.id
        },
      })
      .eq("fee_id", event.data.object.metadata.fee_id)
      .eq("person_id", event.data.object.metadata.person_id)
      .single();

    if (error) {
      console.log("Error updating payment status for invoice: ", error);
      throw new Error(error);
    }
    return;
  }

  // Handle payment intent events
  const { error } = await supabase
    .from("payments")
    .update({
      status: event.data.object.status,
      data: event.data.object,
    })
    .eq("payment_intent_id", event.data.object.id)
    .single();

  if (error) {
    console.log("Error updating payment status: ", error);
    throw new Error(error);
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

// Helper function to map invoice events to payment statuses
function getStatusFromInvoiceEvent(eventType: string): string {
  switch (eventType) {
    case 'invoice.created':
      return 'invoiced';
    case 'invoice.finalized':
      return 'invoiced';
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      return 'succeeded';
    case 'invoice.payment_failed':
      return 'failed';
    default:
      return 'pending';
  }
}
