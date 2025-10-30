"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileDown } from "lucide-react"
import { useToast } from "@/components/notifications/toast-provider"

interface ReportData {
  totalCases: number
  confirmedCases: number
  resolvedCases: number
  activeOutbreaks: number
  criticalOutbreaks: number
  topDiseases: string[]
  casesByStatus: { status: string; count: number }[]
  casesByDisease: { disease: string; count: number }[]
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState("summary")
  const [dateRange, setDateRange] = useState("month")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    // Set default date range
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)

    setEndDate(end.toISOString().split("T")[0])
    setStartDate(start.toISOString().split("T")[0])
  }, [])

  const generateReport = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      // Get user's organization
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .single()

      if (!userRole) throw new Error("Organization not found")

      // Fetch cases data
      const { data: cases } = await supabase
        .from("disease_cases")
        .select("*")
        .eq("organization_id", userRole.organization_id)
        .gte("created_at", startDate)
        .lte("created_at", endDate)

      if (!cases) throw new Error("Failed to fetch cases")

      // Process data
      const totalCases = cases.length
      const confirmedCases = cases.filter((c) => c.status === "confirmed").length
      const resolvedCases = cases.filter((c) => c.status === "resolved").length

      const casesByStatus = [
        { status: "Reported", count: cases.filter((c) => c.status === "reported").length },
        { status: "Confirmed", count: confirmedCases },
        { status: "Resolved", count: resolvedCases },
      ]

      const diseaseMap = new Map<string, number>()
      cases.forEach((c) => {
        diseaseMap.set(c.disease_name, (diseaseMap.get(c.disease_name) || 0) + 1)
      })

      const casesByDisease = Array.from(diseaseMap.entries())
        .map(([disease, count]) => ({ disease, count }))
        .sort((a, b) => b.count - a.count)

      const topDiseases = casesByDisease.slice(0, 5).map((d) => d.disease)

      // Fetch outbreaks
      const { data: outbreaks } = await supabase
        .from("outbreaks")
        .select("*")
        .gte("created_at", startDate)
        .lte("created_at", endDate)

      const activeOutbreaks = outbreaks?.filter((o) => o.status === "active").length || 0
      const criticalOutbreaks = outbreaks?.filter((o) => o.severity === "critical").length || 0

      setReportData({
        totalCases,
        confirmedCases,
        resolvedCases,
        activeOutbreaks,
        criticalOutbreaks,
        topDiseases,
        casesByStatus,
        casesByDisease,
      })

      addToast("Report generated successfully", "success")
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to generate report", "error")
    } finally {
      setLoading(false)
    }
  }

  const exportToPDF = async () => {
    if (!reportData) return

    try {
      // Create a simple HTML report
      const html = `
        <html>
          <head>
            <title>OneHealth Grid Report</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              .section { margin: 20px 0; page-break-inside: avoid; }
              .stat { display: inline-block; margin: 10px 20px 10px 0; }
              .stat-value { font-size: 24px; font-weight: bold; color: #0066cc; }
              .stat-label { color: #666; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin: 10px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f5f5f5; }
            </style>
          </head>
          <body>
            <h1>OneHealth Grid - Disease Surveillance Report</h1>
            <p>Report Period: ${startDate} to ${endDate}</p>
            
            <div class="section">
              <h2>Summary Statistics</h2>
              <div class="stat">
                <div class="stat-value">${reportData.totalCases}</div>
                <div class="stat-label">Total Cases</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.confirmedCases}</div>
                <div class="stat-label">Confirmed Cases</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.resolvedCases}</div>
                <div class="stat-label">Resolved Cases</div>
              </div>
              <div class="stat">
                <div class="stat-value">${reportData.activeOutbreaks}</div>
                <div class="stat-label">Active Outbreaks</div>
              </div>
            </div>

            <div class="section">
              <h2>Cases by Status</h2>
              <table>
                <tr>
                  <th>Status</th>
                  <th>Count</th>
                </tr>
                ${reportData.casesByStatus.map((s) => `<tr><td>${s.status}</td><td>${s.count}</td></tr>`).join("")}
              </table>
            </div>

            <div class="section">
              <h2>Top Diseases</h2>
              <table>
                <tr>
                  <th>Disease</th>
                  <th>Cases</th>
                </tr>
                ${reportData.casesByDisease
                  .slice(0, 10)
                  .map((d) => `<tr><td>${d.disease}</td><td>${d.count}</td></tr>`)
                  .join("")}
              </table>
            </div>
          </body>
        </html>
      `

      // Create blob and download
      const blob = new Blob([html], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${new Date().toISOString().split("T")[0]}.html`
      a.click()
      window.URL.revokeObjectURL(url)

      addToast("Report exported successfully", "success")
    } catch (error) {
      addToast("Failed to export report", "error")
    }
  }

  const exportToCSV = async () => {
    if (!reportData) return

    try {
      let csv = "OneHealth Grid - Disease Surveillance Report\n"
      csv += `Report Period: ${startDate} to ${endDate}\n\n`

      csv += "Summary Statistics\n"
      csv += `Total Cases,${reportData.totalCases}\n`
      csv += `Confirmed Cases,${reportData.confirmedCases}\n`
      csv += `Resolved Cases,${reportData.resolvedCases}\n`
      csv += `Active Outbreaks,${reportData.activeOutbreaks}\n\n`

      csv += "Cases by Status\n"
      csv += "Status,Count\n"
      reportData.casesByStatus.forEach((s) => {
        csv += `${s.status},${s.count}\n`
      })

      csv += "\nTop Diseases\n"
      csv += "Disease,Cases\n"
      reportData.casesByDisease.forEach((d) => {
        csv += `${d.disease},${d.count}\n`
      })

      const blob = new Blob([csv], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${new Date().toISOString().split("T")[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      addToast("Report exported to CSV", "success")
    } catch (error) {
      addToast("Failed to export report", "error")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Generate and export disease surveillance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select report type and date range</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="outbreak">Outbreak Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Start Date</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Date</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}
          </div>

          <Button onClick={generateReport} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Report Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{reportData.totalCases}</p>
                  <p className="text-sm text-gray-600">Total Cases</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{reportData.confirmedCases}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{reportData.resolvedCases}</p>
                  <p className="text-sm text-gray-600">Resolved</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{reportData.activeOutbreaks}</p>
                  <p className="text-sm text-gray-600">Active Outbreaks</p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{reportData.criticalOutbreaks}</p>
                  <p className="text-sm text-gray-600">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
                <FileDown className="w-4 h-4" />
                Export as HTML
              </Button>
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2 bg-transparent">
                <FileDown className="w-4 h-4" />
                Export as CSV
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
