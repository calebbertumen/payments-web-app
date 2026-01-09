"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { format } from "date-fns"

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useTransactions(page, 20, searchQuery)

  // Filter transactions based on search query (client-side for instant feedback)
  const filteredTransactions = data?.transactions.filter((transaction) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    return (
      transaction.company.toLowerCase().includes(query) ||
      transaction.date.includes(query) ||
      transaction.category?.toLowerCase().includes(query)
    )
  }) || []

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-gray-600">Loading transactions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="text-center text-red-600">
          Error loading transactions. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search Payments"
            className="pl-10 pr-12 py-6 text-base bg-white border-gray-300"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1) // Reset to first page on new search
            }}
          />
          <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2">
            <SlidersHorizontal className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg border border-gray-300 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Company</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Amount</th>
              <th className="text-left px-6 py-4 font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <tr
                  key={transaction.id}
                  className={`border-b border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors ${
                    index === filteredTransactions.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <Link href={`/history/${transaction.id}`} className="block">
                      {transaction.company}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/history/${transaction.id}`} className="block">
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/history/${transaction.id}`} className="block">
                      {format(new Date(transaction.date), "M/d/yy")}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  {searchQuery
                    ? `No payments found matching "${searchQuery}"`
                    : "No transactions yet. Link a payment method to get started."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Page {page} of {data.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
            disabled={page === data.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
