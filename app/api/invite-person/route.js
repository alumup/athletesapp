import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";


const domain = process.env.NODE_ENV === 'production' ? 'https://app.athletes.app' : 'http://app.localhost:3000'

export async function POST(req) {
  // get body data
  const data = await req.json();
  const account = data?.account;
  const person = data?.person;
  const subject = data?.subject;
  const message = `You've been invited to join ${account.name} to manage your athletes. Click the link to get access to your account. ${domain}/login?email=${person.primary_contacts[0].email}&account_id=${account.id}&people_id=${person.id}&sign_up=true`;



  try {
    // loop through the people array and send an email to each person
    if (!person) {
      console.log("person is undefined");
    } else if (!person.primary_contacts) {
      console.log("person.primary_contacts is undefined");
    } else if (!person.primary_contacts[0]) {
      console.log("person.primary_contacts[0] is undefined");
    } else {
      // Your existing code
      const data = await resend.emails.send({
        from: `${account.name} <${account.senders[0].email}>`,
        to: person.primary_contacts[0].email,
        subject: subject,
        react: BasicTemplate({ message: message }),
      });
      return NextResponse.json(data);
    }

  } catch (error) {
    console.log("invite-person error", error);
    return NextResponse.json({ error });
  }
}
