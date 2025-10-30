import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Test 1: Check if we can get the user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Test 2: Check if we can get disease cases count
    const { count: casesCount, error: casesCountError } = await supabase
      .from("disease_cases")
      .select("*", { count: "exact", head: true })

    // Test 3: Check if we can get outbreaks count
    const { count: outbreaksCount, error: outbreaksCountError } = await supabase
      .from("outbreaks")
      .select("*", { count: "exact", head: true })

    // Test 4: Check if we can get alerts count
    const { count: alertsCount, error: alertsCountError } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })

    // Test 5: Try to get actual data
    const { data: sampleCases, error: sampleCasesError } = await supabase
      .from("disease_cases")
      .select("*")
      .limit(3)

    const { data: sampleOutbreaks, error: sampleOutbreaksError } = await supabase
      .from("outbreaks")
      .select("*")
      .limit(3)

    const { data: sampleAlerts, error: sampleAlertsError } = await supabase
      .from("alerts")
      .select("*")
      .limit(3)

    // Test 6: Try to get data as if we were authenticated (simulate public access)
    // This will help us determine if RLS is still enabled
    const { data: publicCases, error: publicCasesError } = await supabase
      .from("disease_cases")
      .select("*")
      .limit(1)

    return NextResponse.json({
      success: true,
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message,
      counts: {
        cases: casesCount,
        outbreaks: outbreaksCount,
        alerts: alertsCount,
      },
      countErrors: {
        cases: casesCountError?.message,
        outbreaks: outbreaksCountError?.message,
        alerts: alertsCountError?.message,
      },
      sampleData: {
        cases: sampleCases,
        outbreaks: sampleOutbreaks,
        alerts: sampleAlerts,
      },
      sampleErrors: {
        cases: sampleCasesError?.message,
        outbreaks: sampleOutbreaksError?.message,
        alerts: sampleAlertsError?.message,
      },
      publicAccessTest: {
        cases: publicCases,
        error: publicCasesError?.message,
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}