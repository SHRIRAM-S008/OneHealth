"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CasesTable } from "@/components/cases/cases-table"
import { CaseFilters } from "@/components/cases/case-filters"
import { CaseModal } from "@/components/cases/case-modal"

interface Case {
  id: string
  disease_name: string
  disease_category: string
  patient_age: number
  patient_gender: string
  status: string
  onset_date: string
  report_date: string
  location: string
  symptoms: string[]
  notes: string
}

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    dateFrom: "",
    dateTo: "",
  })
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [showModal, setShowModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadCases()
  }, [])

  const loadCases = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("disease_cases")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setCases(data || [])
      setFilteredCases(data || [])
    } catch (error) {
      console.error("Error loading cases:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = cases

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.disease_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((c) => c.status === filters.status)
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter((c) => c.disease_category === filters.category)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((c) => new Date(c.onset_date) >= new Date(filters.dateFrom))
    }

    if (filters.dateTo) {
      filtered = filtered.filter((c) => new Date(c.onset_date) <= new Date(filters.dateTo))
    }

    setFilteredCases(filtered)
  }, [searchTerm, filters, cases])

  const handleExport = () => {
    const csv = [
      ["Disease", "Category", "Status", "Age", "Gender", "Onset Date", "Location", "Symptoms"].join(","),
      ...filteredCases.map((c) =>
        [
          c.disease_name,
          c.disease_category,
          c.status,
          c.patient_age,
          c.patient_gender,
          c.onset_date,
          c.location,
          c.symptoms.join(";"),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cases-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from("disease_cases").update({ status: newStatus }).eq("id", caseId)

      if (error) throw error

      setCases(cases.map((c) => (c.id === caseId ? { ...c, status: newStatus } : c)))
      setSelectedCase(null)
    } catch (error) {
      console.error("Error updating case:", error)
    }
  }

  const uniqueCategories = [...new Set(cases.map((c) => c.disease_category))]

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Disease Cases</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">Manage and filter all reported disease cases</p>
      </div>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 md:space-y-4">
          <Input
            placeholder="Search by disease name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />

          <CaseFilters filters={filters} setFilters={setFilters} categories={uniqueCategories} />

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              disabled={filteredCases.length === 0}
              className="text-sm bg-transparent"
            >
              Export CSV
            </Button>
            <Button onClick={loadCases} variant="outline" className="text-sm bg-transparent">
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 md:pb-6">
          <CardTitle className="text-lg md:text-xl">Cases ({filteredCases.length})</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {loading ? "Loading..." : `Showing ${filteredCases.length} of ${cases.length} cases`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading cases...</div>
          ) : filteredCases.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">No cases found</div>
          ) : (
            <CasesTable
              cases={filteredCases}
              onSelectCase={(c) => {
                setSelectedCase(c)
                setShowModal(true)
              }}
            />
          )}
        </CardContent>
      </Card>

      {showModal && selectedCase && (
        <CaseModal case={selectedCase} onClose={() => setShowModal(false)} onUpdateStatus={handleUpdateStatus} />
      )}
    </div>
  )
}
