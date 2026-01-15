"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Mail, MapPin, Bell } from "lucide-react"
import { cn } from "@/lib/utils"

const navigationItems = [
  {
    title: "Personal Info",
    href: "/account/personal-info",
    icon: User,
  },
  {
    title: "Email & Password",
    href: "/account/email-password",
    icon: Mail,
  },
  {
    title: "Address",
    href: "/account/address",
    icon: MapPin,
  },
  {
    title: "Notification Settings",
    href: "/account/notifications",
    icon: Bell,
  },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex gap-8 max-w-7xl mx-auto px-6 py-8">
      {/* Left Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0">
        <div className="sticky top-8">
          <h1 className="text-2xl font-bold mb-6">Account</h1>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive
                      ? "bg-[#9D00FF] text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

