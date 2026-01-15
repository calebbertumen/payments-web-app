"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

export default function EmailPasswordPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "john.doe@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [originalData, setOriginalData] = useState({ ...formData })

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        email: session.user.email || "",
      }))
    }
  }, [session])

  const handleEdit = () => {
    setOriginalData({ ...formData })
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Save to API
    toast.success("Email updated successfully")
  }

  const handleCancel = () => {
    setFormData({ ...originalData })
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("Please fill in all password fields")
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (formData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsChangingPassword(true)
    try {
      // TODO: Call API to change password
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API call
      toast.success("Password changed successfully")
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast.error("Failed to change password")
      console.error("Error changing password:", error)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Email & Password</h2>

        {/* Email Section */}
        <div className="space-y-6">
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
          <div className="flex gap-4">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white px-8">
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" className="px-8 bg-transparent">
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white px-8">
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Password Section */}
        <div className="space-y-6 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <Input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                className="h-12"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <Input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                className="h-12"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <Input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="h-12"
                placeholder="Confirm new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
            >
              {isChangingPassword ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

