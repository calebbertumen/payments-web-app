import { useQuery, keepPreviousData } from "@tanstack/react-query"

export interface Transaction {
  id: string
  company: string
  amount: number
  date: string
  merchantName: string
  category?: string | null
  paymentMethod: string
  paymentMethodDetails?: {
    type: string
    subtype: string | null
    mask: string | null
    display: string
  } | null
  source: string
}

interface TransactionsResponse {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useTransactions(page = 1, limit = 20, search = "") {
  return useQuery<TransactionsResponse>({
    queryKey: ["transactions", page, limit, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search) {
        params.append("search", search)
      }
      const res = await fetch(`/api/transactions?${params}`)
      if (!res.ok) throw new Error("Failed to fetch transactions")
      return res.json()
    },
    placeholderData: keepPreviousData, // Keep previous data while loading new data for smoother UX
    staleTime: 30000, // Consider data fresh for 30 seconds
  })
}

