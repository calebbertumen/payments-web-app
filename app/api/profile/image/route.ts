import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { image } = await request.json()

    if (!image || typeof image !== "string") {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    })

    return NextResponse.json({ 
      success: true, 
      image: updatedUser.image 
    })
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    )
  }
}

