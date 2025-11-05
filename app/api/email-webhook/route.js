// app/api/email-webhook/route.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

export async function POST(req) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Get the raw body and headers
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  try {
    // Verify the webhook signature
    const wh = new Webhook(process.env.RESEND_WEBHOOK_SECRET);
    const event = wh.verify(payload, headers);

    const { type, data } = event;

    // Find the email record by the Resend email ID
    const { data: emailRecord, error } = await supabase
      .from('emails')
      .select('id, broadcast_id')
      .eq('resend_id', data.email_id)
      .single();

    if (error) {
      console.error('Email record not found:', error);
      // Don't return error - webhook might be for email not in our system
      return NextResponse.json({ message: 'Email not found, skipping' }, { status: 200 });
    }

    let updateData = {};
    let statName = null;

    switch (type) {
      case 'email.sent':
        updateData = { status: 'sent', sent_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        statName = 'sent';
        break;
      case 'email.delivered':
        updateData = { status: 'delivered', delivered_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        statName = 'delivered';
        break;
      case 'email.opened':
        updateData = { status: 'opened', opened_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        statName = 'opened';
        break;
      case 'email.clicked':
        // Increment click count instead of just setting timestamp
        const { data: currentEmail } = await supabase
          .from('emails')
          .select('click_count, clicked_at')
          .eq('id', emailRecord.id)
          .single();

        updateData = {
          click_count: (currentEmail?.click_count || 0) + 1,
          clicked_at: currentEmail?.clicked_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        statName = 'clicked';
        break;
      case 'email.bounced':
        updateData = { status: 'bounced', bounced_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        break;
      case 'email.complained':
        updateData = { status: 'complained', complained_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        break;
      default:
        console.log('Unhandled webhook event type:', type);
        return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
    }

    // Update the email record
    await supabase
      .from('emails')
      .update(updateData)
      .eq('id', emailRecord.id);

    // If this email is part of a broadcast, update broadcast stats
    if (emailRecord.broadcast_id && statName) {
      await supabase.rpc('increment_broadcast_stat', {
        p_broadcast_id: emailRecord.broadcast_id,
        p_stat_name: statName
      });
    }

    return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}