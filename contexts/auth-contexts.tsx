"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  title?: string
  bio?: string
  role: "user" | "admin"
  subscriptionPlan: "free" | "premium"
  subscriptionStatus: "active" | "inactive" | "trial"
  trialEndsAt?: Date
  billingInfo?: {
    address: string
    city: string
    country: string
    postalCode: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  showAuthModal: boolean
  authTriggerReason: string
  setShowAuthModal: (show: boolean, reason?: string) => void
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  updateAvatar: (imageUrl: string) => Promise<void>
  updateSubscription: (plan: "free" | "premium") => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModalState] = useState(false)
  const [authTriggerReason, setAuthTriggerReason] = useState("")

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, this would be an API call to validate the session
        const storedUser = localStorage.getItem("codefusion_user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const setShowAuthModal = (show: boolean, reason = "") => {
    setShowAuthModalState(show)
    if (show && reason) {
      setAuthTriggerReason(reason)
    } else {
      setAuthTriggerReason("")
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data - in a real app, this would come from your backend
      const mockUser: User = {
        id: "1",
        name: "John Doe",
        email,
        avatar: "/placeholder.svg?height=200&width=200",
        phone: "+1 (555) 123-4567",
        title: "Software Developer",
        bio: "Passionate about building great software and solving complex problems.",
        role: "user",
        subscriptionPlan: "free",
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      setUser(mockUser)
      localStorage.setItem("codefusion_user", JSON.stringify(mockUser))
      setShowAuthModal(false)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      const mockUser: User = {
        id: "1",
        name,
        email,
        role: "user",
        subscriptionPlan: "free",
        subscriptionStatus: "trial",
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }

      setUser(mockUser)
      localStorage.setItem("codefusion_user", JSON.stringify(mockUser))
      setShowAuthModal(false)
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("codefusion_user")
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      // In a real app, this would send a password reset email
    } catch (error) {
      console.error("Password reset error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Profile update error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateAvatar = async (imageUrl: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedUser = { ...user, avatar: imageUrl }
        setUser(updatedUser)
        localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Avatar update error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateSubscription = async (plan: "free" | "premium") => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (user) {
        const updatedUser = {
          ...user,
          subscriptionPlan: plan,
          subscriptionStatus: "active",
          // If upgrading to premium, remove trial end date
          ...(plan === "premium" && { trialEndsAt: undefined }),
        }
        setUser(updatedUser)
        localStorage.setItem("codefusion_user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error("Subscription update error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    showAuthModal,
    authTriggerReason,
    setShowAuthModal,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    updateAvatar,
    updateSubscription,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

