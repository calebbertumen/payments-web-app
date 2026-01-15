"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect } from "react"

const slides = [
  {
    title: "Payment History",
    description: "View all your transactions in one place with detailed information",
    page: "history",
    preview: (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Payment History</h3>
          <div className="h-8 w-32 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">Search...</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">McDonald's</div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>1/22/26</span>
                <span className="text-gray-500">Checking •••• 0000</span>
              </div>
            </div>
            <div className="font-semibold text-sm text-gray-900">-$12.00</div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">Target</div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>1/21/26</span>
                <span className="text-gray-500">Credit card •••• 5678</span>
              </div>
            </div>
            <div className="font-semibold text-sm text-gray-900">-$45.67</div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">Amazon</div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>1/20/26</span>
                <span className="text-gray-500">Checking •••• 1234</span>
              </div>
            </div>
            <div className="font-semibold text-sm text-gray-900">-$89.99</div>
          </div>
          <div className="flex items-center justify-between px-6 py-3 bg-gray-100 rounded-lg">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900">Starbucks</div>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-0.5">
                <span>1/19/26</span>
                <span className="text-gray-500">Credit card •••• 5678</span>
              </div>
            </div>
            <div className="font-semibold text-sm text-gray-900">-$5.45</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Payment Methods",
    description: "Manage all your connected bank accounts and cards",
    page: "payment-methods",
    preview: (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">Sync All</span>
          </div>
          <div className="h-8 w-40 bg-[#9D00FF] rounded flex items-center justify-center">
            <span className="text-xs text-white font-medium">+ Add Method</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <div className="p-3 border border-gray-300 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 mb-0.5">Bank Account</div>
              <div className="text-xs text-gray-600">Chase Checking xxxx 1234</div>
              <div className="text-xs text-gray-500 mt-0.5">Chase</div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⋮</span>
            </div>
          </div>
          <div className="p-3 border border-gray-300 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 mb-0.5">Credit Card</div>
              <div className="text-xs text-gray-600">Visa xxxx 5678</div>
              <div className="text-xs text-gray-500 mt-0.5">Chase</div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⋮</span>
            </div>
          </div>
          <div className="p-3 border border-gray-300 rounded-lg flex items-center justify-between">
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-900 mb-0.5">Bank Account</div>
              <div className="text-xs text-gray-600">Bank of America Savings xxxx 9012</div>
              <div className="text-xs text-gray-500 mt-0.5">Bank of America</div>
            </div>
            <div className="h-6 w-6 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs">⋮</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Send/Request Money",
    description: "Easily send money to friends or request payments",
    page: "send-request",
    preview: (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Send/Request</h3>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">Sync</span>
            </div>
            <div className="h-8 w-32 bg-[#9D00FF] rounded flex items-center justify-center">
              <span className="text-xs text-white font-medium">+ Add</span>
            </div>
          </div>
        </div>
        <div className="h-10 w-full bg-gray-100 rounded mb-4 flex items-center px-3">
          <span className="text-xs text-gray-400">Search contacts...</span>
        </div>
        <div className="mb-4">
          <div className="text-xs font-semibold text-gray-700 mb-2">Recents</div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <div className="flex-shrink-0 w-24 h-24 bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer">
              <div className="h-10 w-10 bg-[#9D00FF] rounded-full flex items-center justify-center text-white text-xs font-semibold mb-1">
                AJ
              </div>
              <div className="text-xs font-semibold text-gray-900 text-center truncate w-full">Alice</div>
            </div>
            <div className="flex-shrink-0 w-24 h-24 bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer">
              <div className="h-10 w-10 bg-[#9D00FF] rounded-full flex items-center justify-center text-white text-xs font-semibold mb-1">
                BS
              </div>
              <div className="text-xs font-semibold text-gray-900 text-center truncate w-full">Bob</div>
            </div>
            <div className="flex-shrink-0 w-24 h-24 bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer">
              <div className="h-10 w-10 bg-[#9D00FF] rounded-full flex items-center justify-center text-white text-xs font-semibold mb-1">
                CB
              </div>
              <div className="text-xs font-semibold text-gray-900 text-center truncate w-full">Charlie</div>
            </div>
          </div>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          <div className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 cursor-pointer hover:border-[#9D00FF]">
            <div className="h-9 w-9 bg-[#9D00FF] rounded-full flex items-center justify-center text-white text-xs font-semibold">
              AJ
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">Alice Johnson</div>
              <div className="text-xs text-gray-500 truncate">alice@example.com</div>
            </div>
          </div>
          <div className="p-3 border border-gray-200 rounded-lg flex items-center gap-3 cursor-pointer hover:border-[#9D00FF]">
            <div className="h-9 w-9 bg-[#9D00FF] rounded-full flex items-center justify-center text-white text-xs font-semibold">
              BS
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm text-gray-900 truncate">Bob Smith</div>
              <div className="text-xs text-gray-500 truncate">bob@example.com</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "QR Code",
    description: "Generate your unique QR code for cash transactions",
    page: "qr-code",
    preview: (
      <div className="bg-white rounded-lg shadow-lg p-4 h-full flex flex-col items-center justify-center">
        <div className="h-24 w-24 bg-[#9D00FF] rounded-full mb-4 flex items-center justify-center text-white text-2xl font-semibold">
          JD
        </div>
        <div className="bg-white p-6 rounded-lg border-2 border-gray-300 mb-4">
          <div className="h-48 w-48 bg-white rounded flex items-center justify-center">
            <div className="grid grid-cols-8 gap-0.5 p-2">
              {Array.from({ length: 64 }).map((_, i) => {
                // Create a more structured QR-like pattern
                const row = Math.floor(i / 8)
                const col = i % 8
                const isCorner = (row < 3 && col < 3) || (row < 3 && col >= 5) || (row >= 5 && col < 3)
                const isPattern = (row + col) % 3 === 0 || (row * col) % 5 === 0
                const shouldFill = isCorner || isPattern
                return (
                  <div
                    key={i}
                    className={`h-5 w-5 ${shouldFill ? "bg-gray-900" : "bg-white"} border border-gray-200`}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="h-6 w-40 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs text-gray-600 font-semibold">John Doe</span>
        </div>
      </div>
    ),
  },
]

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000) // Change slide every 4 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#9D00FF] text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold italic">Payments</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-[#B300E6]">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-[#9D00FF] hover:bg-gray-100">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Description */}
            <div>
              <h2 className="text-5xl font-bold italic text-[#9D00FF] mb-6 text-balance">
                Track all your payments in one place
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                Payments helps you stay organized by automatically tracking all your transactions across multiple payment methods. Connect your bank accounts and credit cards to see a complete view of your spending history.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Send and receive money with friends, manage your payment methods, and keep track of every transaction—all in one simple, secure platform.
              </p>
              <div className="flex gap-4">
                <Link href="/signup">
                  <Button className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="px-8 py-6 text-lg">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side - Slideshow */}
            <div className="relative">
              <div className="bg-white rounded-xl shadow-2xl p-6 h-[500px] relative overflow-hidden">
                {/* Slide Container */}
                <div className="relative h-full">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentSlide ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {slide.preview}
                    </div>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-6 w-6 text-gray-700" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-6 w-6 text-gray-700" />
                </button>

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === currentSlide
                          ? "w-8 bg-[#9D00FF]"
                          : "w-2 bg-gray-300"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Slide Title */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
                  <h3 className="text-sm font-semibold text-gray-700">
                    {slides[currentSlide].title}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
