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

    // Calculate the 3% platform fee
    const applicationFeeAmount = Math.round(amount * 100 * 0.03); // Convert to cents and calculate 3%

    // Create the invoice with application fee
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: 30,
      pending_invoice_items_behavior: 'include',
      application_fee_amount: applicationFeeAmount,
      metadata: {
        roster_id: rosterId,
        athlete_name: athleteName,
        team_name: teamName,
        fee_id: rosterId,
        person_id: person_id
      },
      description: `Team Roster Fee - ${athleteName} - ${teamName}`,
      auto_advance: false
    }, {
      stripeAccount: stripeAccountId,
    });

    // Create invoice item for the base amount
    await stripe.invoiceItems.create({
      customer: customerId,
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      invoice: invoice.id,
      description: `Team Roster Fee - ${athleteName} - ${teamName}`,
    }, {
      stripeAccount: stripeAccountId,
    });

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {
      auto_advance: false
    }, {
      stripeAccount: stripeAccountId,
    });

    const sentInvoice = await stripe.invoices.sendInvoice(finalizedInvoice.id, {
      stripeAccount: stripeAccountId,
    });

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
          stripe_account_id: stripeAccountId,
          application_fee_amount: applicationFeeAmount / 100 // Store in dollars
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
