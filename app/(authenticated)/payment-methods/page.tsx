"use client"

import { MoreVertical, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePaymentMethods, useDeletePaymentMethod } from "@/hooks/use-payment-methods"
import { useCreateLinkToken, useExchangePublicToken, useSyncTransactions } from "@/hooks/use-plaid"
import { usePlaidLink } from "react-plaid-link"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"

export default function PaymentMethodsPage() {
  const { data, isLoading, error } = usePaymentMethods()
  const deleteMutation = useDeletePaymentMethod()
  const createLinkToken = useCreateLinkToken()
  const exchangeToken = useExchangePublicToken()
  const syncTransactions = useSyncTransactions()
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null)

  const paymentMethods = data?.paymentMethods || []

  // Fetch payment method details
  const { data: paymentMethodDetails } = useQuery({
    queryKey: ["payment-method-details", selectedPaymentMethodId],
    queryFn: async () => {
      if (!selectedPaymentMethodId) return null
      const response = await fetch(`/api/payment-methods/${selectedPaymentMethodId}`)
      if (!response.ok) throw new Error("Failed to fetch details")
      return response.json()
    },
    enabled: !!selectedPaymentMethodId,
  })

  const onSuccess = useCallback(
    async (publicToken: string, metadata: any) => {
      try {
        toast.loading("Connecting your account...", { id: "plaid-connect" })
        
        const result = await exchangeToken.mutateAsync(publicToken)
        
        toast.success("Account connected successfully!", { id: "plaid-connect" })
        
        // Reset link token for next use
        setLinkToken(null)
        
        // Automatically sync transactions after connecting
        if (result.itemId) {
          toast.loading("Syncing transactions...", { id: "plaid-sync" })
          await syncTransactions.mutateAsync(result.itemId)
          toast.success("Transactions synced!", { id: "plaid-sync" })
        }
      } catch (error) {
        toast.error("Failed to connect account. Please try again.", { id: "plaid-connect" })
        console.error("Plaid connection error:", error)
        setLinkToken(null)
      }
    },
    [exchangeToken, syncTransactions]
  )

  const { open: openPlaidLink, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: (err, metadata) => {
      if (err) {
        toast.error("Connection cancelled or failed")
      }
      setLinkToken(null)
    },
  })

  // Auto-open Plaid Link when token is set and ready
  useEffect(() => {
    if (linkToken && ready) {
      toast.dismiss("plaid-prepare")
      openPlaidLink()
    }
  }, [linkToken, ready, openPlaidLink])

  const handleAddPaymentMethod = async () => {
    try {
      toast.loading("Preparing connection...", { id: "plaid-prepare" })
      const token = await createLinkToken.mutateAsync()
      setLinkToken(token)
      // Plaid Link will open automatically via useEffect when ready
    } catch (error: any) {
      toast.error(
        error?.message || "Failed to initialize Plaid. Please check your credentials.",
        { id: "plaid-prepare" }
      )
      console.error("Error creating link token:", error)
      setLinkToken(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        await deleteMutation.mutateAsync(id)
        toast.success("Payment method deleted")
      } catch (error) {
        toast.error("Failed to delete payment method")
      }
    }
  }

  const handleSync = async (plaidItemId: string | null | undefined) => {
    if (!plaidItemId) {
      toast.error("This payment method cannot be synced")
      return
    }

    try {
      toast.loading("Syncing transactions...", { id: "sync-transactions" })
      await syncTransactions.mutateAsync(plaidItemId)
      toast.success("Transactions synced successfully!", { id: "sync-transactions" })
    } catch (error) {
      toast.error("Failed to sync transactions. Please try again.", { id: "sync-transactions" })
      console.error("Sync error:", error)
    }
  }

  const handleSyncAll = async () => {
    const plaidItemIds = paymentMethods
      .map((method) => method.plaidItemId)
      .filter((id): id is string => !!id)
      .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates

    if (plaidItemIds.length === 0) {
      toast.error("No payment methods available to sync")
      return
    }

    try {
      toast.loading(`Syncing ${plaidItemIds.length} payment method(s)...`, { id: "sync-all" })
      
      // Sync all payment methods sequentially
      for (const itemId of plaidItemIds) {
        await syncTransactions.mutateAsync(itemId)
      }
      
      toast.success(`Successfully synced ${plaidItemIds.length} payment method(s)!`, { id: "sync-all" })
    } catch (error) {
      toast.error("Failed to sync some payment methods. Please try again.", { id: "sync-all" })
      console.error("Sync all error:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-600">Loading payment methods...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-red-600">
          Error loading payment methods. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Transactions are automatically synced when payments are made. Use manual sync if needed.
        </p>
      </div>
      <div className="flex items-center justify-end gap-3 mb-6">
        {paymentMethods.length > 0 && paymentMethods.some((m) => m.plaidItemId) && (
          <Button
            onClick={handleSyncAll}
            disabled={syncTransactions.isPending}
            variant="outline"
            className="disabled:opacity-50"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            {syncTransactions.isPending ? "Syncing..." : "Sync All"}
            </Button>
        )}
              <Button
                onClick={handleAddPaymentMethod}
          disabled={createLinkToken.isPending}
          className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white disabled:opacity-50"
        >
          <Plus className="h-5 w-5 mr-2" />
          {createLinkToken.isPending ? "Loading..." : "Add Payment Method"}
              </Button>
      </div>

      <div className="space-y-4">
        {paymentMethods.length > 0 ? (
          paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white border border-gray-300 rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-sm mb-0.5">{method.type}</h3>
              <p className="text-sm text-gray-600">{method.details}</p>
                {method.bankName && (
                  <p className="text-xs text-gray-500 mt-0.5">{method.bankName}</p>
                )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setSelectedPaymentMethodId(method.id)}
                  >
                    View Details
                  </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(method.id)}
                  className="text-destructive focus:text-destructive"
                    disabled={deleteMutation.isPending}
                >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          ))
        ) : (
          <div className="bg-white border border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-4">No payment methods yet.</p>
            <p className="text-sm text-gray-500 mb-6">
              Connect your bank account or credit card to start tracking transactions.
            </p>
            <Button
              onClick={handleAddPaymentMethod}
              disabled={createLinkToken.isPending}
              className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white disabled:opacity-50"
            >
              <Plus className="h-5 w-5 mr-2" />
              {createLinkToken.isPending ? "Loading..." : "Connect Account"}
            </Button>
          </div>
        )}
      </div>

      {/* Payment Method Details Dialog */}
      <Dialog open={!!selectedPaymentMethodId} onOpenChange={(open) => !open && setSelectedPaymentMethodId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Method Details</DialogTitle>
            <DialogDescription>View detailed information about this payment method</DialogDescription>
          </DialogHeader>
          {paymentMethodDetails ? (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <p className="text-base font-semibold">{paymentMethodDetails.type}</p>
                </div>
                {paymentMethodDetails.subtype && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Subtype</label>
                    <p className="text-base font-semibold capitalize">{paymentMethodDetails.subtype}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-base font-semibold">{paymentMethodDetails.name}</p>
              </div>
              {paymentMethodDetails.officialName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Official Name</label>
                  <p className="text-base">{paymentMethodDetails.officialName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Owner Name</label>
                <p className="text-base font-semibold">{paymentMethodDetails.ownerName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {paymentMethodDetails.mask && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account/Card Number</label>
                    <p className="text-base font-mono">xxxx {paymentMethodDetails.mask}</p>
                  </div>
                )}
                {paymentMethodDetails.expirationDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Expiration Date</label>
                    <p className="text-base font-semibold">
                      {format(new Date(paymentMethodDetails.expirationDate), "MM/yyyy")}
                    </p>
                  </div>
                )}
              </div>
              {paymentMethodDetails.institutionName && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Institution</label>
                  <p className="text-base">{paymentMethodDetails.institutionName}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Details</label>
                <p className="text-base">{paymentMethodDetails.details}</p>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">Loading details...</div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setSelectedPaymentMethodId(null)}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
