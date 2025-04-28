"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Camera, X, Check, SettingsIcon, LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import AppLayout from "@/components/app-layout"
import { useRequireAuth } from "@/hooks/use-require-auth"
import ReactCrop, { type Crop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, updateAvatar, logout } = useAuth()
  const { requireAuth } = useRequireAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
  })
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Avatar upload state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        title: user.title || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  // If no user, show loading or redirect
  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!requireAuth("saving profile changes")) {
      return
    }

    setIsSubmitting(true)

    try {
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        title: formData.title,
        bio: formData.bio,
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!requireAuth("changing your avatar")) {
      return
    }

    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setUploadedImage(reader.result as string)
      setAvatarDialogOpen(true)
    }
    reader.readAsDataURL(file)

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const getCroppedImage = useCallback(() => {
    if (!imageRef.current || !crop.width || !crop.height) {
      return null
    }

    const canvas = document.createElement("canvas")
    const scaleX = imageRef.current.naturalWidth / imageRef.current.width
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height

    const pixelRatio = window.devicePixelRatio
    canvas.width = crop.width * scaleX * pixelRatio
    canvas.height = crop.height * scaleY * pixelRatio

    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = "high"

    ctx.drawImage(
      imageRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9)
    setCroppedImageUrl(dataUrl)
    return dataUrl
  }, [crop.width, crop.height, crop.x, crop.y, imageRef])

  const handleSaveAvatar = async () => {
    if (!requireAuth("saving your avatar")) {
      return
    }

    const croppedImageUrlToSave = getCroppedImage()
    if (!croppedImageUrlToSave) return

    setIsSubmitting(true)

    try {
      await updateAvatar(croppedImageUrlToSave)

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
        variant: "default",
      })

      setAvatarDialogOpen(false)
      setUploadedImage(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem updating your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!requireAuth("removing your avatar")) {
      return
    }

    setIsSubmitting(true)
    try {
      await updateAvatar("")
      toast({
        title: "Avatar removed",
        description: "Your avatar has been removed successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem removing your avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNavigateToSettings = () => {
    if (!requireAuth("accessing settings")) {
      return
    }
    router.push("/settings")
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    router.push("/login")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      variant: "default",
    })
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and account settings</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleNavigateToSettings} className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>
                  Update your profile picture. This will be displayed on your profile and in comments.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-background">
                    <AvatarImage src={user.avatar || "/placeholder.svg?height=96&width=96"} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer p-2 rounded-full bg-background/20 hover:bg-background/40 transition-colors"
                    >
                      <Camera className="h-5 w-5 text-white" />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" asChild>
                    <label htmlFor="avatar-upload-btn" className="cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      Change Avatar
                      <input
                        id="avatar-upload-btn"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleAvatarUpload}
                      />
                    </label>
                  </Button>

                  {user.avatar && (
                    <Button
                      variant="outline"
                      className="text-destructive hover:text-destructive"
                      onClick={handleRemoveAvatar}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <X className="mr-2 h-4 w-4" />
                      )}
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information. This information will be displayed publicly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone || ""}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Role/Title</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title || ""}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        placeholder="Software Developer"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      name="bio"
                      value={formData.bio || ""}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      placeholder="Tell us about yourself"
                    />
                    <p className="text-sm text-muted-foreground">Brief description for your profile.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (user) {
                        setFormData({
                          name: user.name,
                          email: user.email,
                          phone: user.phone || "",
                          title: user.title || "",
                          bio: user.bio || "",
                        })
                      }
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user?.name ? user.name.toLowerCase().replace(/\s+/g, ".") : ""}
                    disabled
                  />
                  <p className="text-sm text-muted-foreground">
                    Your username is automatically generated from your name.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-type">Account Type</Label>
                  <Input
                    id="account-type"
                    value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subscription">Subscription Plan</Label>
                  <Input
                    id="subscription"
                    value={
                      user?.subscriptionPlan
                        ? `${user.subscriptionPlan.charAt(0).toUpperCase() + user.subscriptionPlan.slice(1)} (${user.subscriptionStatus})`
                        : "Free"
                    }
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-created">Account Created</Label>
                  <Input id="account-created" value={new Date().toLocaleDateString()} disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border border-destructive/50 p-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-medium">Delete Account</h3>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all of your content. This action cannot be undone.
                    </p>
                    <div className="mt-2">
                      <Button variant="destructive" onClick={() => requireAuth("deleting your account")}>
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Avatar Crop Dialog */}
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crop Avatar</DialogTitle>
              <DialogDescription>
                Adjust the crop area to select the portion of the image you want to use as your avatar.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 max-h-[60vh] overflow-hidden">
              {uploadedImage && (
                <ReactCrop crop={crop} onChange={(c) => setCrop(c)} circularCrop aspect={1}>
                  <img
                    ref={imageRef}
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Avatar preview"
                    className="max-w-full max-h-[50vh] object-contain"
                    crossOrigin="anonymous"
                  />
                </ReactCrop>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setAvatarDialogOpen(false)
                  setUploadedImage(null)
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
              <AlertDialogDescription>
                You will need to sign in again to access your account and premium features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}

