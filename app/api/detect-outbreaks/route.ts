import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

interface CaseData {
  id: string
  disease_name: string
  disease_category: string
  location: string
  onset_date: string
  status: string
}

function calculateOutbreakSeverity(caseCount: number): string {
  if (caseCount >= 20) return "critical"
  if (caseCount >= 10) return "high"
  if (caseCount >= 5) return "medium"
  return "low"
}

export async function POST() {
  try {
    const supabase = await createClient()

    // Get all cases from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentCases } = await supabase
      .from("disease_cases")
      .select("*")
      .gte("onset_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("onset_date", { ascending: false })

    if (!recentCases || recentCases.length === 0) {
      return NextResponse.json({ message: "No recent cases to analyze" })
    }

    // Group cases by disease and location
    const outbreakCandidates = new Map<string, CaseData[]>()

    recentCases.forEach((case_) => {
      const key = `${case_.disease_name}|${case_.location || "unknown"}`
      if (!outbreakCandidates.has(key)) {
        outbreakCandidates.set(key, [])
      }
      outbreakCandidates.get(key)!.push(case_)
    })

    // Detect outbreaks (3+ cases of same disease in same location within 30 days)
    const outbreaksToCreate = []
    const alertsToCreate = []

    for (const [key, cases] of outbreakCandidates.entries()) {
      if (cases.length >= 3) {
        const [diseaseName, location] = key.split("|")

        // Check if outbreak already exists
        const { data: existingOutbreak } = await supabase
          .from("outbreaks")
          .select("*")
          .eq("disease_name", diseaseName)
          .eq("location", location)
          .eq("status", "active")
          .single()

        if (!existingOutbreak) {
          const severity = calculateOutbreakSeverity(cases.length)

          outbreaksToCreate.push({
            disease_name: diseaseName,
            disease_category: cases[0].disease_category,
            location: location,
            case_count: cases.length,
            severity: severity,
            status: "active",
          })

          alertsToCreate.push({
            alert_type: "new_outbreak",
            message: `New outbreak detected: ${cases.length} cases of ${diseaseName} in ${location}`,
            severity: severity,
          })
        } else if (existingOutbreak.case_count < cases.length) {
          // Update existing outbreak with new case count
          const newSeverity = calculateOutbreakSeverity(cases.length)
          const caseIncrease = cases.length - existingOutbreak.case_count

          await supabase
            .from("outbreaks")
            .update({
              case_count: cases.length,
              severity: newSeverity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingOutbreak.id)

          if (newSeverity !== existingOutbreak.severity) {
            alertsToCreate.push({
              outbreak_id: existingOutbreak.id,
              alert_type: "severity_change",
              message: `Outbreak severity changed to ${newSeverity}: ${diseaseName} in ${location}`,
            })
          } else if (caseIncrease > 0) {
            alertsToCreate.push({
              outbreak_id: existingOutbreak.id,
              alert_type: "case_increase",
              message: `${caseIncrease} new cases reported for ${diseaseName} in ${location}`,
            })
          }
        }
      }
    }

    // Insert new outbreaks
    if (outbreaksToCreate.length > 0) {
      const { data: createdOutbreaks } = await supabase.from("outbreaks").insert(outbreaksToCreate).select()

      // Create alerts for new outbreaks
      if (createdOutbreaks) {
        const alertsWithOutbreakIds = alertsToCreate
          .filter((a) => a.alert_type === "new_outbreak")
          .map((a, idx) => ({
            ...a,
            outbreak_id: createdOutbreaks[idx]?.id,
          }))

        if (alertsWithOutbreakIds.length > 0) {
          await supabase.from("alerts").insert(alertsWithOutbreakIds)
        }
      }
    }

    // Insert other alerts
    const otherAlerts = alertsToCreate.filter((a) => a.alert_type !== "new_outbreak")
    if (otherAlerts.length > 0) {
      await supabase.from("alerts").insert(otherAlerts)
    }

    return NextResponse.json({
      success: true,
      outbreaksDetected: outbreaksToCreate.length,
      alertsCreated: alertsToCreate.length,
    })
  } catch (error) {
    console.error("Error detecting outbreaks:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Detection failed" }, { status: 500 })
  }
}
