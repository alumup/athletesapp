import { NextResponse } from "next/server";
import { sendEmails } from "@/lib/email-service";
import { revalidatePath } from "next/cache";

export const maxDuration = 60;

/**
 * Legacy send-emails endpoint
 * Migrated to use unified email service
 * 
 * @deprecated Use /api/email/send instead
 */
export async function POST(req) {
  try {
    // Get body data
    const data = await req.json();
    const account = data?.account;
    const people = data?.people;
    const subject = data?.subject;
    const sender = data?.sender;
    const message = data?.message;
    const preview = data?.preview;

    if (!account?.id) {
      return NextResponse.json(
        { error: "Account ID is required" },
        { status: 400 }
      );
    }

    if (!sender) {
      return NextResponse.json(
        { error: "Sender is required" },
        { status: 400 }
      );
    }

    if (!people || people.length === 0) {
      return NextResponse.json(
        { error: "People array is required" },
        { status: 400 }
      );
    }

    // Extract all primary contacts and people with emails, removing duplicates
    const allRecipients = people.flatMap((person) => {
      const recipients = new Set();
      
      // Add primary contacts
      (person.primary_contacts || []).forEach(contact => {
        if (contact.email) {
          recipients.add(JSON.stringify({
            email: contact.email,
            person_id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            name: contact.name,
          }));
        }
      });

      // Add person if they have an email and it's not already included
      if (person.email && ![...recipients].some(r => JSON.parse(r).email === person.email)) {
        recipients.add(JSON.stringify({
          email: person.email,
          person_id: person.id,
          first_name: person.first_name,
          last_name: person.last_name,
          name: person.name,
        }));
      }

      return Array.from(recipients).map(r => JSON.parse(r));
    });

    if (allRecipients.length === 0) {
      return NextResponse.json(
        { error: "No valid email recipients found" },
        { status: 400 }
      );
    }

    // Use unified email service
    const result = await sendEmails({
      type: allRecipients.length === 1 ? "one-off" : "batch",
      sender,
      recipients: allRecipients,
      subject,
      content: message,
      preview,
      template: "basic",
      account_id: account.id,
      account,
    });

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Failed to send emails",
          details: result.error,
          sent_count: result.sent_count || 0,
          failed_count: result.failed_count || 0,
        },
        { status: 500 }
      );
    }

    // Revalidate the emails page to show the newly sent emails
    revalidatePath("/emails");

    return NextResponse.json({ 
      success: true, 
      data: result.email_ids,
      sent_count: result.sent_count,
      failed_count: result.failed_count,
    });
  } catch (error) {
    console.error("send-emails error", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
