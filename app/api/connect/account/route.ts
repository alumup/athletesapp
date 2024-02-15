import { NextResponse, NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const response = await stripe.accounts.retrieve(body.account_id);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error },
      {
        status: 400,
      },
    );
  }
}
