import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search") || ""
    
    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    // Check if search looks like a number or date pattern (for amounts/dates)
    // If so, don't apply server-side filtering - let client-side handle it
    const searchTrimmed = search.trim()
    const isNumericOrDate = search && (
      /^\d+([./-]\d+)*$/.test(searchTrimmed) || 
      /^\$?\d+\.?\d*$/.test(searchTrimmed) ||
      /^\d{1,2}[\/-]\d{1,2}/.test(searchTrimmed) || // Date patterns like 12/25, 12-25
      /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(searchTrimmed) ||
      /\d/.test(searchTrimmed) // If search contains any number, it might be amount or date
    )
    
    // Only apply server-side search for text-only queries (merchant name, category)
    // Let client-side filtering handle amounts and dates for better UX
    if (search && !isNumericOrDate) {
      where.OR = [
        { merchantName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }
    
    // If searching (especially by number/date), fetch more results to ensure client-side filtering works
    // For numeric/date searches, fetch up to 5000 transactions (enough for most users)
    // For text searches, still use pagination but fetch more per page
    const fetchLimit = isNumericOrDate ? 5000 : (search ? 500 : limit)
    const skip = isNumericOrDate ? 0 : (page - 1) * limit

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: fetchLimit,
        orderBy: { date: "desc" },
        include: {
          paymentMethod: {
            select: {
              id: true,
              name: true,
              type: true,
              subtype: true,
              mask: true,
            },
          },
          merchant: {
            select: {
              id: true,
              name: true,
              category: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ])

    // Format response
    const formattedTransactions = transactions.map((t) => {
      // Format payment method - just type/subtype and last 4 digits, no "Bank Account" or "Credit Card" prefix
      let paymentMethodDisplay = "Cash"
      let paymentMethodDetails = null
      
      if (t.paymentMethod) {
        const pm = t.paymentMethod
        // Use subtype if available (e.g., "checking", "savings", "credit card"), otherwise fallback to type
        let typeDisplay = ""
        if (pm.subtype) {
          // Capitalize first letter and replace underscores with spaces
          typeDisplay = pm.subtype.charAt(0).toUpperCase() + pm.subtype.slice(1).replace(/_/g, " ")
        } else if (pm.type === "depository") {
          typeDisplay = "Checking"
        } else if (pm.type === "credit") {
          typeDisplay = "Credit card"
        } else if (pm.type === "loan") {
          typeDisplay = "Loan"
        } else {
          typeDisplay = pm.type ? pm.type.charAt(0).toUpperCase() + pm.type.slice(1) : "Account"
        }
        const maskDisplay = pm.mask ? ` •••• ${pm.mask}` : ""
        paymentMethodDisplay = `${typeDisplay}${maskDisplay}`
        paymentMethodDetails = {
          type: pm.type,
          subtype: pm.subtype,
          mask: pm.mask,
          display: paymentMethodDisplay,
        }
      }
      
      return {
        id: t.id,
        company: t.merchantName,
        amount: Number(t.amount),
        date: t.date.toISOString().split("T")[0],
        merchantName: t.merchantName,
        category: t.category,
        paymentMethod: paymentMethodDisplay,
        paymentMethodDetails: paymentMethodDetails,
        source: t.source,
      }
    })

    // If we fetched more results for client-side filtering (numeric/date search),
    // return all without pagination. Otherwise return paginated results.
    if (isNumericOrDate || (search && fetchLimit > limit)) {
      return NextResponse.json({
        transactions: formattedTransactions,
        pagination: {
          page: 1,
          limit: formattedTransactions.length,
          total: formattedTransactions.length,
          totalPages: 1,
        },
      })
    }

    return NextResponse.json({
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 }
    )
  }
}

