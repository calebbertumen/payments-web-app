"use client"

import { SessionProvider } from "next-auth/react"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import type { ReactNode } from "react"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={0}
      refetchOnWindowFocus={false}
    >
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </SessionProvider>
  )
}


