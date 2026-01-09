import { useMutation, useQueryClient } from "@tanstack/react-query"

export function useCreateLinkToken() {
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/plaid/link-token", {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to create link token" }))
        throw new Error(error.error || "Failed to create link token")
      }
      const data = await res.json()
      if (!data.link_token) {
        throw new Error("Invalid response from server")
      }
      return data.link_token
    },
  })
}

export function useExchangePublicToken() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (publicToken: string) => {
      const res = await fetch("/api/plaid/exchange-public-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_token: publicToken }),
      })
      if (!res.ok) throw new Error("Failed to exchange public token")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
    },
  })
}

export function useSyncTransactions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch("/api/plaid/sync-transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to sync transactions")
      }
      return res.json()
    },
    onSuccess: () => {
      // Invalidate queries after a short delay to allow background job to complete
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["transactions"] })
        queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
      }, 2000)
    },
  })
}

