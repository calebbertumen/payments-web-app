"use client"

import { Camera } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function PersonalInfoPage() {
  const { data: session, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdatingImage, setIsUpdatingImage] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    phone: "(555) 123-4567",
    imageUrl: "",
  })
  const [originalData, setOriginalData] = useState({ ...formData })

  useEffect(() => {
    if (session?.user) {
      const nameParts = session.user.name?.split(" ") || []
      setFormData((prev) => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        imageUrl: session.user.image || "",
      }))
    }
  }, [session])

  // Get first initial + last initial
  const getNameInitials = (name: string): string => {
    const parts = name.trim().split(" ").filter(Boolean)
    if (parts.length === 0) return "U"
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const userInitials = session?.user?.name 
    ? getNameInitials(session.user.name)
    : "U"

  const handleEdit = () => {
    setOriginalData({ ...formData })
    setIsEditing(true)
  }

  const handleSave = () => {
    setIsEditing(false)
    // TODO: Save to API
    toast.success("Personal information updated successfully")
  }

  const handleCancel = () => {
    setFormData({ ...originalData })
    setIsEditing(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpdate = async () => {
    if (!formData.imageUrl) {
      toast.error("Please enter an image URL")
      return
    }

    setIsUpdatingImage(true)
    try {
      const response = await fetch("/api/profile/image", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: formData.imageUrl }),
      })

      if (!response.ok) {
        throw new Error("Failed to update image")
      }

      await update() // Refresh session
      toast.success("Profile picture updated successfully")
    } catch (error) {
      toast.error("Failed to update profile picture")
      console.error("Error updating image:", error)
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete account")
      }

      toast.success("Account deleted successfully")
      // Sign out and redirect to login
      await signOut({ callbackUrl: "/login" })
    } catch (error) {
      toast.error("Failed to delete account")
      console.error("Error deleting account:", error)
      setIsDeleteDialogOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold">Personal Information</h2>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-gray-300">
              <AvatarImage src={formData.imageUrl || session?.user?.image} alt="Profile" />
              <AvatarFallback className="bg-[#9D00FF] text-white text-4xl font-semibold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute bottom-0 right-0 bg-[#9D00FF] rounded-full p-2 border-4 border-white cursor-pointer hover:bg-[#7A00CC]">
                <Camera className="h-5 w-5 text-white" />
              </div>
            )}
          </div>
          {isEditing && (
            <div className="w-full max-w-md space-y-2">
              <label className="block text-sm font-medium">Profile Picture URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  onClick={handleImageUpdate}
                  disabled={isUpdatingImage}
                  className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white"
                >
                  {isUpdatingImage ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          )}
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
        </div>

        <div className="flex justify-center gap-4 pt-6">
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
            <>
              <Button onClick={handleEdit} className="bg-[#9D00FF] hover:bg-[#7A00CC] text-white px-8">
                Edit
              </Button>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="px-8 bg-transparent border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700">
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete your account? This action cannot be undone. All your data, including transactions, payment methods, and account information will be permanently deleted.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? "Deleting..." : "Delete Account"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

