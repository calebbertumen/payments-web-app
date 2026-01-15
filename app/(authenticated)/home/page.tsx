"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { History, CreditCard, ArrowRightLeft, User, QrCode } from "lucide-react"

export default function HomePage() {
  const { data: session } = useSession()
  
  // Get first name from user's name
  const firstName = session?.user?.name?.split(" ")[0] || "User"

  const navigationItems = [
    {
      title: "History",
      href: "/history",
      icon: History,
      description: "View your transaction history",
    },
    {
      title: "Payment Methods",
      href: "/payment-methods",
      icon: CreditCard,
      description: "Manage your payment methods",
    },
    {
      title: "Send/Request",
      href: "/send-request",
      icon: ArrowRightLeft,
      description: "Send or request money",
    },
    {
      title: "Profile",
      href: "/account/personal-info",
      icon: User,
      description: "Manage your profile",
    },
    {
      title: "QR Code",
      href: "/profile/qr-code",
      icon: QrCode,
      description: "View your QR code and link cash payments",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center">
      {/* Welcome Header */}
      <div className="mb-12 text-left w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome, {firstName}
        </h1>
        <p className="text-lg text-gray-600">
          Manage your payments and transactions.
        </p>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {navigationItems.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="outline"
                className="w-full h-32 flex flex-col items-center justify-center gap-3 bg-white hover:bg-[#F5E6FF] hover:border-[#E6CCFF] transition-all group"
              >
                  <Icon className="h-8 w-8 text-[#9D00FF] group-hover:text-[#7A00CC]" />
                  <span className="text-lg font-semibold text-gray-900 group-hover:text-[#9D00FF]">
                  {item.title}
                </span>
                <span className="text-sm text-gray-500 hidden sm:block">
                  {item.description}
                </span>
              </Button>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

