import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Alert {
  id: string
  alert_type: string
  message: string
  created_at: string
}

interface Outbreak {
  id: string
  disease_name: string
  location: string
  case_count: number
  severity: string
}

interface OutbreakAlertsProps {
  alerts: Alert[]
  outbreaks: Outbreak[]
}

export function OutbreakAlerts({ alerts, outbreaks }: OutbreakAlertsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Outbreak Alerts</CardTitle>
        <CardDescription>Active outbreaks and alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {outbreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active outbreaks</p>
          ) : (
            outbreaks.map((outbreak) => (
              <div key={outbreak.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{outbreak.disease_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">Location: {outbreak.location}</p>
                    <p className="text-xs text-muted-foreground">Cases: {outbreak.case_count}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      outbreak.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : outbreak.severity === "high"
                          ? "bg-orange-100 text-orange-800"
                          : outbreak.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {outbreak.severity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
