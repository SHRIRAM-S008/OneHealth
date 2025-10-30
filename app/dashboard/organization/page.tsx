"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function OrganizationPage() {
  const [organization, setOrganization] = useState({
    name: "",
    type: "hospital",
    location: "",
    contact_email: "",
    contact_phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadOrganization()
  }, [])

  const loadOrganization = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from("disease_cases")
      .select("organization_id")
      .eq("user_id", user.id)
      .limit(1)
      .single()

    if (data?.organization_id) {
      const { data: orgData } = await supabase.from("organizations").select("*").eq("id", data.organization_id).single()

      if (orgData) {
        setOrganization(orgData)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      if (organization.id) {
        // Update existing organization
        const { error } = await supabase.from("organizations").update(organization).eq("id", organization.id)

        if (error) throw error
        setMessage({ type: "success", text: "Organization updated successfully" })
      } else {
        // Create new organization
        const { data, error } = await supabase.from("organizations").insert([organization]).select().single()

        if (error) throw error
        setOrganization(data)
        setMessage({ type: "success", text: "Organization created successfully" })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Organization Profile</h2>
        <p className="text-muted-foreground mt-2">Manage your organization information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization's information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Organization"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
