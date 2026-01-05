import { ArrowLeft, Store } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const mockTransaction = {
  id: "1",
  storeName: "Store Name",
  date: "1/1/25",
  location: "123 Street, City, State, Zip Code, Country",
  transactionNumber: "12345678",
  paymentMethod: "Visa 1234",
  barcode: "*12345678*", // Barcode for this transaction
  items: [
    { qty: 1, name: "Item 1", price: 15.9 },
    { qty: 2, name: "Item 2", price: 54.9 },
  ],
  subtotal: 70.8,
  tax: 6.5,
  total: 77.3,
}

export default function PaymentDetailsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Back Button */}
      <Link href="/history">
        <Button variant="ghost" size="icon" className="mb-6 h-12 w-12">
          <ArrowLeft className="h-6 w-6 text-purple-700" />
        </Button>
      </Link>

      {/* Transaction Details Card */}
      <div className="bg-white rounded-lg border border-gray-300 p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-2xl font-bold">{mockTransaction.storeName}</h2>
            <Store className="h-24 w-24" strokeWidth={1.5} />
          </div>
          <div className="space-y-3 text-right">
            <div>
              <span className="font-semibold">Date: </span>
              <span>{mockTransaction.date}</span>
            </div>
            <div>
              <span className="font-semibold">Location: </span>
              <span>{mockTransaction.location}</span>
            </div>
            <div>
              <span className="font-semibold">Transaction #: </span>
              <span>{mockTransaction.transactionNumber}</span>
            </div>
            <div>
              <span className="font-semibold">Payment Method: </span>
              <span>{mockTransaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-700 text-white">
                <th className="text-left px-6 py-3 font-semibold">QTY</th>
                <th className="text-left px-6 py-3 font-semibold">ITEM</th>
                <th className="text-right px-6 py-3 font-semibold">PRICE</th>
              </tr>
            </thead>
            <tbody>
              {mockTransaction.items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 last:border-b-0">
                  <td className="px-6 py-4">{item.qty}</td>
                  <td className="px-6 py-4">{item.name}</td>
                  <td className="px-6 py-4 text-right">${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="border-t border-gray-300 bg-white p-6 space-y-2">
            <div className="flex justify-between text-base">
              <span className="font-semibold">Subtotal:</span>
              <span>${mockTransaction.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="font-semibold">Tax:</span>
              <span>${mockTransaction.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span>${mockTransaction.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {mockTransaction.barcode && (
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-300 pt-8">
            <div className="font-mono text-4xl tracking-widest select-all">{mockTransaction.barcode}</div>
            <p className="text-sm text-gray-600">Transaction Barcode</p>
          </div>
        )}
      </div>
    </div>
  )
}
