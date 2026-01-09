import { auth } from "@/lib/auth"
import { getPlaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { public_token } = await request.json()

    if (!public_token) {
      return NextResponse.json({ error: "Public token required" }, { status: 400 })
    }

    const client = getPlaidClient()

    // Exchange public token for access token
    const exchangeResponse = await client.itemPublicTokenExchange({
      public_token,
    })

    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id

    // Get item information
    const itemResponse = await client.itemGet({
      access_token: accessToken,
    })

    const institutionId = itemResponse.data.item.institution_id

    // Get institution information
    let institutionName = "Unknown Institution"
    if (institutionId) {
      try {
        const institutionResponse = await client.institutionsGetById({
          institution_id: institutionId,
          country_codes: ["US"],
        })
        institutionName = institutionResponse.data.institution.name
      } catch (error) {
        console.error("Error fetching institution:", error)
      }
    }

    // Get accounts
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    })

    // Store Plaid item
    const plaidItem = await prisma.plaidItem.upsert({
      where: { itemId },
      update: {
        accessToken,
        institutionId,
        institutionName,
        lastSuccessfulUpdate: new Date(),
        error: null,
      },
      create: {
        accessToken,
        itemId,
        institutionId,
        institutionName,
        userId: session.user.id,
        lastSuccessfulUpdate: new Date(),
      },
    })

    // Store payment methods (accounts)
    for (const account of accountsResponse.data.accounts) {
      await prisma.paymentMethod.upsert({
        where: { plaidAccountId: account.account_id },
        update: {
          name: account.name,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          officialName: account.official_name || null,
          institutionName,
          isActive: true,
        },
        create: {
          userId: session.user.id,
          plaidItemId: plaidItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          type: account.type,
          subtype: account.subtype || null,
          mask: account.mask || null,
          officialName: account.official_name || null,
          institutionName,
          isActive: true,
        },
      })
    }

    return NextResponse.json({ success: true, itemId })
  } catch (error) {
    console.error("Error exchanging public token:", error)
    return NextResponse.json(
      { error: "Failed to exchange public token" },
      { status: 500 }
    )
  }
}

