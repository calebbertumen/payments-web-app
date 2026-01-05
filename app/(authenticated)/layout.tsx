"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-purple-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold italic">Payments</h1>
          <div className="flex items-center gap-8">
            <Link
              href="/history"
              className={`text-lg font-medium hover:text-gray-200 transition-colors ${
                isActive("/history") ? "text-white" : "text-white/90"
              }`}
            >
              History
            </Link>
            <Link
              href="/payment-methods"
              className={`text-lg font-medium hover:text-gray-200 transition-colors ${
                isActive("/payment-methods") ? "text-white" : "text-white/90"
              }`}
            >
              Payment Methods
            </Link>
            <Link
              href="/send-request"
              className={`text-lg font-medium hover:text-gray-200 transition-colors ${
                isActive("/send-request") ? "text-white" : "text-white/90"
              }`}
            >
              Send/Request
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-700 rounded-full">
                  <Avatar className="h-10 w-10 border-2 border-white cursor-pointer">
                    <AvatarFallback className="bg-white text-purple-700">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    Personal Information
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/notifications" className="cursor-pointer">
                    Notification Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/qr-code" className="cursor-pointer">
                    QR Code
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">{children}</main>
    </div>
  )
}
