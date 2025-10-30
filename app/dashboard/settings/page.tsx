"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [preferences, setPreferences] = useState({
    email_on_outbreak: true,
    email_on_case_increase: true,
    email_on_severity_change: true,
    email_digest_frequency: "daily",
  })

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        // Get user's organization
        const { data: cases } = await supabase
          .from("disease_cases")
          .select("organization_id")
          .eq("user_id", user.id)
          .limit(1)

        if (cases && cases.length > 0) {
          const orgId = cases[0].organization_id

          // Fetch notification preferences
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("*")
            .eq("user_id", user.id)
            .eq("organization_id", orgId)
            .single()

          if (prefs) {
            setPreferences({
              email_on_outbreak: prefs.email_on_outbreak,
              email_on_case_increase: prefs.email_on_case_increase,
              email_on_severity_change: prefs.email_on_severity_change,
              email_digest_frequency: prefs.email_digest_frequency,
            })
          }
        }
      } catch (error) {
        console.error("Error fetching preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Get user's organization
      const { data: cases } = await supabase
        .from("disease_cases")
        .select("organization_id")
        .eq("user_id", user.id)
        .limit(1)

      if (cases && cases.length > 0) {
        const orgId = cases[0].organization_id

        // Update or insert preferences
        const { error } = await supabase.from("notification_preferences").upsert({
          user_id: user.id,
          organization_id: orgId,
          ...preferences,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error

        setMessage({ type: "success", text: "Settings saved successfully!" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      setMessage({ type: "error", text: "Failed to save settings" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading settings...</div>

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your notification preferences</p>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Choose when you want to receive email alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Outbreak Alert</p>
              <p className="text-sm text-muted-foreground">Get notified when a new outbreak is detected</p>
            </div>
            <Switch
              checked={preferences.email_on_outbreak}
              onCheckedChange={(checked) => setPreferences({ ...preferences, email_on_outbreak: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Case Increase Alert</p>
              <p className="text-sm text-muted-foreground">Get notified when cases increase significantly</p>
            </div>
            <Switch
              checked={preferences.email_on_case_increase}
              onCheckedChange={(checked) => setPreferences({ ...preferences, email_on_case_increase: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Severity Change Alert</p>
              <p className="text-sm text-muted-foreground">Get notified when outbreak severity changes</p>
            </div>
            <Switch
              checked={preferences.email_on_severity_change}
              onCheckedChange={(checked) => setPreferences({ ...preferences, email_on_severity_change: checked })}
            />
          </div>

          <div className="border-t pt-6">
            <p className="font-medium mb-3">Email Digest Frequency</p>
            <Select
              value={preferences.email_digest_frequency}
              onValueChange={(value) => setPreferences({ ...preferences, email_digest_frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
