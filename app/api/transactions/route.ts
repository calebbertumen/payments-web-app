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
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id,
    }

    if (search) {
      where.OR = [
        { merchantName: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: "desc" },
        include: {
          paymentMethod: {
            select: {
              id: true,
              name: true,
              type: true,
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
    const formattedTransactions = transactions.map((t) => ({
      id: t.id,
      company: t.merchantName,
      amount: Number(t.amount),
      date: t.date.toISOString().split("T")[0],
      merchantName: t.merchantName,
      category: t.category,
      paymentMethod: t.paymentMethod
        ? `${t.paymentMethod.type} ${t.paymentMethod.mask || ""}`.trim()
        : "Cash",
      source: t.source,
    }))

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

