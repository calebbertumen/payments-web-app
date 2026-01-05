"use client"

import { User } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    phone: "(555) 123-4567",
    email: "john.doe@example.com",
    streetAddress: "123 Main St",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    country: "United States",
    zipCode: "10001",
  })
  const [originalData, setOriginalData] = useState({ ...formData })

  const handleEdit = () => {
    setOriginalData({ ...formData })
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({ ...originalData })
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Personal Information</h2>

        {/* Profile Avatar */}
        <div className="flex justify-center">
          <Avatar className="h-32 w-32 border-4 border-gray-300">
            <AvatarFallback className="bg-white">
              <User className="h-16 w-16 text-gray-400" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">First Name</label>
              {isEditing ? (
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  className="h-12"
                />
              ) : (
                <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.firstName}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Last Name</label>
              {isEditing ? (
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  className="h-12"
                />
              ) : (
                <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.lastName}</div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Phone #</label>
              {isEditing ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="h-12"
                />
              ) : (
                <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="h-12"
                />
              ) : (
                <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.email}</div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-xl font-bold mb-6">Address</h3>
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  {isEditing ? (
                    <Input
                      value={formData.streetAddress}
                      onChange={(e) => handleChange("streetAddress", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.streetAddress}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Address Line 2</label>
                  {isEditing ? (
                    <Input
                      value={formData.addressLine2}
                      onChange={(e) => handleChange("addressLine2", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.addressLine2}</div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  {isEditing ? (
                    <Input
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.city}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  {isEditing ? (
                    <Input
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.state}</div>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Country</label>
                  {isEditing ? (
                    <Input
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.country}</div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Zip Code/Postal Code</label>
                  {isEditing ? (
                    <Input
                      value={formData.zipCode}
                      onChange={(e) => handleChange("zipCode", e.target.value)}
                      className="h-12"
                    />
                  ) : (
                    <div className="bg-gray-200 rounded-md h-12 flex items-center px-4">{formData.zipCode}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 pt-6">
          {isEditing ? (
            <>
              <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
                Save
              </Button>
              <Button onClick={handleCancel} variant="outline" className="px-8 bg-transparent">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit} className="bg-purple-600 hover:bg-purple-700 text-white px-8">
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
