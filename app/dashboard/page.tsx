import { createClient } from "@/lib/supabase/server"
import { DiseaseChart } from "@/components/dashboard/disease-chart"
import { CasesTrendChart } from "@/components/dashboard/cases-trend-chart"
import { RecentCases } from "@/components/dashboard/recent-cases"
import { OutbreakAlerts } from "@/components/dashboard/outbreak-alerts"
import { CasesMap } from "@/components/dashboard/cases-map"
import { StatisticsSummary } from "@/components/dashboard/statistics-summary"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch statistics - REMOVED user_id filtering to show all data
  const { data: casesData } = await supabase
    .from("disease_cases")
    .select("*")
    // Removed: .eq("user_id", user?.id)
    .order("created_at", { ascending: false })

  const { data: outbreaksData } = await supabase
    .from("outbreaks")
    .select("*")
    .eq("status", "active")
    .order("detected_date", { ascending: false })

  const { data: alertsData } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate statistics
  const casesCount = casesData?.length || 0
  const confirmedCases = casesData?.filter((c) => c.status === "confirmed").length || 0
  const reportedCases = casesData?.filter((c) => c.status === "reported").length || 0
  const resolvedCases = casesData?.filter((c) => c.status === "resolved").length || 0
  const activeOutbreaks = outbreaksData?.length || 0
  const unreadAlerts = alertsData?.length || 0

  // Calculate disease distribution
  const diseaseDistribution = casesData?.reduce(
    (acc, case_) => {
      const existing = acc.find((d: { name: string }) => d.name === case_.disease_category)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: case_.disease_category, value: 1 })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  // Calculate cases by status
  const casesByStatus = casesData?.reduce(
    (acc, case_) => {
      const existing = acc.find((s: { name: string }) => s.name === case_.status)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: case_.status, value: 1 })
      }
      return acc
    },
    [] as Array<{ name: string; value: number }>,
  )

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-xs md:text-sm text-muted-foreground mt-2">
          Welcome to OneHealth Grid disease surveillance platform
        </p>
      </div>

      {/* Statistics Summary */}
      <StatisticsSummary
        totalCases={casesCount}
        confirmedCases={confirmedCases}
        reportedCases={reportedCases}
        resolvedCases={resolvedCases}
      />

      {/* Key Metrics - improved mobile layout with responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="p-3 md:p-4 border border-border rounded-lg bg-card">
          <p className="text-xs md:text-sm text-muted-foreground">Active Outbreaks</p>
          <p className="text-2xl md:text-3xl font-bold text-orange-600 mt-2">{activeOutbreaks}</p>
        </div>
        <div className="p-3 md:p-4 border border-border rounded-lg bg-card">
          <p className="text-xs md:text-sm text-muted-foreground">Unread Alerts</p>
          <p className="text-2xl md:text-3xl font-bold text-red-600 mt-2">{unreadAlerts}</p>
        </div>
        <div className="p-3 md:p-4 border border-border rounded-lg bg-card">
          <p className="text-xs md:text-sm text-muted-foreground">System Status</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">Active</p>
        </div>
      </div>

      {/* Charts - stack on mobile, side-by-side on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <DiseaseChart data={diseaseDistribution || []} />
        <CasesTrendChart data={casesByStatus || []} />
      </div>

      {/* Map and Recent Cases - stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <CasesMap cases={casesData || []} />
        <RecentCases cases={casesData?.slice(0, 5) || []} />
      </div>

      {/* Outbreak Alerts */}
      <OutbreakAlerts alerts={alertsData || []} outbreaks={outbreaksData?.slice(0, 5) || []} />
    </div>
  )
}