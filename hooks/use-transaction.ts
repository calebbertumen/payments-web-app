import { useQuery } from "@tanstack/react-query"

export interface TransactionDetail {
  id: string
  storeName: string
  date: string
  location: string
  transactionNumber: string
  paymentMethod: string
  barcode: string | null
  items: Array<{ qty: number; name: string; price: number }>
  subtotal: number
  tax: number
  total: number
  category?: string | null
  notes?: string | null
  source: string
  shopName?: string | null
}

export function useTransaction(id: string) {
  return useQuery<TransactionDetail>({
    queryKey: ["transaction", id],
    queryFn: async () => {
      const res = await fetch(`/api/transactions/${id}`)
      if (!res.ok) throw new Error("Failed to fetch transaction")
      return res.json()
    },
    enabled: !!id,
  })
}

