"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Outbreak {
  id: string
  disease_name: string
  disease_category: string
  location: string
  case_count: number
  severity: string
  status: string
  detected_date: string
}

interface OutbreaksListProps {
  outbreaks: Outbreak[]
  onUpdateStatus: (outbreakId: string, newStatus: string) => void
}

export function OutbreaksList({ outbreaks, onUpdateStatus }: OutbreaksListProps) {
  const activeOutbreaks = outbreaks.filter((o) => o.status === "active")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Outbreaks</CardTitle>
        <CardDescription>{activeOutbreaks.length} outbreaks detected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeOutbreaks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active outbreaks detected</p>
          ) : (
            activeOutbreaks.map((outbreak) => (
              <div key={outbreak.id} className="p-3 border border-border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{outbreak.disease_name}</p>
                    <p className="text-xs text-muted-foreground">Location: {outbreak.location}</p>
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

                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">Cases: {outbreak.case_count}</p>
                  <p className="text-xs text-muted-foreground">
                    Detected: {new Date(outbreak.detected_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(outbreak.id, "contained")}>
                    Mark Contained
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => onUpdateStatus(outbreak.id, "resolved")}>
                    Mark Resolved
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
