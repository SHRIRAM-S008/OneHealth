import { createClient } from "@/lib/supabase/server"

export default async function DebugPage() {
  const supabase = await createClient()

  // Test 1: Check if we can get the user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Test 2: Check if we can get disease cases (same as dashboard)
  const { data: casesData, error: casesError } = await supabase
    .from("disease_cases")
    .select("*")
    .order("created_at", { ascending: false })

  // Test 3: Check if we can get outbreaks (same as dashboard)
  const { data: outbreaksData, error: outbreaksError } = await supabase
    .from("outbreaks")
    .select("*")
    .eq("status", "active")
    .order("detected_date", { ascending: false })

  // Test 4: Check if we can get alerts (same as dashboard)
  const { data: alertsData, error: alertsError } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate statistics (same as dashboard)
  const casesCount = casesData?.length || 0
  const confirmedCases = casesData?.filter((c) => c.status === "confirmed").length || 0
  const reportedCases = casesData?.filter((c) => c.status === "reported").length || 0
  const resolvedCases = casesData?.filter((c) => c.status === "resolved").length || 0
  const activeOutbreaks = outbreaksData?.length || 0
  const unreadAlerts = alertsData?.length || 0

  // Calculate disease distribution (same as dashboard)
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

  // Calculate cases by status (same as dashboard)
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        {userError ? (
          <p className="text-red-500">Error: {userError.message}</p>
        ) : user ? (
          <div>
            <p>User ID: {user.id}</p>
            <p>Email: {user.email}</p>
          </div>
        ) : (
          <p>No user found (not logged in)</p>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Dashboard Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border p-4 rounded">
            <p className="font-semibold">Total Cases</p>
            <p className="text-2xl">{casesCount}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Confirmed Cases</p>
            <p className="text-2xl">{confirmedCases}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Reported Cases</p>
            <p className="text-2xl">{reportedCases}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Resolved Cases</p>
            <p className="text-2xl">{resolvedCases}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Active Outbreaks</p>
            <p className="text-2xl">{activeOutbreaks}</p>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Unread Alerts</p>
            <p className="text-2xl">{unreadAlerts}</p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chart Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border p-4 rounded">
            <p className="font-semibold">Disease Distribution</p>
            <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
              {JSON.stringify(diseaseDistribution, null, 2)}
            </pre>
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Cases by Status</p>
            <pre className="text-xs bg-gray-100 p-2 mt-2 overflow-auto">
              {JSON.stringify(casesByStatus, null, 2)}
            </pre>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Raw Data Counts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="border p-4 rounded">
            <p className="font-semibold">Cases Data</p>
            <p className="text-2xl">{casesData?.length || 0}</p>
            {casesError && <p className="text-red-500">Error: {casesError.message}</p>}
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Outbreaks Data</p>
            <p className="text-2xl">{outbreaksData?.length || 0}</p>
            {outbreaksError && <p className="text-red-500">Error: {outbreaksError.message}</p>}
          </div>
          <div className="border p-4 rounded">
            <p className="font-semibold">Alerts Data</p>
            <p className="text-2xl">{alertsData?.length || 0}</p>
            {alertsError && <p className="text-red-500">Error: {alertsError.message}</p>}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Sample Cases</h2>
        {casesData ? (
          <div>
            <p>Total cases: {casesData.length}</p>
            {casesData.slice(0, 3).map((case_) => (
              <div key={case_.id} className="border p-2 mb-2">
                <p>Disease: {case_.disease_name}</p>
                <p>Status: {case_.status}</p>
                <p>Category: {case_.disease_category}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No cases data</p>
        )}
      </div>
    </div>
  )
}