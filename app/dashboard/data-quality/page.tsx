"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react"

interface QualityMetrics {
  totalCases: number
  completeCases: number
  incompleteCases: number
  missingAgeCount: number
  missingLocationCount: number
  missingSymptomCount: number
  missingOnsetDateCount: number
  duplicateCases: number
  completenessPercentage: number
  accuracyScore: number
  consistencyScore: number
}

export default function DataQualityPage() {
  const [metrics, setMetrics] = useState<QualityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [issues, setIssues] = useState<string[]>([])

  useEffect(() => {
    loadQualityMetrics()
  }, [])

  const loadQualityMetrics = async () => {
    try {
      const supabase = createClient()
      // REMOVED: User authentication check for public access
      // const {
      //   data: { user },
      // } = await supabase.auth.getUser()

      // if (!user) return

      // REMOVED: User-specific organization lookup
      // Fetch all cases for public access
      const { data: cases } = await supabase
        .from("disease_cases")
        .select("*")
        // REMOVED: .eq("organization_id", userRole.organization_id)

      if (!cases) return

      // Calculate metrics
      const totalCases = cases.length
      let completeCases = 0
      let missingAgeCount = 0
      let missingLocationCount = 0
      let missingSymptomCount = 0
      let missingOnsetDateCount = 0
      const qualityIssues: string[] = []

      cases.forEach((c) => {
        let isComplete = true

        if (!c.patient_age) {
          missingAgeCount++
          isComplete = false
        }
        if (!c.location) {
          missingLocationCount++
          isComplete = false
        }
        if (!c.symptoms || c.symptoms.length === 0) {
          missingSymptomCount++
          isComplete = false
        }
        if (!c.onset_date) {
          missingOnsetDateCount++
          isComplete = false
        }

        if (isComplete) completeCases++
      })

      // Check for duplicates (same disease, location, within 7 days)
      const duplicateMap = new Map<string, number>()
      let duplicateCases = 0

      cases.forEach((c) => {
        const key = `${c.disease_name}-${c.location}`
        duplicateMap.set(key, (duplicateMap.get(key) || 0) + 1)
      })

      duplicateMap.forEach((count) => {
        if (count > 1) duplicateCases += count - 1
      })

      const completenessPercentage = totalCases > 0 ? Math.round((completeCases / totalCases) * 100) : 0
      const accuracyScore = Math.max(0, 100 - (duplicateCases / Math.max(1, totalCases)) * 10)
      const consistencyScore = completenessPercentage

      // Generate quality issues
      if (missingAgeCount > 0) qualityIssues.push(`${missingAgeCount} cases missing patient age`)
      if (missingLocationCount > 0) qualityIssues.push(`${missingLocationCount} cases missing location`)
      if (missingSymptomCount > 0) qualityIssues.push(`${missingSymptomCount} cases missing symptoms`)
      if (missingOnsetDateCount > 0) qualityIssues.push(`${missingOnsetDateCount} cases missing onset date`)
      if (duplicateCases > 0) qualityIssues.push(`${duplicateCases} potential duplicate cases detected`)

      setMetrics({
        totalCases,
        completeCases,
        incompleteCases: totalCases - completeCases,
        missingAgeCount,
        missingLocationCount,
        missingSymptomCount,
        missingOnsetDateCount,
        duplicateCases,
        completenessPercentage,
        accuracyScore: Math.round(accuracyScore),
        consistencyScore,
      })

      setIssues(qualityIssues)
    } catch (error) {
      console.error("Error loading quality metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading data quality metrics...</div>

  if (!metrics) return <div className="text-center py-8">No data available</div>

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return "bg-green-50"
    if (score >= 70) return "bg-yellow-50"
    return "bg-red-50"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Quality Dashboard</h1>
        <p className="text-muted-foreground">Public Health Data Quality Analysis</p>
      </div>

      {/* Quality Scores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completeness Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics.completenessPercentage)}`}>
              {metrics.completenessPercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.completeCases} of {metrics.totalCases} cases complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Accuracy Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics.accuracyScore)}`}>{metrics.accuracyScore}%</div>
            <p className="text-xs text-muted-foreground mt-2">{metrics.duplicateCases} potential duplicates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Consistency Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics.consistencyScore)}`}>
              {metrics.consistencyScore}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Data format consistency</p>
          </CardContent>
        </Card>
      </div>

      {/* Data Completeness */}
      <Card>
        <CardHeader>
          <CardTitle>Data Completeness Analysis</CardTitle>
          <CardDescription>Breakdown of missing data fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Patient Age</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.totalCases - metrics.missingAgeCount}/{metrics.totalCases}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${((metrics.totalCases - metrics.missingAgeCount) / Math.max(1, metrics.totalCases)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Location</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.totalCases - metrics.missingLocationCount}/{metrics.totalCases}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${((metrics.totalCases - metrics.missingLocationCount) / Math.max(1, metrics.totalCases)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Symptoms</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.totalCases - metrics.missingSymptomCount}/{metrics.totalCases}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${((metrics.totalCases - metrics.missingSymptomCount) / Math.max(1, metrics.totalCases)) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Onset Date</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.totalCases - metrics.missingOnsetDateCount}/{metrics.totalCases}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${((metrics.totalCases - metrics.missingOnsetDateCount) / Math.max(1, metrics.totalCases)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Issues */}
      <Card>
        <CardHeader>
          <CardTitle>Data Quality Issues</CardTitle>
          <CardDescription>Issues detected in your dataset</CardDescription>
        </CardHeader>
        <CardContent>
          {issues.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg text-green-800">
              <CheckCircle className="w-5 h-5" />
              <span>No data quality issues detected</span>
            </div>
          ) : (
            <div className="space-y-2">
              {issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-800">{issue}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Suggestions to improve data quality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {metrics.completenessPercentage < 80 && (
            <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Improve Data Completeness</p>
                <p className="text-sm text-blue-800">
                  Ensure all required fields are filled when entering case data. Missing data reduces analysis accuracy.
                </p>
              </div>
            </div>
          )}

          {metrics.duplicateCases > 0 && (
            <div className="flex gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">Review Duplicate Cases</p>
                <p className="text-sm text-orange-800">
                  Potential duplicate cases detected. Review and consolidate duplicate entries to maintain data
                  integrity.
                </p>
              </div>
            </div>
          )}

          {metrics.accuracyScore < 90 && (
            <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Improve Data Accuracy</p>
                <p className="text-sm text-red-800">
                  Implement validation checks and data entry guidelines to improve overall data accuracy.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}