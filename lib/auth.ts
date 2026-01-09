import NextAuth, { type DefaultSession } from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      // With PrismaAdapter (database sessions), user is always provided
      if (session.user && user) {
        session.user.id = user.id
      }
      return session
    },
    redirect: async ({ url, baseUrl }) => {
      // If redirecting to login page, go to history instead
      if (url.includes("/login")) {
        return `${baseUrl}/history`
      }
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Handle absolute URLs from the same origin
      if (new URL(url).origin === baseUrl) {
        return url
      }
      // Default redirect after login
      return `${baseUrl}/history`
    },
  },
  pages: {
    error: "/login",
  },
  trustHost: true, // Required for Auth.js v5 in development
  session: {
    strategy: "database", // Explicitly use database sessions with PrismaAdapter
  },
})

