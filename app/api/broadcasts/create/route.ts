import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createBroadcast, sendBroadcast } from "@/lib/resend-broadcasts"

export const maxDuration = 60

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id, accounts(*)")
      .eq("id", user.id)
      .single()

    if (!profile?.account_id) {
      return NextResponse.json({ error: "No account found" }, { status: 404 })
    }

    const body = await req.json()
    const { list_id, name, subject, content, sender, sendNow } = body

    // Get the list and its Resend segment ID
    const { data: list } = await supabase
      .from("lists")
      .select("*, list_people(count)")
      .eq("id", list_id)
      .eq("account_id", profile.account_id)
      .single()

    if (!list) {
      return NextResponse.json({ error: "List not found" }, { status: 404 })
    }

    if (!list.resend_segment_id) {
      return NextResponse.json(
        { error: "List not synced with Resend. Please sync the list first." },
        { status: 400 }
      )
    }

    // Get sender email from account
    const senderEmail = sender || `${profile.accounts.name} <${profile.accounts.email}>`

    // Create broadcast in Resend
    const resendResult = await createBroadcast({
      segmentId: list.resend_segment_id,
      from: senderEmail,
      subject,
      html: content,
      name,
    })

    if (!resendResult.success || !resendResult.data) {
      return NextResponse.json(
        { error: "Failed to create broadcast in Resend", details: resendResult.error },
        { status: 500 }
      )
    }

    const resendBroadcastId = resendResult.data.id

    // Create broadcast record in our database
    const { data: broadcast, error: broadcastError } = await supabase
      .from("broadcasts")
      .insert({
        account_id: profile.account_id,
        list_id: list.id,
        resend_broadcast_id: resendBroadcastId,
        resend_segment_id: list.resend_segment_id,
        name,
        subject,
        content,
        sender: senderEmail,
        status: sendNow ? "sending" : "draft",
        total_recipients: list.list_people?.[0]?.count || 0,
      })
      .select()
      .single()

    if (broadcastError) {
      console.error("Error creating broadcast record:", broadcastError)
      return NextResponse.json(
        { error: "Failed to create broadcast record" },
        { status: 500 }
      )
    }

    // Send immediately if requested
    if (sendNow) {
      const sendResult = await sendBroadcast(resendBroadcastId)

      if (!sendResult.success) {
        // Update status to failed
        await supabase
          .from("broadcasts")
          .update({ status: "failed" })
          .eq("id", broadcast.id)

        return NextResponse.json(
          { error: "Failed to send broadcast", details: sendResult.error },
          { status: 500 }
        )
      }

      // Update status to sent
      await supabase
        .from("broadcasts")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", broadcast.id)
    }

    return NextResponse.json({
      success: true,
      broadcast,
      resendBroadcastId,
    })
  } catch (error: any) {
    console.error("Error creating broadcast:", error)
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    )
  }
}

