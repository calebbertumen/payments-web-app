"use client"

import { User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Image from "next/image"

export default function QRCodePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex flex-col items-center justify-center space-y-8 py-12">
        {/* Profile Avatar */}
        <Avatar className="h-32 w-32 border-4 border-gray-300">
          <AvatarFallback className="bg-white">
            <User className="h-16 w-16 text-gray-400" />
          </AvatarFallback>
        </Avatar>

        {/* QR Code */}
        <div className="bg-white p-8 rounded-lg border-2 border-gray-300">
          <Image src="/qr-code-for-user-profile.jpg" alt="QR Code" width={300} height={300} className="rounded-md" />
        </div>

        {/* User Name */}
        <h2 className="text-2xl font-bold">First Name Last Name</h2>
      </div>
    </div>
  )
}
