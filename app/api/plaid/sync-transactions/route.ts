import { auth } from "@/lib/auth"
import { getPlaidClient } from "@/lib/plaid"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  let itemId: string | undefined
  
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    itemId = body.itemId

    if (!itemId) {
      return NextResponse.json({ error: "Item ID required" }, { status: 400 })
    }

    // Find the Plaid item and verify ownership
    const plaidItem = await prisma.plaidItem.findFirst({
      where: {
        itemId,
        userId: session.user.id,
      },
      include: {
        paymentMethods: {
          where: { isActive: true },
        },
      },
    })

    if (!plaidItem) {
      return NextResponse.json({ error: "Plaid item not found" }, { status: 404 })
    }

    const client = getPlaidClient()
    const accountIds = plaidItem.paymentMethods
      .map((pm) => pm.plaidAccountId)
      .filter(Boolean) as string[]

    if (accountIds.length === 0) {
      return NextResponse.json({ 
        synced: 0, 
        skipped: 0, 
        message: "No accounts found" 
      })
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
      
      // Filter to only our connected accounts (since account_ids parameter was removed)
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

    return NextResponse.json({
      synced: syncedCount,
      skipped: skippedCount,
      total: allTransactions.length,
    })
  } catch (error: any) {
    console.error("Error syncing transactions:", error)
    
    // Update Plaid item with error if it exists
    if (itemId) {
      try {
        await prisma.plaidItem.updateMany({
          where: { itemId },
          data: { 
            error: JSON.parse(JSON.stringify({
              message: error.message || "Failed to sync transactions",
              code: error.error_code || "SYNC_ERROR",
            })),
          },
        })
      } catch (updateError) {
        console.error("Error updating Plaid item error:", updateError)
      }
    }

    return NextResponse.json(
      { error: error.message || "Failed to sync transactions" },
      { status: 500 }
    )
  }
}

