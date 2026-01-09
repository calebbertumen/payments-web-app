import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            type: true,
            subtype: true,
            mask: true,
            institutionName: true,
          },
        },
        merchant: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        cashTransaction: {
          select: {
            shopName: true,
            submittedAt: true,
          },
        },
      },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Format response to match UI expectations
    const formatted = {
      id: transaction.id,
      storeName: transaction.merchantName,
      date: transaction.date.toISOString().split("T")[0],
      location: transaction.location
        ? JSON.stringify(transaction.location)
        : "N/A",
      transactionNumber: transaction.id.slice(-8).toUpperCase(),
      paymentMethod: transaction.paymentMethod
        ? `${transaction.paymentMethod.type} ${transaction.paymentMethod.mask || ""}`.trim()
        : "Cash",
      barcode: transaction.cashTransaction
        ? `*${transaction.id.slice(-8).toUpperCase()}*`
        : null,
      items: [], // Items not stored in current schema - can be added later
      subtotal: Number(transaction.amount),
      tax: 0, // Tax not stored separately - can be calculated or added to schema
      total: Number(transaction.amount),
      category: transaction.category,
      notes: transaction.notes,
      source: transaction.source,
      shopName: transaction.cashTransaction?.shopName,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 }
    )
  }
}

