// pages/api/email-webhook.js
import { createClient } from '@supabase/supabase-js';
import { Resend } from '@resend/node';

const resend = new Resend(process.env.RESEND_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // Get the raw body and signature
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const rawBody = Buffer.concat(chunks).toString('utf8');
    const signature = req.headers['resend-signature'];

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

      res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(400).json({ error: 'Invalid signature' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}