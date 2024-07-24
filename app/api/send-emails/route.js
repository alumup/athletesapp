import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300;

export async function POST(req) {
  const data = await req.json();
  const { account, people, subject, sender, message, preview } = data;

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  try {
    const allPrimaryContacts = people.flatMap(person => person.primary_contacts);

    const emailPromises = allPrimaryContacts.map((contact, index) => {
      return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
          try {
            // Insert email record
            const { data: emailRecord, error: insertError } = await supabase
              .from('emails')
              .insert({
                account_id: account.id,
                sender_id: sender.id,
                recipient_id: contact.id,
                subject,
                content: message,
                status: 'pending'
              })
              .single();

            if (insertError) throw insertError;

            // Send email
            const emailResponse = await resend.emails.send({
              from: sender.email,
              to: contact.email,
              subject: subject,
              react: BasicTemplate({
                message,
                account,
                person: contact,
                preview,
              }),
            });

            // Update email record status
            await supabase
              .from('emails')
              .update({ 
                status: 'sent', 
                sent_at: new Date().toISOString(),
                resend_id: emailResponse.id  // Store the Resend email ID
              })
              .eq('id', emailRecord.id);

            resolve({ emailRecord, emailResponse });
          } catch (error) {
            reject(error);
          }
        }, index * 100);
      });
    });

    const emailResults = await Promise.all(emailPromises);

    return NextResponse.json(emailResults);
  } catch (error) {
    console.error("send-emails error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}