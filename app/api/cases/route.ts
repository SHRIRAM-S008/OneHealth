import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Fetch cases
    let query = supabase.from("disease_cases").select("*").eq("organization_id", userRole.organization_id).limit(limit)

    if (status) {
      query = query.eq("status", status)
    }

    const { data: cases, error } = await query

    if (error) throw error

    return NextResponse.json(cases)
  } catch (error) {
    console.error("Error fetching cases:", error)
    return NextResponse.json({ error: "Failed to fetch cases" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("organization_id")
      .eq("user_id", user.id)
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    // Create case
    const { data: newCase, error } = await supabase
      .from("disease_cases")
      .insert({
        organization_id: userRole.organization_id,
        user_id: user.id,
        ...body,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Error creating case:", error)
    return NextResponse.json({ error: "Failed to create case" }, { status: 500 })
  }
}
