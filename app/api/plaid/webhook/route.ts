import { getPlaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { inngest } from "@/lib/inngest"
import { NextResponse } from "next/server"
import { WebhookType } from "plaid"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const webhookType = body.webhook_type as WebhookType

    // Handle TRANSACTIONS webhook
    if (webhookType === WebhookType.Transactions) {
      const itemId = body.item_id

      if (!itemId) {
        return NextResponse.json({ error: "Item ID missing" }, { status: 400 })
      }

      // Trigger Inngest function to sync transactions
      await inngest.send({
        name: "plaid/sync.transactions",
        data: { itemId },
      })

      return NextResponse.json({ received: true })
    }

    // Handle other webhook types (ITEM, AUTH, etc.)
    if (webhookType === WebhookType.Item) {
      const itemId = body.item_id
      const error = body.error

      if (error && itemId) {
        // Update Plaid item with error
        await prisma.plaidItem.updateMany({
          where: { itemId },
          data: { error: JSON.parse(JSON.stringify(error)) },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

