import { stripe } from "@/lib/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
import { cookies } from "next/headers";

export async function POST(req: any) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await buffer(req.body);
  console.log("BODY", body);
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string,
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Webhook signature verification failed",
      },
      {
        status: 400,
      },
    );
  }

  const updateSupabase = async (event: any) => {
    console.log("EVENT: ", event);
    const { error } = await supabase
      .from("payments")
      .update({
        status: event.data.object.status,
        data: event.data.object,
      })
      .eq("payment_intent_id", event.data.object.id)
      .single();
    
      console.log(
      "Payment updated successfully",
      event.data.object.status,
      event.data.object.id,
    );

    if (error) {
      console.log("Error on updating payment status: ", error);
      return NextResponse.json({ message: error }, { status: 400 });
    }

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

    return NextResponse.json(
      { message: "successfully received" },
      { status: 200 },
    );
  };

  switch (event.type) {
    case "payment_intent.created":
      updateSupabase(event);
      break;
    case "payment_intent.canceled":
      updateSupabase(event);
      break;
    case "payment_intent.processing":
      updateSupabase(event);
      break;
    case "payment_intent.payment_failed":
      updateSupabase(event);
      break;
    case "payment_intent.succeeded":
      updateSupabase(event);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
      return NextResponse.json(
        { message: "UNHANDLED EVENT TYPE: FAILED" },
        { status: 400 },
      );
  }

  return NextResponse.json({ error: "EVENT RECEIVED" }, { status: 200 });
}
