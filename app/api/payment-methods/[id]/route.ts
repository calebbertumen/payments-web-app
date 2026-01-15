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

    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id,
        userId: session.user.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        plaidItem: {
          select: {
            institutionName: true,
            itemId: true,
          },
        },
      },
    })

    if (!paymentMethod) {
      return NextResponse.json({ error: "Payment method not found" }, { status: 404 })
    }

    const formatted = {
      id: paymentMethod.id,
      type: paymentMethod.type === "depository" ? "Bank Account" : "Credit Card",
      subtype: paymentMethod.subtype,
      name: paymentMethod.name,
      officialName: paymentMethod.officialName,
      mask: paymentMethod.mask,
      institutionName: paymentMethod.institutionName || paymentMethod.plaidItem?.institutionName,
      ownerName: paymentMethod.ownerName || paymentMethod.user.name || "N/A",
      expirationDate: paymentMethod.expirationDate,
      details: paymentMethod.mask
        ? `${paymentMethod.name} xxxx ${paymentMethod.mask}`
        : paymentMethod.name,
      bankName: paymentMethod.institutionName || paymentMethod.plaidItem?.institutionName,
      plaidAccountId: paymentMethod.plaidAccountId,
      plaidItemId: paymentMethod.plaidItem?.itemId || null,
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error("Error fetching payment method details:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment method details" },
      { status: 500 }
    )
  }
}

