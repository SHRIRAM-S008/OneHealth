import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface Case {
  id: string
  disease_name: string
  disease_category: string
  status: string
  onset_date: string
  report_date: string
}

interface RecentCasesProps {
  cases: Case[]
}

export function RecentCases({ cases }: RecentCasesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Cases</CardTitle>
        <CardDescription>Latest disease cases reported</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No cases reported yet</p>
          ) : (
            cases.map((case_) => (
              <div key={case_.id} className="flex items-start justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{case_.disease_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Category: {case_.disease_category} • Status: {case_.status}
                  </p>
                  <p className="text-xs text-muted-foreground">Onset: {case_.onset_date}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    case_.status === "confirmed"
                      ? "bg-red-100 text-red-800"
                      : case_.status === "reported"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {case_.status}
                </span>
              </div>
            ))
          )}
        </div>
        <Link href="/dashboard/cases" className="text-sm text-primary hover:underline mt-4 block">
          View all cases →
        </Link>
      </CardContent>
    </Card>
  )
}
