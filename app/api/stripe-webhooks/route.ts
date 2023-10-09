import { stripe } from "@/lib/stripe";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { buffer } from "node:stream/consumers";
import { cookies } from "next/headers";

export async function POST(req: any) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await buffer(req.body);
  console.log("BODY", body)
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET_KEY as string
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      {
        message: "Webhook signature verification failed",
      },
      {
        status: 400,
      }
    );
  }

  const updateSupabase = async (event: any) => {
    const { error } = await supabase
      .from("payments")
      .update({
        status: event.data.object.status
      })
      .eq("payment_intent_id", event.data.object.id)
      .single();
    
    if (error) {
      return NextResponse.json(
        { message: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "successfully received" },
      { status: 200 }
    );
  };

  switch (event.type) {
    case 'payment_intent.amount_capturable_updated':
      updateSupabase(event)
      break;
    case 'payment_intent.canceled':
      updateSupabase(event)
      break;
    case 'payment_intent.created':
      updateSupabase(event)
      break;
    case 'payment_intent.partially_funded':
      updateSupabase(event)
      break;
    case 'payment_intent.payment_failed':
      updateSupabase(event)
      break;
    case 'payment_intent.processing':
      updateSupabase(event)
      break;
    case 'payment_intent.requires_action':
      updateSupabase(event)
      break;
    case 'payment_intent.succeeded':
      updateSupabase(event)
      break;
    case 'charge.succeeded':
      updateSupabase(event)
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
      return NextResponse.json(
        { message: "UNHANDLED EVENT TYPE: FAILED" },
        { status: 400 }
      );
  }

 
}