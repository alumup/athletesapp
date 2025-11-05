import resend from "./resend"
import { createClient } from "@/lib/supabase/server"

/**
 * Resend Broadcasts Integration
 * 
 * This module handles:
 * - Syncing lists to Resend segments
 * - Syncing people to Resend contacts
 * - Creating and sending broadcasts
 * - Tracking broadcast delivery
 */

export interface ResendContact {
  email: string
  firstName?: string
  lastName?: string
  unsubscribed?: boolean
}

export interface BroadcastOptions {
  segmentId: string
  from: string
  subject: string
  html: string
  text?: string
  name?: string
}

/**
 * Sync a person to Resend as a contact
 */
export async function syncPersonToResend(person: {
  id: string
  email: string
  first_name?: string
  last_name?: string
}) {
  try {
    const { data, error } = await resend.contacts.create({
      email: person.email,
      firstName: person.first_name || "",
      lastName: person.last_name || "",
      unsubscribed: false,
    })

    if (error) {
      console.error("Error syncing contact to Resend:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error syncing contact to Resend:", error)
    return { success: false, error }
  }
}

/**
 * Create or get a segment in Resend
 */
export async function createResendSegment(name: string, description?: string) {
  try {
    const { data, error } = await resend.segments.create({
      name,
      description: description || `Segment for ${name}`,
    })

    if (error) {
      console.error("Error creating Resend segment:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating Resend segment:", error)
    return { success: false, error }
  }
}

/**
 * Add a contact to a segment
 */
export async function addContactToSegment(contactId: string, segmentId: string) {
  try {
    const { data, error } = await resend.contacts.addToSegment({
      contactId,
      segmentId,
    })

    if (error) {
      console.error("Error adding contact to segment:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error adding contact to segment:", error)
    return { success: false, error }
  }
}

/**
 * Create a broadcast (doesn't send it yet)
 */
export async function createBroadcast(options: BroadcastOptions) {
  try {
    const { data, error } = await resend.broadcasts.create({
      segmentId: options.segmentId,
      from: options.from,
      subject: options.subject,
      html: options.html,
      text: options.text,
      name: options.name,
    })

    if (error) {
      console.error("Error creating broadcast:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error creating broadcast:", error)
    return { success: false, error }
  }
}

/**
 * Send a broadcast immediately
 */
export async function sendBroadcast(broadcastId: string) {
  try {
    const { data, error } = await resend.broadcasts.send(broadcastId)

    if (error) {
      console.error("Error sending broadcast:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error sending broadcast:", error)
    return { success: false, error }
  }
}

/**
 * Get broadcast details
 */
export async function getBroadcast(broadcastId: string) {
  try {
    const { data, error } = await resend.broadcasts.get(broadcastId)

    if (error) {
      console.error("Error getting broadcast:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting broadcast:", error)
    return { success: false, error }
  }
}

/**
 * Sync all people from an account to Resend contacts
 */
export async function syncAccountPeopleToResend(accountId: string) {
  const supabase = await createClient()

  try {
    // Get all people with emails
    const { data: people, error } = await supabase
      .from("people")
      .select("id, email, first_name, last_name")
      .eq("account_id", accountId)
      .not("email", "is", null)

    if (error) {
      console.error("Error fetching people:", error)
      return { success: false, error }
    }

    // Sync each person to Resend
    const results = await Promise.allSettled(
      people.map((person) => syncPersonToResend(person))
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return {
      success: true,
      data: {
        total: people.length,
        successful,
        failed,
      },
    }
  } catch (error) {
    console.error("Error syncing people to Resend:", error)
    return { success: false, error }
  }
}

