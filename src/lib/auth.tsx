"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "organizer" | "admin"
}

interface AuthContextType {
  user: AuthUser | null
  supabaseUser: User | null
  session: Session | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isOrganizer: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; message: string }>
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  session: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isOrganizer: false,
  isLoading: true,
  login: async () => ({ success: false, message: "" }),
  signup: async () => ({ success: false, message: "" }),
  changeAdminPassword: async () => ({ success: false, message: "" }),
  logout: async () => {},
})

// Super Admin emails list
const SUPER_ADMIN_EMAILS = [
  "admin@jvican.com",
  "admin@voteflow.live",
  "jvicanadmin@gmail.com",
]

function mapSupabaseUser(supaUser: User): AuthUser {
  const email = supaUser.email || ""
  const isAdminByEmail = SUPER_ADMIN_EMAILS.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  ) || email.toLowerCase().startsWith("admin@")
  const isAdminByMetadata = supaUser.user_metadata?.role === "admin"
  const isAdmin = isAdminByEmail || isAdminByMetadata

  return {
    id: supaUser.id,
    email,
    name: supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || email.split("@")[0] || "User",
    role: isAdmin ? "admin" : "organizer",
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = getSupabaseBrowserClient()

  const handleSession = useCallback((sess: Session | null) => {
    setSession(sess)
    if (sess?.user) {
      const mapped = mapSupabaseUser(sess.user)
      setUser(mapped)
      setSupabaseUser(sess.user)
    } else {
      setUser(null)
      setSupabaseUser(null)
    }
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleSession(initialSession)
      setIsLoading(false)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      handleSession(newSession)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, handleSession])

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      if (data.session) {
        handleSession(data.session)
        return { success: true, message: "Signed in successfully!" }
      }

      return { success: false, message: "No session returned. Please try again." }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      return { success: false, message }
    }
  }

  const signup = async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        return { success: false, message: error.message }
      }

      // If email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          message: "Account created! Please check your email to confirm your registration.",
        }
      }

      // If auto-confirmed
      if (data.session) {
        handleSession(data.session)
        return { success: true, message: "Account created and signed in!" }
      }

      return { success: true, message: "Account created successfully." }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      return { success: false, message }
    }
  }

  const changeAdminPassword = async (
    _oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: "New password must be at least 6 characters long.",
      }
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        return { success: false, message: error.message }
      }

      return { success: true, message: "Password updated successfully!" }
    } catch {
      return { success: false, message: "Failed to update password." }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSupabaseUser(null)
    setSession(null)
  }

  const isSuperAdmin = user?.role === "admin"
  const isOrganizer = user?.role === "organizer"

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isAuthenticated: !!user,
        isSuperAdmin,
        isOrganizer,
        isLoading,
        login,
        signup,
        changeAdminPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
