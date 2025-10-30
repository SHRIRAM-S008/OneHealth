"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Alert {
  id: string
  outbreak_id: string
  alert_type: string
  message: string
  is_read: boolean
  created_at: string
}

interface AlertsListProps {
  alerts: Alert[]
  onMarkAsRead: (alertId: string) => void
}

export function AlertsList({ alerts, onMarkAsRead }: AlertsListProps) {
  const unreadAlerts = alerts.filter((a) => !a.is_read)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>{unreadAlerts.length} unread alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts</p>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.is_read ? "border-border bg-background" : "border-orange-200 bg-orange-50"
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">{alert.alert_type}</p>
                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsRead(alert.id)}
                      className="h-6 px-2 text-xs"
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
                <p className="text-sm mb-1">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
