import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

export async function POST(req) {
  try {
    // get body data
    const data = await req.json();
    const { account, people, subject, sender, message, preview } = data;

    console.log("SENDER", sender);

    // Extract all primary contacts into a single array
    const allPrimaryContacts = people.flatMap(
      (person) => person.primary_contacts,
    );

    // Then use the same logic to send emails
    const emailPromises = allPrimaryContacts.map((contact, index) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resend.emails
            .send({
              from: sender,
              to: contact.email,
              subject: subject,
              react: BasicTemplate({
                message: message,
                account: account,
                person: contact,
                preview,
              }),
            })
            .then(resolve)
            .catch(reject);
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