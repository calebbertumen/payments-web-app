"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import { useUnreadNotificationCount } from "@/hooks/use-notifications"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false)
  const { data: unreadData } = useUnreadNotificationCount()
  const unreadCount = unreadData?.unreadCount || 0

  useEffect(() => {
    setIsClient(true)
  }, [])

  const isActive = (path: string) => {
    if (path === "/home") {
      return pathname === "/home"
    }
    return pathname.startsWith(path)
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Show loading state while checking session (but don't block if we have a session)
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-[#9D00FF] text-white px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold italic">Payments</h1>
          </div>
        </header>
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Loading...</div>
        </main>
      </div>
    )
  }

  // If no session after loading, show a message (middleware should have redirected)
  if (status === "unauthenticated" && !session) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="bg-[#9D00FF] text-white px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold italic">Payments</h1>
          </div>
        </header>
        <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="text-gray-600">Redirecting to login...</div>
        </main>
      </div>
    )
  }

  // Use session data if available, otherwise use placeholder
  const displayName = session?.user?.name || "User"
  const displayEmail = session?.user?.email || ""
  const displayImage = session?.user?.image || undefined

  // Get first initial + last initial
  const getNameInitials = (name: string): string => {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  
  const userInitials = getNameInitials(displayName)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#9D00FF] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home">
            <h1 className="text-2xl font-bold italic cursor-pointer hover:text-gray-200 transition-colors">
              Payments
            </h1>
          </Link>
          <div className="flex items-center gap-8">
            <Link
              href="/history"
              className={`text-lg font-medium hover:text-gray-200 transition-colors relative pb-1 ${
                isActive("/history")
                  ? "text-white border-b-2 border-white"
                  : "text-white/90"
              }`}
            >
              History
            </Link>
            <Link
              href="/payment-methods"
              className={`text-lg font-medium hover:text-gray-200 transition-colors relative pb-1 ${
                isActive("/payment-methods")
                  ? "text-white border-b-2 border-white"
                  : "text-white/90"
              }`}
            >
              Payment Methods
            </Link>
            <Link
              href="/send-request"
              className={`text-lg font-medium hover:text-gray-200 transition-colors relative pb-1 ${
                isActive("/send-request")
                  ? "text-white border-b-2 border-white"
                  : "text-white/90"
              }`}
            >
              Send/Request
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#9D00FF] rounded-full relative">
                  <Avatar className="h-10 w-10 border-2 border-white cursor-pointer">
                    <AvatarImage src={displayImage} alt={displayName} />
                    <AvatarFallback className="bg-[#9D00FF] text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{displayName}</div>
                  <div className="text-gray-500 text-xs">{displayEmail}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account/personal-info" className="cursor-pointer">
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/notifications" className="cursor-pointer">
                    Notifications
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/qr-code" className="cursor-pointer">
                    QR Code
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">{children}</main>

      {/* Footer */}
      <footer className="bg-[#9D00FF] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-6">
          <Link href="/privacy-policy" className="hover:text-gray-200 transition-colors">
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/terms-of-service" className="hover:text-gray-200 transition-colors">
            Terms of Service
          </Link>
          <span>|</span>
          <Link href="/contact-us" className="hover:text-gray-200 transition-colors">
            Contact Us
          </Link>
        </div>
      </footer>
    </div>
  )
}
