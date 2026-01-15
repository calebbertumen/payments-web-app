"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { useSession } from "next-auth/react"

export default function QRCodePage() {
  const { data: session } = useSession()

  // Get first initial + last initial
  const getNameInitials = (name: string): string => {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const userInitials = session?.user?.name 
    ? getNameInitials(session.user.name)
    : "U"

  // Get user's full name
  const userName = session?.user?.name || "User"

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Profile Avatar */}
        <Avatar className="h-32 w-32 border-4 border-gray-300">
          <AvatarImage src={session?.user?.image} alt="Profile" />
          <AvatarFallback className="bg-[#9D00FF] text-white text-4xl font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>

        {/* User Name */}
        <h2 className="text-2xl font-bold">{userName}</h2>

        {/* QR Code */}
        <div className="bg-white p-8 rounded-lg border-2 border-gray-300">
          <Image src="/qr-code-for-user-profile.jpg" alt="QR Code" width={300} height={300} className="rounded-md" />
        </div>
      </div>
    </div>
  )
}
