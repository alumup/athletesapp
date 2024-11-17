import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { 
    customerId, 
    rosterId, 
    athleteName, 
    teamName, 
    amount,
    accountId,
    stripeAccountId,
    person_id 
  } = await req.json();

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-08-16",
      stripeAccount: stripeAccountId,
    });
    const supabase = createClient();

    // Create invoice item
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customerId,
      amount: amount * 100,
      currency: 'usd',
      description: `Team Roster Fee - ${athleteName} - ${teamName}`,
      metadata: {
        roster_id: rosterId,
        athlete_name: athleteName,
        team_name: teamName
      }
    });

    // Create the invoice and include the pending items
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      pending_invoice_items_behavior: 'include',
      metadata: {
        roster_id: rosterId,
        athlete_name: athleteName,
        team_name: teamName
      },
      description: `Team Roster Fee - ${athleteName} - ${teamName}`,
      auto_advance: false
    });

    // Finalize the invoice to include the items
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false
    });

    // Send the invoice
    const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id);

    // Create payment record in Supabase
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        fee_id: rosterId,
        person_id: person_id,
        account_id: accountId,
        amount: amount,
        status: 'invoiced',
        data: {
          invoice_id: sentInvoice.id,
          customer_id: customerId,
          stripe_account_id: stripeAccountId
        }
      }])
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
      throw new Error('Failed to create payment record');
    }

    return NextResponse.json({ 
      invoice: sentInvoice,
      payment: payment 
    });
  } catch (error: any) {
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
