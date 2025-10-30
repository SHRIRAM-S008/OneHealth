"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Download } from "lucide-react"

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<any>(null)
  const [casesTrend, setCasesTrend] = useState<any[]>([])
  const [diseaseDistribution, setDiseaseDistribution] = useState<any[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([])
  const [ageDistribution, setAgeDistribution] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalCases: 0,
    confirmedCases: 0,
    resolvedCases: 0,
    activeOutbreaks: 0,
    criticalOutbreaks: 0,
  })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get user's organization
        const { data: cases } = await supabase
          .from("disease_cases")
          .select("*, organizations(id, name)")
          .eq("user_id", user.id)
          .limit(1)

        if (cases && cases.length > 0) {
          const orgId = cases[0].organization_id
          setOrganization(cases[0].organizations)

          // Fetch all analytics data
          const { data: allCases } = await supabase.from("disease_cases").select("*").eq("organization_id", orgId)

          const { data: outbreaks } = await supabase.from("outbreaks").select("*")

          if (allCases) {
            // Calculate statistics
            const confirmed = allCases.filter((c) => c.status === "confirmed").length
            const resolved = allCases.filter((c) => c.status === "resolved").length
            setStats({
              totalCases: allCases.length,
              confirmedCases: confirmed,
              resolvedCases: resolved,
              activeOutbreaks: outbreaks?.filter((o) => o.status === "active").length || 0,
              criticalOutbreaks: outbreaks?.filter((o) => o.severity === "critical").length || 0,
            })

            // Cases trend by date
            const trendMap = new Map<string, number>()
            allCases.forEach((c) => {
              const date = new Date(c.report_date).toLocaleDateString()
              trendMap.set(date, (trendMap.get(date) || 0) + 1)
            })
            setCasesTrend(Array.from(trendMap.entries()).map(([date, count]) => ({ date, cases: count })))

            // Disease distribution
            const diseaseMap = new Map<string, number>()
            allCases.forEach((c) => {
              diseaseMap.set(c.disease_name, (diseaseMap.get(c.disease_name) || 0) + 1)
            })
            setDiseaseDistribution(Array.from(diseaseMap.entries()).map(([name, value]) => ({ name, value })))

            // Status breakdown
            setStatusBreakdown([
              { name: "Reported", value: allCases.filter((c) => c.status === "reported").length },
              { name: "Confirmed", value: confirmed },
              { name: "Resolved", value: resolved },
            ])

            // Age distribution
            const ageMap = new Map<string, number>()
            allCases.forEach((c) => {
              if (c.patient_age) {
                const ageGroup =
                  c.patient_age < 18 ? "0-17" : c.patient_age < 35 ? "18-34" : c.patient_age < 50 ? "35-49" : "50+"
                ageMap.set(ageGroup, (ageMap.get(ageGroup) || 0) + 1)
              }
            })
            setAgeDistribution(Array.from(ageMap.entries()).map(([group, count]) => ({ group, count })))
          }
        }
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const handleExportCSV = () => {
    const supabase = createClient()
    supabase
      .from("disease_cases")
      .select("*")
      .then(({ data }) => {
        if (data) {
          const csv = [Object.keys(data[0]).join(","), ...data.map((row) => Object.values(row).join(","))].join("\n")
          const blob = new Blob([csv], { type: "text/csv" })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `analytics-${new Date().toISOString().split("T")[0]}.csv`
          a.click()
        }
      })
  }

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

  if (loading) return <div className="text-center py-8">Loading analytics...</div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">{organization?.name}</p>
        </div>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCases}</div>
            <p className="text-xs text-muted-foreground">All reported cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.confirmedCases}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.confirmedCases / stats.totalCases) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.resolvedCases}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.resolvedCases / stats.totalCases) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Outbreaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.activeOutbreaks}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.criticalOutbreaks}</div>
            <p className="text-xs text-muted-foreground">Severity level</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cases Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Cases Trend</CardTitle>
            <CardDescription>Cases reported over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={casesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="cases" stroke="#3b82f6" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Disease Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Disease Distribution</CardTitle>
            <CardDescription>Cases by disease type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={diseaseDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Case Status</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Cases by age group</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="group" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
