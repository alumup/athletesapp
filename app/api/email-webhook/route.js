// pages/api/email-webhook.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const { type, data } = req.body;

    try {
      // Find the email record by the Resend email ID
      const { data: emailRecord, error } = await supabase
        .from('emails')
        .select('id')
        .eq('resend_id', data.email_id)
        .single();

      if (error) throw error;

      let updateData = {};

      switch (type) {
        case 'delivered':
          updateData = { status: 'delivered', delivered_at: new Date().toISOString() };
          break;
        case 'complained':
          updateData = { status: 'complained', opened_at: new Date().toISOString() };
          break;
        case 'opened':
          updateData = { status: 'opened', opened_at: new Date().toISOString() };
          break;
        case 'sent':
          updateData = { status: 'sent', opened_at: new Date().toISOString() };
          break;
        case 'bounced':
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
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}