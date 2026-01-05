"use client"

import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const mockTransactions = [
  { id: "1", company: "Store Name", amount: 0.0, date: "1/1/26" },
  { id: "2", company: "Store Name", amount: 0.0, date: "1/1/26" },
  { id: "3", company: "Store Name", amount: 0.0, date: "1/1/26" },
  { id: "4", company: "Store Name", amount: 0.0, date: "1/1/26" },
  { id: "5", company: "Store Name", amount: 0.0, date: "1/1/26" },
  { id: "6", company: "Store Name", amount: 0.0, date: "1/1/26" },
]

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter transactions based on search query (company name or date)
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return true

    return transaction.company.toLowerCase().includes(query) || transaction.date.includes(query)
  })

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
            onChange={(e) => setSearchQuery(e.target.value)}
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
                      ${transaction.amount.toFixed(2)}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/history/${transaction.id}`} className="block">
                      {transaction.date}
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                  No payments found matching "{searchQuery}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
