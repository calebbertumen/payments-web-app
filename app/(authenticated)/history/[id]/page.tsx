"use client"

import { useState } from "react"
import { ArrowLeft, Store } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useTransaction } from "@/hooks/use-transaction"
import { format } from "date-fns"
import { useParams } from "next/navigation"

export default function PaymentDetailsPage() {
  const params = useParams()
  const id = params.id as string
  const { data: transaction, isLoading, error } = useTransaction(id)
  const [logoError, setLogoError] = useState(false)

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="text-center text-gray-600">Loading transaction details...</div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link href="/history">
          <Button variant="ghost" size="icon" className="mb-6 h-12 w-12">
            <ArrowLeft className="h-6 w-6 text-[#9D00FF]" />
          </Button>
        </Link>
        <div className="text-center text-red-600">
          Transaction not found or error loading details.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link href="/history">
          <Button variant="ghost" size="icon" className="mb-6 h-12 w-12">
            <ArrowLeft className="h-6 w-6 text-[#9D00FF]" />
          </Button>
      </Link>

      {/* Transaction Details Card */}
      <div className="bg-white rounded-lg border border-gray-300 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold">{transaction.storeName}</h2>
            {transaction.storeLogoUrl && !logoError ? (
              <div className="relative h-24 w-24 flex items-center justify-center bg-white rounded-lg border border-gray-200 p-2">
                <img
                  src={transaction.storeLogoUrl}
                  alt={transaction.storeName}
                  className="object-contain max-h-full max-w-full"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : (
              <Store className="h-24 w-24 text-gray-400" strokeWidth={1.5} />
            )}
          </div>
          <div className="space-y-3 text-right">
            <div>
              <span className="font-semibold">Date: </span>
              <span>{format(new Date(transaction.date), "M/d/yy")}</span>
            </div>
            <div>
              <span className="font-semibold">Location: </span>
              <span>{transaction.location || "N/A"}</span>
            </div>
            <div>
              <span className="font-semibold">Transaction #: </span>
              <span>{transaction.transactionNumber}</span>
            </div>
            <div>
              <span className="font-semibold">Payment Method: </span>
              <span>{transaction.paymentMethod}</span>
            </div>
            {transaction.category && (
              <div>
                <span className="font-semibold">Category: </span>
                <span>{transaction.category}</span>
              </div>
            )}
            {transaction.source === "CASH_QR" && transaction.shopName && (
              <div>
                <span className="font-semibold">Shop: </span>
                <span>{transaction.shopName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#9D00FF] text-white">
                <th className="text-left px-6 py-3 font-semibold">QTY</th>
                <th className="text-left px-6 py-3 font-semibold">ITEM</th>
                <th className="text-right px-6 py-3 font-semibold">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items && transaction.items.length > 0 ? (
                transaction.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-6 py-4">{item.qty}</td>
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                    No item details available
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-gray-300 bg-white p-6 space-y-2">
            {transaction.subtotal !== transaction.total && (
              <div className="flex justify-between text-base">
                <span className="font-semibold">Subtotal:</span>
                <span>${transaction.subtotal.toFixed(2)}</span>
              </div>
            )}
            {transaction.tax > 0 && (
              <div className="flex justify-between text-base">
                <span className="font-semibold">Tax:</span>
                <span>${transaction.tax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${Math.abs(transaction.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {transaction.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="font-semibold mb-2">Notes:</div>
            <div className="text-gray-700">{transaction.notes}</div>
          </div>
        )}

        {transaction.barcode && (
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-300 pt-8">
            <div className="font-mono text-4xl tracking-widest select-all">{transaction.barcode}</div>
            <p className="text-sm text-gray-600">Transaction Barcode</p>
          </div>
        )}
      </div>
    </div>
  )
}

