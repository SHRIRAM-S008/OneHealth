"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface Notification {
  id: string
  message: string
  type: "outbreak" | "case_increase" | "severity_change" | "info"
  isRead: boolean
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: alerts } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (alerts) {
        const mapped = alerts.map((alert) => ({
          id: alert.id,
          message: alert.message,
          type: alert.alert_type as "outbreak" | "case_increase" | "severity_change" | "info",
          isRead: alert.is_read,
          createdAt: alert.created_at,
        }))
        setNotifications(mapped)
        setUnreadCount(mapped.filter((n) => !n.isRead).length)
      }
    }

    fetchNotifications()

    // Subscribe to real-time updates
    const channel = supabase
      .channel("alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          const newAlert = payload.new as any
          const notification: Notification = {
            id: newAlert.id,
            message: newAlert.message,
            type: newAlert.alert_type,
            isRead: false,
            createdAt: newAlert.created_at,
          }
          setNotifications((prev) => [notification, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  const markAsRead = async (notificationId: string) => {
    const supabase = createClient()
    await supabase.from("alerts").update({ is_read: true }).eq("id", notificationId)

    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)))
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  return { notifications, unreadCount, markAsRead }
}
