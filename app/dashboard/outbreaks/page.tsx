"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OutbreaksList } from "@/components/outbreaks/outbreaks-list"
import { AlertsList } from "@/components/outbreaks/alerts-list"

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

interface Alert {
  id: string
  outbreak_id: string
  alert_type: string
  message: string
  is_read: boolean
  created_at: string
}

export default function OutbreaksPage() {
  const [outbreaks, setOutbreaks] = useState<Outbreak[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [detecting, setDetecting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: outbreaksData } = await supabase
        .from("outbreaks")
        .select("*")
        .order("detected_date", { ascending: false })

      const { data: alertsData } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)

      setOutbreaks(outbreaksData || [])
      setAlerts(alertsData || [])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDetectOutbreaks = async () => {
    setDetecting(true)
    try {
      const response = await fetch("/api/detect-outbreaks", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Error detecting outbreaks:", error)
    } finally {
      setDetecting(false)
    }
  }

  const handleMarkAlertAsRead = async (alertId: string) => {
    try {
      await supabase.from("alerts").update({ is_read: true }).eq("id", alertId)

      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)))
    } catch (error) {
      console.error("Error marking alert as read:", error)
    }
  }

  const handleUpdateOutbreakStatus = async (outbreakId: string, newStatus: string) => {
    try {
      await supabase.from("outbreaks").update({ status: newStatus }).eq("id", outbreakId)

      setOutbreaks(outbreaks.map((o) => (o.id === outbreakId ? { ...o, status: newStatus } : o)))
    } catch (error) {
      console.error("Error updating outbreak:", error)
    }
  }

  const activeOutbreaks = outbreaks.filter((o) => o.status === "active")
  const unreadAlerts = alerts.filter((a) => !a.is_read)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Outbreak Detection & Alerts</h2>
        <p className="text-muted-foreground mt-2">Monitor disease outbreaks and receive alerts</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Outbreaks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{activeOutbreaks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently detected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{unreadAlerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detection Control */}
      <Card>
        <CardHeader>
          <CardTitle>Outbreak Detection</CardTitle>
          <CardDescription>Analyze recent cases to detect potential outbreaks</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleDetectOutbreaks} disabled={detecting}>
            {detecting ? "Detecting..." : "Run Detection Analysis"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Detects 3+ cases of the same disease in the same location within 30 days
          </p>
        </CardContent>
      </Card>

      {/* Outbreaks and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OutbreaksList outbreaks={outbreaks} onUpdateStatus={handleUpdateOutbreakStatus} />
        <AlertsList alerts={alerts} onMarkAsRead={handleMarkAlertAsRead} />
      </div>
    </div>
  )
}
