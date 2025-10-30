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
  // Handle different line endings
  const lines = content.trim().split(/\r?\n/)
  if (lines.length < 2) throw new Error("CSV file is empty or invalid format")

  // Parse headers
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
  
  // Validate required headers
  const requiredHeaders = ["disease_name", "onset_date"]
  const missingHeaders = requiredHeaders.filter(header => !headers.includes(header))
  
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`)
  }

  const rows: CSVRow[] = []

  // Regular expression to parse CSV lines with quoted values
  const csvRegex = /(?<=^|,)("(?:[^"]|"")*"|[^,]*)(?=,|$)/g

  for (let i = 1; i < lines.length; i++) {
    // Skip empty lines
    if (lines[i].trim() === "") continue
    
    // Parse values using regex to handle quoted values correctly
    const matches = lines[i].match(csvRegex) || []
    const values = matches.map(v => {
      // Remove surrounding quotes and unescape double quotes
      if (v.startsWith('"') && v.endsWith('"')) {
        return v.substring(1, v.length - 1).replace(/""/g, '"')
      }
      return v.trim()
    })
    
    const row: CSVRow = {}

    headers.forEach((header, idx) => {
      const value = values[idx]
      if (value !== undefined && value !== "") {
        row[header as keyof CSVRow] = value
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
      // Check if OPENAI_API_KEY is configured
      if (!process.env.OPENAI_API_KEY) {
        console.warn("OPENAI_API_KEY not configured, using default category 'other'")
        categories[disease] = "other"
        continue
      }

      const { text } = await generateText({
        model: "openai/gpt-4o-mini",
        prompt: `Categorize this disease into one of these categories: infectious, chronic, parasitic, environmental, genetic, or other. Disease: "${disease}". Respond with only the category name.`,
      })

      categories[disease] = text.trim().toLowerCase()
    } catch (error) {
      console.error(`Failed to categorize disease '${disease}':`, error)
      // Use a default category if AI categorization fails
      categories[disease] = "other"
    }
  }

  return categories
}

export async function POST(request: NextRequest) {
  console.log("Upload request received")
  
  try {
    const supabase = await createClient()
    console.log("Supabase client created successfully")
    // Create a default organization if none exists
    const { data: organizations } = await supabase.from("organizations").select("id").limit(1)
    
    let organizationId: string | undefined
    
    if (organizations && organizations.length === 0) {
      // Create a default organization if none exists
      const { data: newOrg } = await supabase
        .from("organizations")
        .insert([
          {
            name: "Public Organization",
            type: "hospital",
            location: "Unknown",
          },
        ])
        .select()
        .single()

      organizationId = newOrg?.id
    } else {
      // Use the first existing organization
      organizationId = organizations?.[0]?.id
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    console.log("File received:", file?.name, file?.size)

    if (!file) {
      console.log("No file provided in request")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    console.log("File type:", file.type, "File name:", file.name)
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      console.log("Invalid file type detected")
      return NextResponse.json({ error: "Invalid file type. Please upload a CSV file." }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum file size is 5MB." }, { status: 400 })
    }

    const content = await file.text()
    
    // Validate content is not empty
    if (!content.trim()) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 })
    }
    
    let rows: CSVRow[] = []
    try {
      rows = parseCSV(content)
    } catch (parseError) {
      return NextResponse.json({ 
        error: "Failed to parse CSV file", 
        details: parseError instanceof Error ? parseError.message : "Invalid CSV format" 
      }, { status: 400 })
    }

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
          user_id: null,  // Set to null for public uploads
          patient_age: row.patient_age ? Number.parseInt(row.patient_age) : null,
          patient_gender: row.patient_gender || null,
          disease_name: row.disease_name,
          disease_category: diseaseCategories[row.disease_name] || "other",
          symptoms: row.symptoms ? row.symptoms.split(",").map((s) => s.trim()) : [],
          onset_date: row.onset_date,
          report_date: new Date().toISOString().split("T")[0],
          location: row.location || null,
          latitude: row.latitude ? (() => {
            const lat = parseFloat(row.latitude!);
            return isNaN(lat) || lat < -90 || lat > 90 ? null : lat;
          })() : null,
          longitude: row.longitude ? (() => {
            const lon = parseFloat(row.longitude!);
            return isNaN(lon) || lon < -180 || lon > 180 ? null : lon;
          })() : null,
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