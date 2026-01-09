import { auth } from "@/lib/auth"
import { getPlaidClient } from "@/lib/plaid"
import { NextResponse } from "next/server"
import { CountryCode, Products } from "plaid"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = getPlaidClient()

    const request = {
      user: {
        client_user_id: session.user.id,
      },
      client_name: "Payments",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      webhook: process.env.PLAID_WEBHOOK_URL || undefined,
    }

    const response = await client.linkTokenCreate(request)
    
    return NextResponse.json({ link_token: response.data.link_token })
  } catch (error: any) {
    console.error("Error creating link token:", error)
    const errorMessage = error?.response?.data?.error_message || error?.message || "Failed to create link token"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

