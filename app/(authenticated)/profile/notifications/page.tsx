"use client"
import { usePathname } from "next/navigation"

export default function NotificationSettingsPage() {
  const pathname = usePathname()

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-gray-600">Manage your notification preferences here.</p>
      </div>
    </div>
  )
}
