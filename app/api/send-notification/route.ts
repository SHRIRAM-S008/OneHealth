import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { organizationId, alertType, message, recipientEmails } = await request.json()

    // For now, we'll log the notification and store it in the alerts table
    const supabase = await createClient()

    // Store notification in alerts table for audit trail
    const { error } = await supabase.from("alerts").insert({
      organization_id: organizationId,
      alert_type: alertType,
      message,
      is_read: false,
      created_at: new Date().toISOString(),
    })

    if (error) throw error

    // In production, send actual emails here
    console.log(`[Email] Sending ${alertType} to ${recipientEmails.join(", ")}: ${message}`)

    return NextResponse.json({ success: true, message: "Notification sent" })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}