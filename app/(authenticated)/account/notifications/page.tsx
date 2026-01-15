"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

type NotificationMethod = "push" | "email"

type NotificationPreferences = {
  [key: string]: {
    push: boolean
    email: boolean
  }
}

export default function NotificationSettingsPage() {
  // Initialize preferences - in a real app, these would be loaded from the database
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    // Payments
    "payment_made": { push: true, email: true },
    "payment_refunded": { push: true, email: true },
    // Payment Methods
    "payment_method_added": { push: true, email: false },
    "payment_method_removed": { push: true, email: true },
    // Send/Request
    "received_money": { push: true, email: true },
    "money_requested": { push: true, email: true },
    "reminder_send_money": { push: true, email: true },
    "money_sent": { push: true, email: true },
  })

  const handleCheckboxChange = (
    notificationType: string,
    method: NotificationMethod,
    checked: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [notificationType]: {
        ...prev[notificationType],
        [method]: checked,
      },
    }))
  }

  const handleSave = async () => {
    // TODO: Save preferences to database via API
    toast.success("Notification preferences saved successfully")
  }

  const notificationCategories = [
    {
      title: "Payments",
      notifications: [
        { key: "payment_made", label: "Payment made" },
        { key: "payment_refunded", label: "Payment refunded" },
      ],
    },
    {
      title: "Payment Methods",
      notifications: [
        { key: "payment_method_added", label: "Payment Method added" },
        { key: "payment_method_removed", label: "Payment Method removed" },
      ],
    },
    {
      title: "Send/Request",
      notifications: [
        { key: "received_money", label: "Received money" },
        { key: "money_requested", label: "Received request" },
        { key: "reminder_send_money", label: "Reminder to fulfill requests" },
        { key: "money_sent", label: "Money successfully sent" },
      ],
    },
  ]

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Notification Settings</h2>
          <p className="text-gray-600 mt-2">
            Choose how you want to be notified for different events.
          </p>
        </div>

        <div className="space-y-10">
          {notificationCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
              <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-300">
                        <th className="text-left px-6 py-4 font-semibold text-gray-900">
                          Notification Type
                        </th>
                        <th className="text-center px-6 py-4 font-semibold text-gray-900">
                          Push
                        </th>
                        <th className="text-center px-6 py-4 font-semibold text-gray-900">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.notifications.map((notification, index) => (
                        <tr
                          key={notification.key}
                          className={`border-b border-gray-300 ${
                            index === category.notifications.length - 1
                              ? "border-b-0"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <Label
                              htmlFor={`${notification.key}-push`}
                              className="text-gray-900 cursor-pointer"
                            >
                              {notification.label}
                            </Label>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Checkbox
                              id={`${notification.key}-push`}
                              checked={preferences[notification.key]?.push || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  notification.key,
                                  "push",
                                  checked === true
                                )
                              }
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Checkbox
                              id={`${notification.key}-email`}
                              checked={preferences[notification.key]?.email || false}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  notification.key,
                                  "email",
                                  checked === true
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white px-8"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  )
}

