import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const seedToken = process.env.SEED_TOKEN

  try {
    if (!url || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase service configuration" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const providedToken = searchParams.get("token") || ""
    if (seedToken && providedToken !== seedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(url, serviceRoleKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    })

    // Upsert organizations
    const organizations = [
      { id: "550e8400-e29b-41d4-a716-446655440001", name: "Central Hospital", type: "hospital", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, contact_email: "admin@centralhospital.com", contact_phone: "+1-212-555-0001" },
      { id: "550e8400-e29b-41d4-a716-446655440002", name: "Riverside Veterinary Center", type: "veterinary_center", location: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437, contact_email: "info@riversidevetcenter.com", contact_phone: "+1-213-555-0002" },
      { id: "550e8400-e29b-41d4-a716-446655440003", name: "State Health Department", type: "health_official", location: "Chicago, IL", latitude: 41.8781, longitude: -87.6298, contact_email: "surveillance@statehealth.gov", contact_phone: "+1-312-555-0003" },
      { id: "550e8400-e29b-41d4-a716-446655440004", name: "Metro Medical Center", type: "hospital", location: "Houston, TX", latitude: 29.7604, longitude: -95.3698, contact_email: "contact@metromed.com", contact_phone: "+1-713-555-0004" },
      { id: "550e8400-e29b-41d4-a716-446655440005", name: "Wildlife Veterinary Clinic", type: "veterinary_center", location: "Denver, CO", latitude: 39.7392, longitude: -104.9903, contact_email: "wildlife@vetclinic.com", contact_phone: "+1-303-555-0005" },
    ]
    let err
    ;({ error: err } = await supabase.from("organizations").upsert(organizations, { onConflict: "id" }))
    if (err) throw err

    // Disease cases (user_id nullable for demo)
    const diseaseCases = [
      { id: "650e8400-e29b-41d4-a716-446655440001", organization_id: "550e8400-e29b-41d4-a716-446655440001", user_id: null, patient_age: 35, patient_gender: "M", disease_name: "Influenza", disease_category: "Respiratory", symptoms: ["fever", "cough", "fatigue"], onset_date: "2025-10-20", report_date: "2025-10-21", status: "confirmed", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, notes: "Patient hospitalized for 3 days" },
      { id: "650e8400-e29b-41d4-a716-446655440002", organization_id: "550e8400-e29b-41d4-a716-446655440001", user_id: null, patient_age: 28, patient_gender: "F", disease_name: "Influenza", disease_category: "Respiratory", symptoms: ["fever", "sore throat", "cough"], onset_date: "2025-10-21", report_date: "2025-10-22", status: "confirmed", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, notes: "Close contact with case 1" },
      { id: "650e8400-e29b-41d4-a716-446655440003", organization_id: "550e8400-e29b-41d4-a716-446655440001", user_id: null, patient_age: 42, patient_gender: "M", disease_name: "Influenza", disease_category: "Respiratory", symptoms: ["fever", "cough", "body aches"], onset_date: "2025-10-22", report_date: "2025-10-23", status: "confirmed", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, notes: "Healthcare worker" },
      { id: "650e8400-e29b-41d4-a716-446655440004", organization_id: "550e8400-e29b-41d4-a716-446655440001", user_id: null, patient_age: 55, patient_gender: "F", disease_name: "COVID-19", disease_category: "Respiratory", symptoms: ["fever", "cough", "shortness of breath"], onset_date: "2025-10-19", report_date: "2025-10-20", status: "confirmed", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, notes: "Severe case, ICU admission" },
      { id: "650e8400-e29b-41d4-a716-446655440005", organization_id: "550e8400-e29b-41d4-a716-446655440001", user_id: null, patient_age: 31, patient_gender: "M", disease_name: "Measles", disease_category: "Viral", symptoms: ["rash", "fever", "cough"], onset_date: "2025-10-18", report_date: "2025-10-19", status: "reported", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, notes: "Unvaccinated patient" },
      { id: "650e8400-e29b-41d4-a716-446655440006", organization_id: "550e8400-e29b-41d4-a716-446655440002", user_id: null, patient_age: 5, patient_gender: "M", disease_name: "Canine Distemper", disease_category: "Viral", symptoms: ["fever", "cough", "lethargy"], onset_date: "2025-10-20", report_date: "2025-10-21", status: "confirmed", location: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437, notes: "Dog from local shelter" },
      { id: "650e8400-e29b-41d4-a716-446655440007", organization_id: "550e8400-e29b-41d4-a716-446655440002", user_id: null, patient_age: 3, patient_gender: "F", disease_name: "Canine Distemper", disease_category: "Viral", symptoms: ["fever", "nasal discharge"], onset_date: "2025-10-21", report_date: "2025-10-22", status: "confirmed", location: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437, notes: "Contact with case 6" },
      { id: "650e8400-e29b-41d4-a716-446655440008", organization_id: "550e8400-e29b-41d4-a716-446655440002", user_id: null, patient_age: 7, patient_gender: "M", disease_name: "Feline Leukemia", disease_category: "Viral", symptoms: ["lethargy", "anorexia"], onset_date: "2025-10-15", report_date: "2025-10-16", status: "resolved", location: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437, notes: "Treated successfully" },
      { id: "650e8400-e29b-41d4-a716-446655440009", organization_id: "550e8400-e29b-41d4-a716-446655440004", user_id: null, patient_age: 45, patient_gender: "M", disease_name: "Dengue Fever", disease_category: "Viral", symptoms: ["fever", "headache", "joint pain"], onset_date: "2025-10-17", report_date: "2025-10-18", status: "confirmed", location: "Houston, TX", latitude: 29.7604, longitude: -95.3698, notes: "Recent travel to endemic area" },
      { id: "650e8400-e29b-41d4-a716-446655440010", organization_id: "550e8400-e29b-41d4-a716-446655440004", user_id: null, patient_age: 38, patient_gender: "F", disease_name: "Dengue Fever", disease_category: "Viral", symptoms: ["fever", "rash", "muscle pain"], onset_date: "2025-10-18", report_date: "2025-10-19", status: "confirmed", location: "Houston, TX", latitude: 29.7604, longitude: -95.3698, notes: "Family member of case 9" },
    ]
    ;({ error: err } = await supabase.from("disease_cases").upsert(diseaseCases, { onConflict: "id" }))
    if (err) throw err

    // Outbreaks
    const outbreaks = [
      { id: "750e8400-e29b-41d4-a716-446655440001", disease_name: "Influenza", disease_category: "Respiratory", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, case_count: 3, severity: "high", status: "active", detected_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "750e8400-e29b-41d4-a716-446655440002", disease_name: "Canine Distemper", disease_category: "Viral", location: "Los Angeles, CA", latitude: 34.0522, longitude: -118.2437, case_count: 2, severity: "medium", status: "active", detected_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "750e8400-e29b-41d4-a716-446655440003", disease_name: "Dengue Fever", disease_category: "Viral", location: "Houston, TX", latitude: 29.7604, longitude: -95.3698, case_count: 2, severity: "medium", status: "active", detected_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
      { id: "750e8400-e29b-41d4-a716-446655440004", disease_name: "COVID-19", disease_category: "Respiratory", location: "New York, NY", latitude: 40.7128, longitude: -74.0060, case_count: 1, severity: "low", status: "contained", detected_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    ]
    ;({ error: err } = await supabase.from("outbreaks").upsert(outbreaks, { onConflict: "id" }))
    if (err) throw err

    // Alerts
    const alerts = [
      { id: "850e8400-e29b-41d4-a716-446655440001", outbreak_id: "750e8400-e29b-41d4-a716-446655440001", organization_id: "550e8400-e29b-41d4-a716-446655440001", alert_type: "new_outbreak", message: "New Influenza outbreak detected in New York, NY with 3 confirmed cases", is_read: false },
      { id: "850e8400-e29b-41d4-a716-446655440002", outbreak_id: "750e8400-e29b-41d4-a716-446655440001", organization_id: "550e8400-e29b-41d4-a716-446655440001", alert_type: "case_increase", message: "Influenza case count increased to 3 in New York, NY", is_read: false },
      { id: "850e8400-e29b-41d4-a716-446655440003", outbreak_id: "750e8400-e29b-41d4-a716-446655440001", organization_id: "550e8400-e29b-41d4-a716-446655440001", alert_type: "severity_change", message: "Influenza outbreak severity changed to HIGH in New York, NY", is_read: true },
      { id: "850e8400-e29b-41d4-a716-446655440004", outbreak_id: "750e8400-e29b-41d4-a716-446655440002", organization_id: "550e8400-e29b-41d4-a716-446655440002", alert_type: "new_outbreak", message: "New Canine Distemper outbreak detected in Los Angeles, CA", is_read: false },
      { id: "850e8400-e29b-41d4-a716-446655440005", outbreak_id: "750e8400-e29b-41d4-a716-446655440003", organization_id: "550e8400-e29b-41d4-a716-446655440004", alert_type: "new_outbreak", message: "New Dengue Fever outbreak detected in Houston, TX", is_read: false },
    ]
    ;({ error: err } = await supabase.from("alerts").upsert(alerts, { onConflict: "id" }))
    if (err) throw err

    // Analytics snapshots
    const snapshots = [
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 2, confirmed_cases: 1, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["COVID-19"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 3, confirmed_cases: 2, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["COVID-19", "Influenza"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 4, confirmed_cases: 3, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Influenza", "COVID-19"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 5, confirmed_cases: 4, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Influenza", "COVID-19", "Measles"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 5, confirmed_cases: 4, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 1, top_diseases: ["Influenza", "COVID-19", "Measles"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440001", snapshot_date: new Date().toISOString().slice(0, 10), total_cases: 5, confirmed_cases: 4, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 1, top_diseases: ["Influenza", "COVID-19", "Measles"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440002", snapshot_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 1, confirmed_cases: 0, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["Canine Distemper"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440002", snapshot_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 2, confirmed_cases: 1, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["Canine Distemper"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440002", snapshot_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 3, confirmed_cases: 2, resolved_cases: 1, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Canine Distemper", "Feline Leukemia"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440002", snapshot_date: new Date().toISOString().slice(0, 10), total_cases: 3, confirmed_cases: 2, resolved_cases: 1, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Canine Distemper", "Feline Leukemia"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440004", snapshot_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 1, confirmed_cases: 0, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["Dengue Fever"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440004", snapshot_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 2, confirmed_cases: 1, resolved_cases: 0, active_outbreaks: 0, critical_outbreaks: 0, top_diseases: ["Dengue Fever"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440004", snapshot_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), total_cases: 2, confirmed_cases: 2, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Dengue Fever"] },
      { organization_id: "550e8400-e29b-41d4-a716-446655440004", snapshot_date: new Date().toISOString().slice(0, 10), total_cases: 2, confirmed_cases: 2, resolved_cases: 0, active_outbreaks: 1, critical_outbreaks: 0, top_diseases: ["Dengue Fever"] },
    ]
    ;({ error: err } = await supabase.from("analytics_snapshots").upsert(snapshots, { onConflict: "organization_id,snapshot_date" }))
    if (err) throw err

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Seed error", error)
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 })
  }
}


