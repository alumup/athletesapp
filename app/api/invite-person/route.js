import { BasicTemplate } from "@/components/emails/basic-template";
import { NextResponse } from "next/server";
import resend from "@/lib/resend";

const domain =
  process.env.NODE_ENV === "production"
    ? "https://app.athletes.app"
    : "http://app.localhost:3000";
const sign_in =
  process.env.NODE_ENV === "production"
    ? "https://app.athletes.app/login"
    : "http://app.localhost:3000/login";

export async function POST(req) {
  // get body data
  const data = await req.json();
  const account = data?.account;
  const person = data?.person;
  const subject = data?.subject;
  const email = data?.email;
  const encryptedEmail = data?.encryptedEmail;
  const message = `You've been invited to join ${account.name} to manage your athletes. If you have an Athletes App account please sign in at ${sign_in}. If you don't click this link to get access to your account. ${domain}/login?email=${encryptedEmail}&account_id=${account.id}&people_id=${person.id}&sign_up=true`;

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
        from: `${account.name} <${account.senders[2] ? account.senders[2].email : account.senders[0].email}>`,
        to: email || person.primary_contacts[0].email,
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
