import { getPlaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { WebhookType } from "plaid"

async function syncTransactionsForItem(itemId: string) {
  const plaidItem = await prisma.plaidItem.findFirst({
    where: { itemId },
    include: {
      paymentMethods: {
        where: { isActive: true },
      },
    },
  })

  if (!plaidItem) {
    console.error(`Plaid item not found: ${itemId}`)
    return
  }

  const client = getPlaidClient()
  const accountIds = plaidItem.paymentMethods
    .map((pm) => pm.plaidAccountId)
    .filter(Boolean) as string[]

  if (accountIds.length === 0) {
    return
  }

  // Get transactions since last sync (or last 30 days)
  const startDate = plaidItem.lastSuccessfulUpdate
    ? new Date(plaidItem.lastSuccessfulUpdate)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const endDate = new Date()

  // Fetch all transactions with pagination
  const accountIdSet = new Set(accountIds)
  let allTransactions: any[] = []
  let cursor: string | undefined = undefined
  let hasMore = true

  while (hasMore) {
    const requestParams: any = {
      access_token: plaidItem.accessToken,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    }

    if (cursor) {
      requestParams.cursor = cursor
    }

    const transactionsResponse = await client.transactionsGet(requestParams)

    // Filter to only our connected accounts
    const relevantTransactions = transactionsResponse.data.transactions.filter(
      (t) => accountIdSet.has(t.account_id)
    )

    allTransactions = allTransactions.concat(relevantTransactions)

    hasMore = transactionsResponse.data.has_more || false
    cursor = transactionsResponse.data.next_cursor || undefined
  }

  let syncedCount = 0
  let skippedCount = 0

  for (const transaction of allTransactions) {
    // Check idempotency
    const existing = await prisma.transaction.findUnique({
      where: { plaidTransactionId: transaction.transaction_id },
    })

    if (existing) {
      skippedCount++
      continue
    }

    const paymentMethod = plaidItem.paymentMethods.find(
      (pm) => pm.plaidAccountId === transaction.account_id
    )

    if (!paymentMethod) continue

    // Get or create merchant
    let merchant = await prisma.merchant.findFirst({
      where: { name: transaction.merchant_name || transaction.name },
    })

    if (!merchant && transaction.merchant_name) {
      merchant = await prisma.merchant.create({
        data: {
          name: transaction.merchant_name,
          category: transaction.category?.[0] || null,
        },
      })
    }

    await prisma.transaction.create({
      data: {
        userId: plaidItem.userId,
        paymentMethodId: paymentMethod.id,
        merchantId: merchant?.id,
        source: "PLAID",
        amount: transaction.amount,
        currency: "USD",
        date: new Date(transaction.date),
        merchantName: transaction.merchant_name || transaction.name,
        category: transaction.category?.[0] || null,
        categoryDetailed: transaction.category?.join(", ") || null,
        plaidTransactionId: transaction.transaction_id,
        location: transaction.location
          ? JSON.parse(JSON.stringify(transaction.location))
          : null,
        authorizedDate: transaction.authorized_date
          ? new Date(transaction.authorized_date)
          : null,
        postedDate: transaction.date ? new Date(transaction.date) : null,
      },
    })

    syncedCount++
  }

  // Update last sync time
  await prisma.plaidItem.update({
    where: { id: plaidItem.id },
    data: {
      lastSuccessfulUpdate: new Date(),
      error: null,
    },
  })

  console.log(`Webhook: Synced ${syncedCount} transactions for item ${itemId}`)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const webhookType = body.webhook_type as WebhookType

    // Handle TRANSACTIONS webhook - automatically sync transactions
    if (webhookType === WebhookType.Transactions) {
      const itemId = body.item_id

      if (!itemId) {
        return NextResponse.json({ error: "Item ID missing" }, { status: 400 })
      }

      // Sync transactions automatically (non-blocking - don't wait for completion)
      syncTransactionsForItem(itemId).catch((error) => {
        console.error("Error syncing transactions from webhook:", error)
      })

      // Return immediately so Plaid doesn't timeout
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

