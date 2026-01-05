import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-purple-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <h1 className="text-2xl font-bold italic">Payments</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Sign Up</h2>
          <p className="text-center text-gray-600">This is a demo. Click below to continue.</p>
          <Link href="/history">
            <Button className="w-full bg-purple-700 hover:bg-purple-800">Continue to Dashboard</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
