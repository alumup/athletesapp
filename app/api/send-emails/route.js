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

  console.log("EMAILLLLLLL ->", data)

  try {
    // Create an array of promises for each person
    const emailPromises = people.map((person) => {
      return resend.emails.send({
        from: `${account.name} <${account.email}>`,
        to: person.primary_contact.email,
        subject: subject,
        react: BasicTemplate({ message: message }),
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