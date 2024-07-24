import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(req) {
  try {
    // get body data
    const data = await req.json();
    const account = data?.account;
    const people = data?.people;
    const subject = data?.subject;
    const sender = data?.sender;
    const message = data?.message;
    const preview = data?.preview;

    console.log("SENDER", sender);

    // Extract all primary contacts into a single array
    const allPrimaryContacts = people.flatMap(
      (person) => person.primary_contacts,
    );

    // Then use the same logic to send emails
    const emailPromises = allPrimaryContacts.map((contact, index) => {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const emailResponse = await resend.emails.send({
              from: sender,
              to: contact.email,
              subject: subject,
              react: BasicTemplate({
                message: message,
                account: account,
                person: contact,
                preview,
              }),
            });

            console.log(`Email sent to ${contact.email}:`, emailResponse);

            // Log the email in the database
            const { data: emailLog, error: logError } = await supabase
              .from('emails')
              .insert({
                account_id: account.id,
                sender: sender,
                recipient_id: contact.id,
                subject: subject,
                content: message,
                status: 'sent',
                sent_at: new Date().toISOString(),
                resend_id: emailResponse.id
              });

            if (logError) {
              console.error('Error logging email:', logError);
            } else {
              console.log('Email logged successfully:', emailLog);
            }

            resolve(emailResponse);
          } catch (error) {
            console.error(`Error sending email to ${contact.email}:`, error);
            reject(error);
          }
        }, index * 100); // delay of 100ms
      });
    });

    // Wait for all emails to be sent
    const emailResponses = await Promise.all(emailPromises);
    console.log("EMAIL DATA", JSON.stringify(emailResponses, null, 2));

    return NextResponse.json({ success: true, data: emailResponses });
  } catch (error) {
    console.error("send-emails error", error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
}