import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-purple-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold italic">Payments</h1>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-purple-600">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-purple-700 hover:bg-gray-100">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-bold italic text-purple-700 mb-6 text-balance">
                Never lose track of what you paid for.
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Just link your card or bank account and you are ready to track all of your payments. Simple as that.
              </p>
            </div>
            <div>
              <Image
                src="/hands-typing-on-laptop.jpg"
                alt="Person using laptop"
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
