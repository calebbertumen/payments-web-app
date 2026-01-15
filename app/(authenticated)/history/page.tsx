"use client"

import { Search, SlidersHorizontal, X, ChevronDown, CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface Filters {
  startDate: Date | undefined
  endDate: Date | undefined
  minAmount: string
  maxAmount: string
  paymentMethods: string[] // Array of payment method display strings
}

export default function HistoryPage() {
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    startDate: undefined,
    endDate: undefined,
    minAmount: "",
    maxAmount: "",
    paymentMethods: [],
  })
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false)
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1) // Reset to first page on new search
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchInput])

  const { data, isLoading, error } = useTransactions(page, 20, debouncedSearch)

  const hasActiveFilters = filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount || filters.paymentMethods.length > 0

  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      minAmount: "",
      maxAmount: "",
      paymentMethods: [],
    })
  }

  // Extract unique payment methods from transactions
  const availablePaymentMethods = useMemo(() => {
    if (!data?.transactions) return []
    const methods = new Map<string, string>()
    data.transactions.forEach((transaction) => {
      if (transaction.paymentMethodDetails?.display) {
        methods.set(transaction.paymentMethodDetails.display, transaction.paymentMethodDetails.display)
      } else if (transaction.paymentMethod) {
        methods.set(transaction.paymentMethod, transaction.paymentMethod)
      }
    })
    return Array.from(methods.values()).sort()
  }, [data?.transactions])

  // Filter transactions based on search query and filters (client-side for instant feedback)
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return []
    
    let filtered = data.transactions

    // Apply search filter
    const query = searchInput.trim()
    const queryLower = query.toLowerCase()
    if (query) {
      filtered = filtered.filter((transaction) => {
        // Format amount in multiple ways for searching
        const amount = Math.abs(transaction.amount)
        const amountStr = amount.toFixed(2)
        const amountNoDecimal = Math.floor(amount).toString()
        const amountWithDollar = `$${amountStr}`
        const amountWithoutDecimals = amountStr.replace(/\.00$/, "")
        
        // Format date in multiple ways for searching
        const transactionDate = new Date(transaction.date)
        const dateISO = transaction.date // Already in YYYY-MM-DD format
        const dateStr = format(transactionDate, "M/d/yy")
        const dateFullStr = format(transactionDate, "MMMM d, yyyy")
        const dateLongStr = format(transactionDate, "MM/dd/yyyy")
        const dateShortMonth = format(transactionDate, "MMM d, yyyy")
        const monthName = format(transactionDate, "MMMM")
        const monthAbbr = format(transactionDate, "MMM")
        const day = transactionDate.getDate().toString()
        const month = (transactionDate.getMonth() + 1).toString()
        const monthPadded = month.padStart(2, "0")
        const dayPadded = day.padStart(2, "0")
        const year = transactionDate.getFullYear().toString()
        const yearShort = year.slice(-2)
        
        // Remove dollar sign, commas, and spaces from query for amount matching
        const queryForAmount = query.replace(/[$,\s]/g, "")
        const queryNumericOnly = query.replace(/[^0-9.]/g, "")
        
        // Company/store name search (case-insensitive, starts with)
        const companyMatch = transaction.company.toLowerCase().startsWith(queryLower) ||
          transaction.merchantName?.toLowerCase().startsWith(queryLower) ||
          false
        
        // Category search (case-insensitive, starts with)
        const categoryMatch = transaction.category?.toLowerCase().startsWith(queryLower) || false
        
        // Amount search (various formats, starts with)
        // Check if amount starts with the query (as a numeric string)
        // For example: "2" matches "2.00", "20.00", "251.00" but not "42.30"
        // For example: "95" matches "95.21" but not "8.95"
        let amountMatch = false
        
        if (queryNumericOnly) {
          // Remove decimal point from query for comparison (e.g., "95.21" -> "9521")
          const queryNumericClean = queryNumericOnly.replace(/\./g, "")
          // Check if integer part of amount (as string) starts with query
          // amountNoDecimal is the integer part (e.g., "251" for 251.00)
          amountMatch = amountNoDecimal.startsWith(queryNumericClean) ||
            // Also check formatted strings with decimal
            amountStr.startsWith(queryNumericOnly) ||
            // Handle dollar sign format (e.g., "$95.21" starts with "$95")
            (queryForAmount && amountWithDollar.toLowerCase().startsWith(queryForAmount.toLowerCase()))
        } else {
          // If query is not numeric, try exact string match
          amountMatch = 
            amountStr.startsWith(query) ||
            amountNoDecimal.startsWith(query) ||
            amountWithDollar.toLowerCase().startsWith(queryLower)
        }
        
        // Date search - must start with query (strict "starts with" matching only)
        // For example: "9" should match "9/1/26" (September) but NOT "1/9/26" or "2026-..."
        // Only match month/day/date string patterns, NEVER match by year alone
        // If query is a single number or starts with number without separator, only check month (e.g., "2" = February)
        const isNumericQuery = /^\d+$/.test(query)
        const hasDateSeparator = query.includes("/") || query.includes("-")
        
        let dateMatch = false
        
        // If query is purely numeric without separator, only match month or month-first dates
        if (isNumericQuery && !hasDateSeparator) {
          // Only match if month starts with query (e.g., "2" matches "02" = February)
          dateMatch = month.startsWith(query) || monthPadded.startsWith(query) ||
            // Or if date string starts with month (e.g., "2/1" for February)
            dateStr.startsWith(query + "/") || dateLongStr.startsWith(query.padStart(2, "0") + "/")
        } else {
          // For queries with separators or non-numeric, check all date formats
          dateMatch = 
            // Check month/day date formats (most common) - e.g., "1/9" matches "1/9/26"
            dateStr.startsWith(query) ||
            dateLongStr.startsWith(query) ||
            // Check month/day without year
            `${month}/${day}`.startsWith(query) ||
            `${monthPadded}/${dayPadded}`.startsWith(query) ||
            // Check month/day with year (but only if query has separator to avoid year matches)
            (hasDateSeparator && `${monthPadded}/${dayPadded}/${year}`.startsWith(query)) ||
            (hasDateSeparator && `${monthPadded}/${dayPadded}/${yearShort}`.startsWith(query)) ||
            // Check full date formats (month name formats)
            dateFullStr.toLowerCase().startsWith(queryLower) ||
            dateShortMonth.toLowerCase().startsWith(queryLower) ||
            // Month name matching - e.g., "Dec" matches "December 25, 2024"
            monthName.toLowerCase().startsWith(queryLower) ||
            monthAbbr.toLowerCase().startsWith(queryLower) ||
            // ISO date format - ONLY match if query contains a separator (month/day pattern)
            // This prevents "2" from matching "2026-01-09" (year starts with "2")
            (hasDateSeparator && dateISO.startsWith(query.replace(/\//g, "-"))) ||
            (query.includes("-") && dateISO.startsWith(query))
        }
        
        return companyMatch || categoryMatch || amountMatch || dateMatch
      })
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date)
        // Set time to start of day for accurate comparison
        const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate())
        
        let startMatch = true
        let endMatch = true
        
        if (filters.startDate) {
          const startDateOnly = new Date(filters.startDate.getFullYear(), filters.startDate.getMonth(), filters.startDate.getDate())
          startMatch = transactionDateOnly >= startDateOnly
        }
        
        if (filters.endDate) {
          const endDateOnly = new Date(filters.endDate.getFullYear(), filters.endDate.getMonth(), filters.endDate.getDate())
          endMatch = transactionDateOnly <= endDateOnly
        }
        
        return startMatch && endMatch
      })
    }

    // Apply amount range filter
    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.filter((transaction) => {
        const amount = Math.abs(transaction.amount)
        const min = filters.minAmount && filters.minAmount.trim() !== "" 
          ? parseFloat(filters.minAmount) 
          : 0
        const max = filters.maxAmount && filters.maxAmount.trim() !== "" 
          ? parseFloat(filters.maxAmount) 
          : Infinity

        if (isNaN(min) || isNaN(max)) return true // Skip invalid numbers
        
        return amount >= min && amount <= max
      })
    }

    // Apply payment method filter
    if (filters.paymentMethods.length > 0) {
      filtered = filtered.filter((transaction) => {
        const paymentMethodDisplay = transaction.paymentMethodDetails?.display || transaction.paymentMethod || "Cash"
        return filters.paymentMethods.includes(paymentMethodDisplay)
      })
    }

    return filtered
  }, [data?.transactions, searchInput, filters])

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header with Title and Search Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold">Payment History</h1>
          <div className="relative max-w-xl flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search Payments"
              className={`pl-10 ${searchInput ? "pr-24" : "pr-12"} py-6 text-base bg-white border-gray-300`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => setSearchInput("")}
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                hasActiveFilters ? "text-[#9D00FF]" : "text-gray-600"
              }`}
              onClick={() => setIsFilterOpen(true)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Filters active:</span>
            {(filters.startDate || filters.endDate) && (
              <span className="px-2 py-1 bg-[#F5E6FF] text-[#9D00FF] rounded">
                {filters.startDate ? format(filters.startDate, "M/d/yy") : "..."} - {filters.endDate ? format(filters.endDate, "M/d/yy") : "..."}
              </span>
            )}
            {(filters.minAmount || filters.maxAmount) && (
              <span className="px-2 py-1 bg-[#F5E6FF] text-[#9D00FF] rounded">
                ${filters.minAmount || "0"} - ${filters.maxAmount || "∞"}
              </span>
            )}
            {filters.paymentMethods.length > 0 && (
              <span className="px-2 py-1 bg-[#F5E6FF] text-[#9D00FF] rounded">
                {filters.paymentMethods.length} payment method{filters.paymentMethods.length !== 1 ? "s" : ""}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-auto p-1 text-[#9D00FF] hover:text-[#7A00CC]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Filter Transactions</DialogTitle>
            <DialogDescription>
              Filter transactions by date and amount range
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Date Filters */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="startDate"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !filters.startDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate ? (
                            format(filters.startDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => {
                            setFilters((prev) => ({ ...prev, startDate: date }))
                            setIsStartDateOpen(false)
                          }}
                          disabled={(date) => {
                            // Disable dates after end date if end date is set
                            if (filters.endDate) {
                              return date > filters.endDate
                            }
                            return false
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="endDate"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !filters.endDate && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate ? (
                            format(filters.endDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => {
                            setFilters((prev) => ({ ...prev, endDate: date }))
                            setIsEndDateOpen(false)
                          }}
                          disabled={(date) => {
                            // Disable dates before start date if start date is set
                            if (filters.startDate) {
                              return date < filters.startDate
                            }
                            return false
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Amount Range Filters */}
              <div className="space-y-2">
                <Label className="text-base font-semibold mb-3 block">Amount Range</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Min Amount ($)</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      placeholder="0.00"
                      value={filters.minAmount}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
                      }
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Max Amount ($)</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      placeholder="No limit"
                      value={filters.maxAmount}
                      onChange={(e) =>
                        setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
                      }
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <Label className="text-base font-semibold mb-3 block">Payment Method</Label>
                <Popover open={isPaymentMethodOpen} onOpenChange={setIsPaymentMethodOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => setIsPaymentMethodOpen(!isPaymentMethodOpen)}
                    >
                      <span>
                        {filters.paymentMethods.length === 0
                          ? "All payment methods"
                          : filters.paymentMethods.length === 1
                          ? filters.paymentMethods[0]
                          : `${filters.paymentMethods.length} selected`}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <div className="max-h-60 overflow-y-auto p-2">
                      {availablePaymentMethods.length === 0 ? (
                        <div className="px-2 py-4 text-sm text-gray-500 text-center">
                          No payment methods found
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {availablePaymentMethods.map((method) => {
                            const isChecked = filters.paymentMethods.includes(method)
                            return (
                              <div
                                key={method}
                                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setFilters((prev) => ({
                                    ...prev,
                                    paymentMethods: isChecked
                                      ? prev.paymentMethods.filter((m) => m !== method)
                                      : [...prev.paymentMethods, method],
                                  }))
                                }}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) => {
                                    setFilters((prev) => ({
                                      ...prev,
                                      paymentMethods: checked
                                        ? [...prev.paymentMethods, method]
                                        : prev.paymentMethods.filter((m) => m !== method),
                                    }))
                                  }}
                                />
                                <Label
                                  className="text-sm font-normal cursor-pointer flex-1"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {method}
                                </Label>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    {filters.paymentMethods.length > 0 && (
                      <div className="border-t p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, paymentMethods: [] }))
                          }}
                        >
                          Clear selection
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={() => setIsFilterOpen(false)} className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white">
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transactions List */}
      <div className="bg-white rounded-lg overflow-hidden">
        {isLoading && !data && (
          <div className="px-6 py-12 text-center text-gray-600">
            Loading transactions...
          </div>
        )}
        {error && (
          <div className="px-6 py-12 text-center text-red-600">
            Error loading transactions. Please try again.
          </div>
        )}
        {!isLoading && !error && (
          <div className="p-4">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => {
                  let amount = transaction.amount
                  
                  // Normalize amounts: purchases should be negative, credits should be positive
                  // Plaid's amount convention:
                  // - For checking/savings: negative = purchase, positive = deposit
                  // - For credit cards: positive = purchase (increases debt), negative = payment (decreases debt)
                  // We want: purchases always negative, credits always positive
                  
                  const isCreditCard = transaction.paymentMethodDetails?.type === "credit"
                  const isDepository = transaction.paymentMethodDetails?.type === "depository"
                  
                  // Credit cards: positive amounts are purchases (should show as negative)
                  if (isCreditCard && amount > 0) {
                    amount = -Math.abs(amount)
                  }
                  // For checking/savings: if amount is positive and it's a merchant transaction,
                  // it's likely a purchase stored incorrectly (should be negative)
                  // We identify purchases by having a merchant name and not being a transfer/deposit
                  else if (isDepository && amount > 0 && transaction.company) {
                    const category = transaction.category?.toLowerCase() || ""
                    const company = transaction.company.toLowerCase()
                    const isDepositOrTransfer = 
                      category.includes("transfer") || 
                      category.includes("deposit") ||
                      category.includes("interest") ||
                      company.includes("deposit") ||
                      company.includes("transfer") ||
                      company.includes("payroll") ||
                      company.includes("direct deposit")
                    
                    // If it's not a deposit/transfer, it's likely a purchase
                    if (!isDepositOrTransfer) {
                      amount = -Math.abs(amount)
                    }
                  }
                  
                  const isSpent = amount < 0
                  const isGained = amount > 0
                  const amountDisplay = isSpent 
                    ? `-$${Math.abs(amount).toFixed(2)}`
                    : isGained
                    ? `+$${amount.toFixed(2)}`
                    : `$${Math.abs(amount).toFixed(2)}`
                  
                  return (
                    <Link
                      key={transaction.id}
                      href={`/history/${transaction.id}`}
                      className="block bg-gray-100 rounded-lg px-6 py-3 hover:bg-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{transaction.company}</div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-0.5">
                            <span>{format(new Date(transaction.date), "M/d/yy")}</span>
                            {transaction.paymentMethodDetails && (
                              <span className="text-gray-500">
                                {transaction.paymentMethodDetails.display}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {amountDisplay}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                {searchInput || hasActiveFilters
                  ? "No payments found matching your search or filters"
                  : "No transactions yet. Link a payment method to get started."}
              </div>
            )}
          </div>
        )}
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
