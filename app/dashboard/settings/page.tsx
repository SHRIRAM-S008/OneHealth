"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

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
  const [organization, setOrganization] = useState({
    name: "",
    type: "hospital",
    location: "",
    contact_email: "",
    contact_phone: "",
  })
  const [activeTab, setActiveTab] = useState("notifications")
  const { language, setLanguage } = useLanguage()

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

          // Fetch organization details
          const { data: orgData } = await supabase.from("organizations").select("*").eq("id", orgId).single()

          if (orgData) {
            setOrganization(orgData)
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

  const handleSavePreferences = async () => {
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

        setMessage({ type: "success", text: "Notification settings saved successfully!" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Error saving preferences:", error)
      setMessage({ type: "error", text: "Failed to save notification settings" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOrganization = async () => {
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

        // Update organization
        const { error } = await supabase.from("organizations").update(organization).eq("id", orgId)

        if (error) throw error

        setMessage({ type: "success", text: "Organization details saved successfully!" })
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      console.error("Error saving organization:", error)
      setMessage({ type: "error", text: "Failed to save organization details" })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLanguage = () => {
    // Language is automatically saved in localStorage by the LanguageProvider
    setMessage({ type: "success", text: "Language settings saved successfully!" })
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) return <div className="text-center py-8">Loading settings...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your notification preferences, organization details, and language settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-6">
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "notifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notification Preferences
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "organization"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("organization")}
          >
            Organization Details
          </button>
          <button
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "language"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("language")}
          >
            Language Settings
          </button>
        </nav>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
        >
          {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Notification Preferences Tab */}
      {activeTab === "notifications" && (
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

            <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Organization Details Tab */}
      {activeTab === "organization" && (
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your organization's information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Organization Name</label>
                <Input
                  value={organization.name}
                  onChange={(e) => setOrganization({ ...organization, name: e.target.value })}
                  placeholder="Hospital or Veterinary Center Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={organization.type}
                  onChange={(e) => setOrganization({ ...organization, type: e.target.value })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="hospital">Hospital</option>
                  <option value="veterinary_center">Veterinary Center</option>
                  <option value="health_official">Health Official</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input
                  value={organization.location}
                  onChange={(e) => setOrganization({ ...organization, location: e.target.value })}
                  placeholder="City, Country"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  type="email"
                  value={organization.contact_email}
                  onChange={(e) => setOrganization({ ...organization, contact_email: e.target.value })}
                  placeholder="contact@organization.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <Input
                  value={organization.contact_phone}
                  onChange={(e) => setOrganization({ ...organization, contact_phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <Button onClick={handleSaveOrganization} disabled={saving} className="w-full">
                {saving ? "Saving..." : "Save Organization Details"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Settings Tab */}
      {activeTab === "language" && (
        <Card>
          <CardHeader>
            <CardTitle>Language Settings</CardTitle>
            <CardDescription>Choose your preferred language for the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-medium mb-2">Application Language</p>
              <p className="text-sm text-muted-foreground mb-4">
                Select your preferred language for the user interface
              </p>
              <div className="flex items-center gap-4">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  onClick={() => setLanguage("en")}
                  className="w-24"
                >
                  English
                </Button>
                <Button
                  variant={language === "hi" ? "default" : "outline"}
                  onClick={() => setLanguage("hi")}
                  className="w-24"
                >
                  हिंदी
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <p className="font-medium mb-2">Language Preference</p>
              <p className="text-sm text-muted-foreground mb-4">
                Your language preference is automatically saved and will be used across the application
              </p>
              <div className="text-sm p-3 bg-muted rounded-md">
                <p>Current language: {language === "en" ? "English" : "हिंदी"}</p>
                <p className="text-muted-foreground mt-1">
                  Changes take effect immediately and are saved automatically
                </p>
              </div>
            </div>

            <Button onClick={handleSaveLanguage} className="w-full">
              Save Language Settings
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}