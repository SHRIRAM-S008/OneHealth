"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Notification } from "@/hooks/use-notifications"
import { useNotifications } from "@/hooks/use-notifications"

interface NotificationPanelProps {
  notifications: Notification[]
  onClose: () => void
}

export function NotificationPanel({ notifications, onClose }: NotificationPanelProps) {
  const { markAsRead } = useNotifications()

  const getTypeColor = (type: string) => {
    switch (type) {
      case "outbreak":
        return "bg-red-50 border-red-200"
      case "case_increase":
        return "bg-yellow-50 border-yellow-200"
      case "severity_change":
        return "bg-orange-50 border-orange-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "outbreak":
        return "Outbreak Alert"
      case "case_increase":
        return "Case Increase"
      case "severity_change":
        return "Severity Change"
      default:
        return "Notification"
    }
  }

  return (
    <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto shadow-lg z-50">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Notifications</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="divide-y">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 ${getTypeColor(notification.type)}`}
              onClick={() => markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{getTypeLabel(notification.type)}</p>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                </div>
                {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2" />}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
