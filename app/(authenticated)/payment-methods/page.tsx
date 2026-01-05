"use client"

import { MoreVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type PaymentMethod = {
  id: string
  type: string
  details: string
  cardNumber?: string
  bankName?: string
  accountNumber?: string
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: "1",
    type: "Credit Card",
    details: "Visa xxxx 0123",
    cardNumber: "1234567890120123",
  },
  {
    id: "2",
    type: "Bank Account",
    details: "Chase Checking xxxx0123",
    bankName: "Chase",
    accountNumber: "123456780123",
  },
]

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods)
  const [open, setOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [paymentType, setPaymentType] = useState<string>("")
  const [cardNumber, setCardNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [bankName, setBankName] = useState("")

  const handleDelete = (id: string) => {
    setPaymentMethods(paymentMethods.filter((method) => method.id !== id))
  }

  const handleEdit = (id: string) => {
    const method = paymentMethods.find((m) => m.id === id)
    if (method) {
      setSelectedMethod(method)
      setCardNumber(method.cardNumber || "")
      setAccountNumber(method.accountNumber || "")
      setBankName(method.bankName || "")
      setEditOpen(true)
    }
  }

  const handleSaveEdit = () => {
    if (!selectedMethod) return

    const isValid =
      selectedMethod.type === "Credit Card"
        ? cardNumber && cardNumber.length >= 13
        : bankName && accountNumber && accountNumber.length >= 4

    if (!isValid) return

    const updatedMethods = paymentMethods.map((method) => {
      if (method.id === selectedMethod.id) {
        if (selectedMethod.type === "Credit Card") {
          return {
            ...method,
            cardNumber,
            details: `Visa xxxx ${cardNumber.slice(-4)}`,
          }
        } else {
          return {
            ...method,
            bankName,
            accountNumber,
            details: `${bankName} Checking xxxx${accountNumber.slice(-4)}`,
          }
        }
      }
      return method
    })

    setPaymentMethods(updatedMethods)
    setEditOpen(false)
    setSelectedMethod(null)
    setCardNumber("")
    setAccountNumber("")
    setBankName("")
  }

  const handleCancelEdit = () => {
    setEditOpen(false)
    setSelectedMethod(null)
    setCardNumber("")
    setAccountNumber("")
    setBankName("")
  }

  const handleAddPaymentMethod = () => {
    if (!paymentType) return

    const newMethod: PaymentMethod = {
      id: String(paymentMethods.length + 1),
      type: paymentType === "credit" ? "Credit Card" : "Bank Account",
      details:
        paymentType === "credit"
          ? `Visa xxxx ${cardNumber.slice(-4)}`
          : `${bankName} Checking xxxx${accountNumber.slice(-4)}`,
      ...(paymentType === "credit" ? { cardNumber } : { bankName, accountNumber }),
    }

    setPaymentMethods([...paymentMethods, newMethod])
    setOpen(false)
    setPaymentType("")
    setCardNumber("")
    setAccountNumber("")
    setBankName("")
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-end mb-6">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#6B46C1] hover:bg-[#5a3aa0] text-white">
              <Plus className="h-5 w-5 mr-2" />
              Add Payment Method
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Payment Method</DialogTitle>
              <DialogDescription>Add a new credit card or bank account to your payment methods.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="payment-type">Payment Type</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger id="payment-type">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="bank">Bank Account</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {paymentType === "credit" && (
                <div className="grid gap-2">
                  <Label htmlFor="card-number">Card Number</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={16}
                  />
                </div>
              )}

              {paymentType === "bank" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="bank-name">Bank Name</Label>
                    <Input
                      id="bank-name"
                      placeholder="Chase, Bank of America, etc."
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      placeholder="1234567890"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      maxLength={12}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPaymentMethod}
                disabled={
                  !paymentType ||
                  (paymentType === "credit" && !cardNumber) ||
                  (paymentType === "bank" && (!bankName || !accountNumber))
                }
                className="bg-[#6B46C1] hover:bg-[#5a3aa0] text-white"
              >
                Add Payment Method
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Update your {selectedMethod?.type.toLowerCase()} information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedMethod?.type === "Credit Card" ? (
              <div className="grid gap-2">
                <Label htmlFor="edit-card-number">Card Number</Label>
                <Input
                  id="edit-card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  maxLength={16}
                />
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="edit-bank-name">Bank Name</Label>
                  <Input
                    id="edit-bank-name"
                    placeholder="Chase, Bank of America, etc."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-account-number">Account Number</Label>
                  <Input
                    id="edit-account-number"
                    placeholder="1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    maxLength={12}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                selectedMethod?.type === "Credit Card"
                  ? !cardNumber || cardNumber.length < 13
                  : !bankName || !accountNumber || accountNumber.length < 4
              }
              className="bg-[#6B46C1] hover:bg-[#5a3aa0] text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="bg-white border border-gray-300 rounded-lg p-6 flex items-center justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg mb-1">{method.type}</h3>
              <p className="text-gray-600">{method.details}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(method.id)}>Edit payment method</DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(method.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete payment method
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  )
}
