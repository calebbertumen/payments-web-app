"use client"

import { useState } from "react"
import { Bell, MoreVertical, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export default function NotificationsPage() {
  // Mock notifications data - will be replaced with real API calls
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "payment_made",
      title: "Payment Made",
      message: "Payment of $12.00 to McDonald's was processed",
      timestamp: new Date("2024-01-22T10:30:00"),
      read: false,
    },
    {
      id: "2",
      type: "payment_method_added",
      title: "Payment Method Added",
      message: "Chase Checking account was successfully connected",
      timestamp: new Date("2024-01-21T14:15:00"),
      read: false,
    },
    {
      id: "3",
      type: "money_requested",
      title: "Money Requested",
      message: "Alice Johnson requested $50.00 from you",
      timestamp: new Date("2024-01-20T09:00:00"),
      read: true,
    },
    {
      id: "4",
      type: "received_money",
      title: "Money Received",
      message: "You received $50.00 from Bob Smith",
      timestamp: new Date("2024-01-19T16:45:00"),
      read: true,
    },
  ])

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null)
  const [reminderDate, setReminderDate] = useState("")
  const [reminderTime, setReminderTime] = useState("")

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    )
    toast.success("All notifications marked as read")
  }

  const handleMarkAsUnread = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: false } : notification
      )
    )
    toast.success("Notification marked as unread")
  }

  const handleRemindMe = (id: string) => {
    setSelectedNotificationId(id)
    setReminderDialogOpen(true)
  }

  const handleSetReminder = () => {
    if (!reminderDate || !reminderTime) {
      toast.error("Please select both date and time")
      return
    }

    // TODO: Save reminder to API
    toast.success("Reminder set successfully")
    setReminderDialogOpen(false)
    setReminderDate("")
    setReminderTime("")
    setSelectedNotificationId(null)
  }

  const isRequestNotification = (type: string) => {
    return type === "money_requested" || type === "reminder_send_money"
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <Button
            variant="outline"
            className="text-sm"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white border rounded-lg p-4 hover:border-[#9D00FF] transition-colors ${
                  !notification.read ? "border-[#9D00FF] border-2" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 mt-1 ${!notification.read ? "text-[#9D00FF]" : "text-gray-400"}`}>
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notification.timestamp.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="h-2 w-2 bg-[#9D00FF] rounded-full flex-shrink-0"></div>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleMarkAsUnread(notification.id)}
                            >
                              Mark as unread
                            </DropdownMenuItem>
                            {isRequestNotification(notification.type) && (
                              <DropdownMenuItem
                                onClick={() => handleRemindMe(notification.id)}
                              >
                                <Clock className="mr-2 h-4 w-4" />
                                Remind me
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No notifications yet.</p>
          </div>
        )}
      </div>

      {/* Reminder Dialog */}
      <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
            <DialogDescription>
              Choose when you want to be reminded about this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reminder-date">Date</Label>
              <Input
                id="reminder-date"
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="mt-1"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="reminder-time">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReminderDialogOpen(false)
                setReminderDate("")
                setReminderTime("")
                setSelectedNotificationId(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSetReminder}
              className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
            >
              Set Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
