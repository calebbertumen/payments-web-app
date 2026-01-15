import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Replace with real database query when notifications are implemented
    // For now, return mock data
    const unreadCount = 2 // Mock unread count

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error("Error fetching unread notification count:", error)
    return NextResponse.json(
      { error: "Failed to fetch unread count" },
      { status: 500 }
    )
  }
}

