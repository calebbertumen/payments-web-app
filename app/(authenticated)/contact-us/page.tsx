"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ContactUsPage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    comment: "",
  })

  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || []
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: session.user.email || "",
      }))
    }
  }, [session])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.comment) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      toast.success("Message sent successfully! We'll get back to you soon.")
      
      // Reset form
      setFormData((prev) => ({
        ...prev,
        comment: "",
      }))
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message. Please try again later.")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side - Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-6">Contact Us</h1>
            <p className="text-gray-700 leading-relaxed text-lg">
              We're here to help! If you have any concerns, feedback, questions, or other comments, 
              please don't hesitate to reach out to us. Our team is committed to providing excellent 
              support and addressing any issues you may have. Fill out the form to the right, and 
              we'll get back to you as soon as possible.
            </p>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleChange("comment", e.target.value)}
                placeholder="Enter your message here..."
                rows={8}
                required
                className="resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
            >
              SEND MESSAGE
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

