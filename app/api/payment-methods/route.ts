import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      include: {
        plaidItem: {
          select: {
            institutionName: true,
            itemId: true,
          },
        },
      },
    })

    const formatted = paymentMethods.map((pm) => ({
      id: pm.id,
      type: pm.type === "depository" ? "Bank Account" : "Credit Card",
      details: pm.mask
        ? `${pm.name} xxxx ${pm.mask}`
        : pm.name,
      cardNumber: pm.mask,
      bankName: pm.institutionName || pm.plaidItem?.institutionName,
      accountNumber: pm.mask,
      plaidAccountId: pm.plaidAccountId,
      plaidItemId: pm.plaidItem?.itemId || null,
    }))

    return NextResponse.json({ paymentMethods: formatted })
  } catch (error) {
    console.error("Error fetching payment methods:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment methods" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Payment method ID required" }, { status: 400 })
    }

    // Verify ownership and delete
    await prisma.paymentMethod.deleteMany({
      where: {
        id,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting payment method:", error)
    return NextResponse.json(
      { error: "Failed to delete payment method" },
      { status: 500 }
    )
  }
}

