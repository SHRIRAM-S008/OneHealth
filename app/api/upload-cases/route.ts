import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { type NextRequest, NextResponse } from "next/server"

interface CSVRow {
  patient_age?: string
  patient_gender?: string
  disease_name?: string
  symptoms?: string
  onset_date?: string
  location?: string
  latitude?: string
  longitude?: string
  notes?: string
}

function parseCSV(content: string): CSVRow[] {
  const lines = content.trim().split("\n")
  if (lines.length < 2) throw new Error("CSV file is empty")

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  const rows: CSVRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: CSVRow = {}

    headers.forEach((header, idx) => {
      if (values[idx]) {
        row[header as keyof CSVRow] = values[idx]
      }
    })

    rows.push(row)
  }

  return rows
}

async function categorizeDiseases(diseases: string[]): Promise<Record<string, string>> {
  const uniqueDiseases = [...new Set(diseases)]
  const categories: Record<string, string> = {}

  for (const disease of uniqueDiseases) {
    try {
      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Categorize this disease into one of these categories: infectious, chronic, parasitic, environmental, genetic, or other. Disease: "${disease}". Respond with only the category name.`,
      })

      categories[disease] = text.trim().toLowerCase()
    } catch {
      categories[disease] = "other"
    }
  }

  return categories
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's organization
    const { data: caseData } = await supabase
      .from("disease_cases")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single()

    let organizationId = caseData?.organization_id

    if (!organizationId) {
      // Create a default organization if none exists
      const { data: newOrg } = await supabase
        .from("organizations")
        .insert([
          {
            name: "Default Organization",
            type: "hospital",
            location: "Unknown",
          },
        ])
        .select()
        .single()

      organizationId = newOrg?.id
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const content = await file.text()
    const rows = parseCSV(content)

    // Extract unique diseases for categorization
    const diseases = rows.map((r) => r.disease_name || "Unknown").filter(Boolean)
    const diseaseCategories = await categorizeDiseases(diseases)

    // Prepare cases for insertion
    const casesToInsert = rows
      .map((row) => {
        if (!row.disease_name || !row.onset_date) {
          return null
        }

        return {
          organization_id: organizationId,
          user_id: user.id,
          patient_age: row.patient_age ? Number.parseInt(row.patient_age) : null,
          patient_gender: row.patient_gender || null,
          disease_name: row.disease_name,
          disease_category: diseaseCategories[row.disease_name] || "other",
          symptoms: row.symptoms ? row.symptoms.split(",").map((s) => s.trim()) : [],
          onset_date: row.onset_date,
          report_date: new Date().toISOString().split("T")[0],
          location: row.location || null,
          latitude: row.latitude ? Number.parseFloat(row.latitude) : null,
          longitude: row.longitude ? Number.parseFloat(row.longitude) : null,
          notes: row.notes || null,
          status: "reported",
        }
      })
      .filter(Boolean)

    if (casesToInsert.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No valid cases found in CSV",
        casesProcessed: rows.length,
        casesCreated: 0,
        errors: [{ row: 1, error: "No valid cases with disease_name and onset_date" }],
      })
    }

    // Insert cases
    const { data, error } = await supabase.from("disease_cases").insert(casesToInsert).select()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to insert cases",
          casesProcessed: rows.length,
          casesCreated: 0,
          errors: [{ row: 0, error: error.message }],
        },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${data?.length || 0} cases`,
      casesProcessed: rows.length,
      casesCreated: data?.length || 0,
      errors: [],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Upload failed",
        casesProcessed: 0,
        casesCreated: 0,
        errors: [{ row: 0, error: error instanceof Error ? error.message : "Unknown error" }],
      },
      { status: 500 },
    )
  }
}
