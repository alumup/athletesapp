import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";

export async function POST(req) {
  // get body data
  const data = await req.json();
  const account = data?.account;
  const people = data?.people;
  const subject = data?.subject;
  const message = data?.message;
  const preview = data?.preview;


  try {
    // Extract all primary contacts into a single array
    const allPrimaryContacts = people.flatMap(person => person.primary_contacts);

    

    // Then use the same logic to send emails
    const emailPromises = allPrimaryContacts.map((contact, index) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resend.emails.send({
            from: `${account.name} <${account.email}>`,
            to: contact.email,
            subject: subject,
            react: BasicTemplate({ message: message, account: account, person: contact, preview }),
          })
            .then(resolve)
            .catch(reject);
        }, index * 1000); // delay of 1 second
      });
    });

    // Wait for all emails to be sent
    const emailResponses = await Promise.all(emailPromises);

    console.log("EMAIL DATA", emailResponses)

    return NextResponse.json(emailResponses);
  } catch (error) {
    console.log("send-emails error", error);
    return NextResponse.json({ error });
  }
}
