import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  
  // Check database for recent sessions
  const recentSessions = await prisma.session.findMany({
    take: 5,
    orderBy: { expires: "desc" },
    include: { user: true },
  })
  
  return NextResponse.json({
    hasSession: !!session,
    session: session ? {
      user: session.user,
      expires: session.expires,
    } : null,
    recentSessionsInDb: recentSessions.map(s => ({
      id: s.id,
      userId: s.userId,
      userEmail: s.user.email,
      expires: s.expires,
    })),
    env: {
      hasAuthSecret: !!process.env.AUTH_SECRET,
      authUrl: process.env.AUTH_URL,
    },
  })
}


