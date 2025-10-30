import { StatisticsSummary } from "@/components/dashboard/statistics-summary"
import { createClient } from "@/lib/supabase/server"

export default async function TestDashboardPage() {
  const supabase = await createClient()

  // Fetch statistics - REMOVED user_id filtering to show all data
  const { data: casesData } = await supabase
    .from("disease_cases")
    .select("*")
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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Dashboard</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Raw Data Counts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border p-4 rounded">
            <p className="font-semibold">Cases Data</p>
            <p className="text-2xl">{casesData?.length || 0}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Outbreaks Data</p>
            <p className="text-2xl">{outbreaksData?.length || 0}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Alerts Data</p>
            <p className="text-2xl">{alertsData?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Statistics Summary Component</h2>
        <StatisticsSummary
          totalCases={casesCount}
          confirmedCases={confirmedCases}
          reportedCases={reportedCases}
          resolvedCases={resolvedCases}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Key Metrics</h2>
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
      </div>
    </div>
  )
}