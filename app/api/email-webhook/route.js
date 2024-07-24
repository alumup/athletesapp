// app/api/email-webhook/route.js
import { createClient } from '@supabase/supabase-js';
import resend from "@/lib/resend";
import { NextResponse } from 'next/server';


export async function POST(req) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  // Get the raw body and signature
  const rawBody = await req.text();
  const signature = req.headers.get('resend-signature');

  try {
    // Verify the webhook signature
    const event = resend.webhooks.verify({
      payload: rawBody,
      signature: signature,
      signingKey: process.env.RESEND_WEBHOOK_SECRET,
    });

    const { type, data } = event;

    // Find the email record by the Resend email ID
    const { data: emailRecord, error } = await supabase
      .from('emails')
      .select('id')
      .eq('resend_id', data.email_id)
      .single();

    if (error) throw error;

    let updateData = {};

    switch (type) {
      case 'email.delivered':
        updateData = { status: 'delivered', delivered_at: new Date().toISOString() };
        break;
      case 'email.opened':
        updateData = { status: 'opened', opened_at: new Date().toISOString() };
        break;
      case 'email.bounced':
        updateData = { status: 'bounced', bounced_at: new Date().toISOString() };
        break;
    }

    await supabase
      .from('emails')
      .update(updateData)
      .eq('id', emailRecord.id);

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}