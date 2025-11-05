import { NextResponse } from "next/server"
import resend from "@/lib/resend"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 300 // 5 minutes for bulk sync

/**
 * Bulk sync all people from an account to Resend contacts
 * 
 * This is useful for initial setup or re-syncing contacts
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's profile and account
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_id")
      .eq("id", user.id)
      .single()

    if (!profile?.account_id) {
      return NextResponse.json(
        { error: "No account found for user" },
        { status: 404 }
      )
    }

    // Get all people with emails from this account
    const { data: people, error: peopleError } = await supabase
      .from("people")
      .select("id, email, first_name, last_name")
      .eq("account_id", profile.account_id)
      .not("email", "is", null)

    if (peopleError) {
      console.error("Error fetching people:", peopleError)
      return NextResponse.json(
        { error: "Failed to fetch people", details: peopleError },
        { status: 500 }
      )
    }

    if (!people || people.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No people with emails found",
        stats: { total: 0, synced: 0, failed: 0, skipped: 0 },
      })
    }

    // Get or create the default audience for this account
    const { data: audiences } = await resend.audiences.list()
    let audienceId: string

    if (audiences && audiences.data && audiences.data.length > 0) {
      // Use the first (default) audience
      audienceId = audiences.data[0].id
    } else {
      // Create a default audience
      const { data: newAudience, error: audienceError } = await resend.audiences.create({
        name: "Default Audience",
      })

      if (audienceError || !newAudience) {
        return NextResponse.json(
          { error: "Failed to create audience", details: audienceError },
          { status: 500 }
        )
      }

      audienceId = newAudience.id
    }

    // Sync each person to Resend
    let synced = 0
    let failed = 0
    let skipped = 0

    for (const person of people) {
      try {
        const { data, error } = await resend.contacts.create({
          audienceId,
          email: person.email!,
          firstName: person.first_name || "",
          lastName: person.last_name || "",
          unsubscribed: false,
        })

        if (error) {
          // If contact already exists, count as skipped
          if (error.message?.includes("already exists")) {
            skipped++
            continue
          }

          console.error(`Error creating contact for ${person.email}:`, error)
          failed++
          continue
        }

        synced++

        // Update person record with Resend contact ID
        if (data?.id) {
          await supabase
            .from("people")
            .update({
              metadata: {
                resend_contact_id: data.id,
              },
            })
            .eq("id", person.id)
        }

        // Add small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`Error syncing person ${person.id}:`, error)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${synced} contacts to Resend`,
      stats: {
        total: people.length,
        synced,
        failed,
        skipped,
      },
    })
  } catch (error: any) {
    console.error("Error in /api/resend/sync-all-contacts:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    )
  }
}

