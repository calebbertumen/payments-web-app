"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { useState } from "react"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/home"
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await signIn("google", {
        callbackUrl,
        redirect: true,
      })
    } catch (err) {
      setError("An error occurred during sign up. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#9D00FF] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <Link href="/">
            <h1 className="text-2xl font-bold italic">Payments</h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-lg border border-gray-300 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-center">Sign Up</h2>
          <p className="text-center text-gray-600">Create an account with Google to get started.</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
          >
            {isLoading ? "Signing up..." : "Sign up with Google"}
          </Button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#9D00FF] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
