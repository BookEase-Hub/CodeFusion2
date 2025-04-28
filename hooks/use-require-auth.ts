"use client"

import { useAuth } from "@/contexts/auth-context"

export function useRequireAuth() {
  const { isAuthenticated, setShowAuthModal } = useAuth()

  const requireAuth = (feature = "") => {
    if (!isAuthenticated) {
      let reason = "Please sign in or create an account to access this feature."

      if (feature) {
        reason = `Please sign in or create an account to access ${feature}.`
      }

      setShowAuthModal(true, reason)
      return false
    }
    return true
  }

  return { requireAuth }
}

