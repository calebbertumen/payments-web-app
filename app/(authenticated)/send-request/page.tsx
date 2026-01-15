"use client"

import { useState, useMemo } from "react"
import { Phone, User, MoreVertical, X, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { usePaymentMethods } from "@/hooks/use-payment-methods"

// Mock data types - will be replaced with real API calls
interface Contact {
  id: string
  name: string
  email: string
  phone?: string
  image?: string
  isContact: boolean
  lastTransactionDate?: Date
}

// Mock data - will be replaced with API calls
const mockContacts: Contact[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", phone: "+1234567890", isContact: true, lastTransactionDate: new Date("2024-01-15") },
  { id: "2", name: "Bob Smith", email: "bob@example.com", phone: "+1234567891", isContact: true, lastTransactionDate: new Date("2024-01-20") },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", phone: "+1234567892", isContact: true, lastTransactionDate: new Date("2024-01-10") },
  { id: "4", name: "Diana Prince", email: "diana@example.com", phone: "+1234567893", isContact: true, lastTransactionDate: new Date("2024-01-18") },
  { id: "5", name: "Eve Wilson", email: "eve@example.com", phone: "+1234567894", isContact: true, lastTransactionDate: new Date("2024-01-22") },
  { id: "6", name: "Frank Miller", email: "frank@example.com", phone: "+1234567895", isContact: true },
  { id: "7", name: "Grace Lee", email: "grace@example.com", phone: "+1234567896", isContact: true },
]

const mockAllUsers: Contact[] = [
  ...mockContacts,
  { id: "8", name: "Henry Davis", email: "henry@example.com", isContact: false },
  { id: "9", name: "Ivy Chen", email: "ivy@example.com", isContact: false },
  { id: "10", name: "Jack Taylor", email: "jack@example.com", isContact: false },
]

interface Recipient {
  id: string
  name: string
  email?: string
  phone?: string
  isContact: boolean
}

export default function SendRequestPage() {
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([])
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"send" | "request" | null>(null)
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>("")
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [newRecipientInput, setNewRecipientInput] = useState("")
  
  const { data: paymentMethodsData } = usePaymentMethods()
  const paymentMethods = paymentMethodsData?.paymentMethods || []

  // Get recent users (5 most recent transactions)
  const recentUsers = useMemo(() => {
    return mockContacts
      .filter((contact) => contact.lastTransactionDate)
      .sort((a, b) => {
        const dateA = a.lastTransactionDate?.getTime() || 0
        const dateB = b.lastTransactionDate?.getTime() || 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [])

  // Get all contacts sorted alphabetically
  const allContacts = useMemo(() => {
    return [...mockContacts].sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const handleAddRecipient = () => {
    const input = newRecipientInput.trim()
    if (!input) {
      toast.error("Please enter a name, email, or phone number")
      return
    }

    // Check if it's an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
    // Check if it's a phone number (basic check)
    const isPhone = /^[\d\s\-\+\(\)]+$/.test(input) && input.replace(/\D/g, "").length >= 10
    // Otherwise treat as name

    // Check if recipient already added
    const alreadyAdded = selectedRecipients.some(
      (r) => r.name.toLowerCase() === input.toLowerCase() ||
        r.email?.toLowerCase() === input.toLowerCase() ||
        r.phone === input
    )

    if (alreadyAdded) {
      toast.error("This recipient is already added")
      return
    }

    // Try to find in existing contacts
    let foundContact: Contact | null = null
    if (isEmail) {
      foundContact = mockContacts.find((c) => c.email.toLowerCase() === input.toLowerCase()) || null
    } else if (isPhone) {
      foundContact = mockContacts.find((c) => c.phone === input) || null
    } else {
      foundContact = mockContacts.find((c) => c.name.toLowerCase() === input.toLowerCase()) || null
    }

    if (foundContact) {
      // Add existing contact
      setSelectedRecipients((prev) => [
        ...prev,
        {
          id: foundContact!.id,
          name: foundContact!.name,
          email: foundContact!.email,
          phone: foundContact!.phone,
          isContact: true,
        },
      ])
    } else {
      // Add new recipient (non-contact)
      const newRecipient: Recipient = {
        id: `new-${Date.now()}-${Math.random()}`,
        name: isEmail || isPhone ? input : input,
        email: isEmail ? input : undefined,
        phone: isPhone ? input : undefined,
        isContact: false,
      }
      setSelectedRecipients((prev) => [...prev, newRecipient])
    }

    setNewRecipientInput("")
  }

  const handleRemoveRecipient = (id: string) => {
    setSelectedRecipients((prev) => prev.filter((r) => r.id !== id))
  }

  const handleSyncContacts = () => {
    // TODO: Sync phone contacts via API
    toast.success("Contacts synced successfully")
    setIsSyncDialogOpen(false)
  }

  const handleContactClick = (contact: Contact) => {
    // Add clicked contact to recipients if not already added
    const alreadyAdded = selectedRecipients.some((r) => r.id === contact.id)
    if (!alreadyAdded) {
      setSelectedRecipients([
        {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          isContact: contact.isContact,
        },
      ])
    } else {
      // If already added, just open dialog with existing recipients
      setSelectedRecipients((prev) => {
        // Move clicked contact to front if it exists
        const filtered = prev.filter((r) => r.id !== contact.id)
        return [
          {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            isContact: contact.isContact,
          },
          ...filtered,
        ]
      })
    }
    setTransactionType(null)
    setSelectedPaymentMethodId("")
    setAmount("")
    setMemo("")
    setIsTransactionDialogOpen(true)
  }

  const handleOpenSendRequest = () => {
    setSelectedRecipients([])
    setTransactionType(null)
    setSelectedPaymentMethodId("")
    setAmount("")
    setMemo("")
    setNewRecipientInput("")
    setIsTransactionDialogOpen(true)
  }

  const handleTransactionTypeSelect = (type: "send" | "request") => {
    setTransactionType(type)
  }

  const handleSubmitTransaction = () => {
    if (selectedRecipients.length === 0) {
      toast.error("Please add at least one recipient")
      return
    }
    if (!transactionType) {
      toast.error("Please select Send or Request")
      return
    }
    if (!selectedPaymentMethodId) {
      toast.error("Please select a payment method")
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }
    
    // TODO: Implement actual transaction API call
    const recipientNames = selectedRecipients.map((r) => r.name).join(", ")
    toast.success(
      `${transactionType === "send" ? "Sent" : "Requested"} $${parseFloat(amount).toFixed(2)} ${transactionType === "send" ? "to" : "from"} ${selectedRecipients.length === 1 ? selectedRecipients[0].name : `${selectedRecipients.length} recipients`}`
    )
    
    // Reset and close
    setIsTransactionDialogOpen(false)
    setSelectedRecipients([])
    setTransactionType(null)
    setSelectedPaymentMethodId("")
    setAmount("")
    setMemo("")
    setNewRecipientInput("")
  }

  const handleCloseTransactionDialog = () => {
    setIsTransactionDialogOpen(false)
    setSelectedRecipients([])
    setTransactionType(null)
    setSelectedPaymentMethodId("")
    setAmount("")
    setMemo("")
    setNewRecipientInput("")
  }

  // Get first initial + last initial
  const getUserInitials = (name: string): string => {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Send/Request</h1>
          <div className="flex gap-2">
            <Button onClick={handleOpenSendRequest} className="gap-2 bg-[#9D00FF] hover:bg-[#7A00CC] text-white">
              <ArrowUpRight className="h-4 w-4" />
              Send/Request
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsSyncDialogOpen(true)}>
                  <Phone className="mr-2 h-4 w-4" />
                  Sync Contacts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sync Phone Contacts</DialogTitle>
                  <DialogDescription>
                    We'll check your phone contacts and add any users who have a Payments account to your contacts list.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Button onClick={handleSyncContacts} className="w-full bg-[#9D00FF] hover:bg-[#7A00CC] text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Sync Contacts
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Recent Users */}
        {recentUsers.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Recents</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {recentUsers.map((user) => (
                <RecentContactCard
                  key={user.id}
                  contact={user}
                  onClick={handleContactClick}
                  getUserInitials={getUserInitials}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Contacts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Contacts</h2>
          {allContacts.length > 0 ? (
            <div className="space-y-2">
              {allContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  onClick={handleContactClick}
                  getUserInitials={getUserInitials}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No contacts yet. Add contacts or sync your phone contacts to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Dialog */}
      <Dialog open={isTransactionDialogOpen} onOpenChange={handleCloseTransactionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {transactionType === "send" ? "Send Money" : transactionType === "request" ? "Request Money" : "Select Transaction Type"}
            </DialogTitle>
            <DialogDescription>
              {transactionType === "send" 
                ? selectedRecipients.length > 1
                  ? `Send money to ${selectedRecipients.length} recipients`
                  : "Send money to recipients"
                : transactionType === "request" 
                ? selectedRecipients.length > 1
                  ? `Request money from ${selectedRecipients.length} recipients`
                  : "Request money from recipients"
                : "Choose whether to send or request money"}
            </DialogDescription>
          </DialogHeader>
          
          {/* Recipients List */}
          {selectedRecipients.length > 0 && (
            <div className="pb-4 border-b max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {selectedRecipients.map((recipient) => {
                  // Find full contact details if it's a contact
                  const fullContact = mockContacts.find((c) => c.id === recipient.id)
                  return (
                    <div key={recipient.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={fullContact?.image} alt={recipient.name} />
                        <AvatarFallback className="bg-[#9D00FF] text-white text-xs">
                          {getUserInitials(recipient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{recipient.name}</div>
                        {recipient.email && (
                          <div className="text-xs text-gray-500 truncate">{recipient.email}</div>
                        )}
                        {recipient.phone && !recipient.email && (
                          <div className="text-xs text-gray-500 truncate">{recipient.phone}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveRecipient(recipient.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Add Recipient Input */}
          <div className="space-y-2 pt-4">
            <Label htmlFor="newRecipient">Add Recipient</Label>
            <div className="flex gap-2">
              <Input
                id="newRecipient"
                type="text"
                placeholder="Name, email, or phone number"
                value={newRecipientInput}
                onChange={(e) => setNewRecipientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddRecipient()
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleAddRecipient}
                variant="outline"
                className="border-[#9D00FF] text-[#9D00FF] hover:bg-[#F5E6FF]"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Enter contact name, email, or phone number
            </p>
          </div>
          
          <div className="space-y-4 py-4">
            {/* Send/Request Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleTransactionTypeSelect("send")}
                className={`h-12 ${
                  transactionType === "send"
                    ? "bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
                    : "bg-white border border-[#9D00FF] text-[#9D00FF] hover:bg-[#F5E6FF]"
                }`}
              >
                Send
              </Button>
              <Button
                onClick={() => handleTransactionTypeSelect("request")}
                className={`h-12 ${
                  transactionType === "request"
                    ? "bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
                    : "bg-white border border-[#9D00FF] text-[#9D00FF] hover:bg-[#F5E6FF]"
                }`}
              >
                Request
              </Button>
            </div>

            {/* Payment Method Dropdown */}
            {transactionType && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select
                    value={selectedPaymentMethodId}
                    onValueChange={setSelectedPaymentMethodId}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No payment methods available
                        </SelectItem>
                      ) : (
                        paymentMethods.map((method) => (
                          <SelectItem key={method.id} value={method.id}>
                            {method.type} - {method.details}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount ($) {selectedRecipients.length > 1 && <span className="text-xs text-gray-500">(per recipient)</span>}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    step="0.01"
                    min="0.01"
                  />
                  {selectedRecipients.length > 1 && (
                    <p className="text-xs text-gray-500">
                      ${amount || "0.00"} × {selectedRecipients.length} = ${(parseFloat(amount || "0") * selectedRecipients.length).toFixed(2)} total
                    </p>
                  )}
                </div>

                {/* Memo Input */}
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Textarea
                    id="memo"
                    placeholder="Add a note..."
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTransactionDialog}>
              Cancel
            </Button>
            {transactionType && (
              <Button
                onClick={handleSubmitTransaction}
                className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
                disabled={selectedRecipients.length === 0 || !selectedPaymentMethodId || !amount || parseFloat(amount) <= 0}
              >
                {transactionType === "send" ? "Send Money" : "Request Money"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ContactCardProps {
  contact: Contact
  onClick: (contact: Contact) => void
  getUserInitials: (name: string) => string
  showAddButton?: boolean
}

interface RecentContactCardProps {
  contact: Contact
  onClick: (contact: Contact) => void
  getUserInitials: (name: string) => string
}

function RecentContactCard({ contact, onClick, getUserInitials }: RecentContactCardProps) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#9D00FF] transition-colors flex-shrink-0 w-32 h-32 flex flex-col items-center justify-center cursor-pointer"
      onClick={() => onClick(contact)}
    >
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-12 w-12">
          <AvatarImage src={contact.image} alt={contact.name} />
          <AvatarFallback className="bg-[#9D00FF] text-white text-sm">
            {getUserInitials(contact.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <div className="font-semibold text-xs text-gray-900 truncate w-full max-w-[120px]">{contact.name}</div>
        </div>
      </div>
    </div>
  )
}

function ContactCard({ contact, onClick, getUserInitials, showAddButton = false }: ContactCardProps) {
  const handleAddToContacts = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the card click
    // TODO: Add to contacts via API
    toast.success(`Added ${contact.name} to contacts`)
  }

  return (
    <div
      className="bg-white border border-gray-200 rounded-lg p-3 hover:border-[#9D00FF] transition-colors cursor-pointer"
      onClick={() => onClick(contact)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Avatar className="h-9 w-9">
            <AvatarImage src={contact.image} alt={contact.name} />
            <AvatarFallback className="bg-[#9D00FF] text-white text-xs">
              {getUserInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate">{contact.name}</div>
            <div className="text-xs text-gray-500 truncate">{contact.email}</div>
            {contact.phone && (
              <div className="text-xs text-gray-400 mt-0.5">{contact.phone}</div>
            )}
          </div>
        </div>
        {showAddButton && !contact.isContact && (
          <div onClick={handleAddToContacts}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
            >
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
