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
    // loop through the people array and send an email to each person
    people.forEach(async (person) => {
      const data = await resend.emails.send({
        from: `${account.name} <${account.email}>`,
        to: person.primary_contact.email,
        subject: subject,
        react: BasicTemplate({ message: message }),
      });

      console.log("EMAIL DATA", data)
    });

    return NextResponse.json(data);
  } catch (error) {
    console.log("send-emails error", error);
    return NextResponse.json({ error });
  }
}
