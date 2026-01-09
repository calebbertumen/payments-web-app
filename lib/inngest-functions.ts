import { inngest } from "./inngest"
import { getPlaidClient } from "./plaid"
import { prisma } from "./prisma"

// Sync transactions for a Plaid item
export const syncPlaidTransactions = inngest.createFunction(
  { id: "sync-plaid-transactions" },
  { event: "plaid/sync.transactions" },
  async ({ event, step }) => {
    const { itemId } = event.data

    return await step.run("sync-transactions", async () => {
      const plaidItem = await prisma.plaidItem.findUnique({
        where: { itemId },
        include: {
          paymentMethods: {
            where: { isActive: true },
          },
        },
      })

      if (!plaidItem) {
        throw new Error(`Plaid item not found: ${itemId}`)
      }

      const client = getPlaidClient()
      const accountIds = plaidItem.paymentMethods
        .map((pm) => pm.plaidAccountId)
        .filter(Boolean) as string[]

      if (accountIds.length === 0) {
        return { synced: 0, skipped: 0, message: "No accounts found" }
      }

      // Get transactions since last sync (or last 30 days)
      const startDate = plaidItem.lastSuccessfulUpdate
        ? new Date(plaidItem.lastSuccessfulUpdate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const endDate = new Date()

      const transactionsResponse = await client.transactionsGet({
        access_token: plaidItem.accessToken,
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        account_ids: accountIds,
      })

      let syncedCount = 0
      let skippedCount = 0

      for (const transaction of transactionsResponse.data.transactions) {
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
        data: { lastSuccessfulUpdate: new Date() },
      })

      return {
        synced: syncedCount,
        skipped: skippedCount,
        total: transactionsResponse.data.transactions.length,
      }
    })
  }
)

// Scheduled job to sync all Plaid items
export const scheduledSync = inngest.createFunction(
  { id: "scheduled-plaid-sync" },
  { cron: "0 */6 * * *" }, // Every 6 hours
  async ({ step }) => {
    return await step.run("sync-all-items", async () => {
      const plaidItems = await prisma.plaidItem.findMany({
        where: {
          error: null, // Only sync items without errors
        },
      })

      const results = await Promise.allSettled(
        plaidItems.map((item) =>
          inngest.send({
            name: "plaid/sync.transactions",
            data: { itemId: item.itemId },
          })
        )
      )

      return {
        total: plaidItems.length,
        sent: results.filter((r) => r.status === "fulfilled").length,
        failed: results.filter((r) => r.status === "rejected").length,
      }
    })
  }
)

