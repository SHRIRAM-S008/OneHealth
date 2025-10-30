"use client"

import { useState, useEffect } from "react"
import { CasesMap } from "@/components/dashboard/cases-map"
import { RecentCases } from "@/components/dashboard/recent-cases"

interface Case {
  id: string
  disease_name: string
  disease_category: string
  latitude?: number
  longitude?: number
  location: string
  patient_age?: number
  patient_gender?: string
  status: string
  created_at: string
  onset_date?: string
  report_date?: string
}

interface CasesMapClientProps {
  cases: Case[]
}

export function CasesMapClient({ cases }: CasesMapClientProps) {
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [isFiltering, setIsFiltering] = useState(false)

  const handleRegionFilter = (cases: Case[]) => {
    setFilteredCases(cases)
    setIsFiltering(cases.length > 0)
  }

  // Transform cases to match RecentCases interface
  const transformCases = (cases: Case[]) => {
    return cases.map(case_ => ({
      ...case_,
      onset_date: case_.onset_date || new Date(case_.created_at).toISOString().split('T')[0],
      report_date: case_.report_date || new Date().toISOString().split('T')[0]
    }))
  }

  return (
    <>
      <CasesMap cases={cases} onRegionFilter={handleRegionFilter} />
      {isFiltering && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Filtered Cases</h3>
          <p className="text-sm text-blue-800 mb-3">
            Showing {filteredCases.length} cases from the selected region
          </p>
          <RecentCases cases={transformCases(filteredCases.slice(0, 5))} />
        </div>
      )}
    </>
  )
}