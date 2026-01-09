import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface PaymentMethod {
  id: string
  type: string
  details: string
  cardNumber?: string
  bankName?: string
  accountNumber?: string
  plaidAccountId?: string | null
  plaidItemId?: string | null
}

interface PaymentMethodsResponse {
  paymentMethods: PaymentMethod[]
}

export function usePaymentMethods() {
  return useQuery<PaymentMethodsResponse>({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await fetch("/api/payment-methods")
      if (!res.ok) throw new Error("Failed to fetch payment methods")
      return res.json()
    },
  })
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/payment-methods?id=${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete payment method")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
    },
  })
}

