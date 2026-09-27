"use client"

import React, { createContext, useContext } from "react"
import { useSession, signIn, signOut, SessionProvider } from "next-auth/react"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "organizer" | "admin"
}

interface AuthContextType {
  user: AuthUser | null
  session: any | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isOrganizer: boolean
  isLoading: boolean
  requestOtp: (email: string, password?: string, type?: "login" | "signup", name?: string) => Promise<{ success: boolean; message: string; devOtp?: string }>
  loginWithOtp: (email: string, password: string, otp: string) => Promise<{ success: boolean; message: string }>
  signupWithOtp: (name: string, email: string, password: string, otp: string) => Promise<{ success: boolean; message: string }>
  changeAdminPassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isOrganizer: false,
  isLoading: true,
  requestOtp: async () => ({ success: false, message: "" }),
  loginWithOtp: async () => ({ success: false, message: "" }),
  signupWithOtp: async () => ({ success: false, message: "" }),
  changeAdminPassword: async () => ({ success: false, message: "" }),
  logout: async () => {},
})

function AuthContextProviderInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"

  const user: AuthUser | null = session?.user
    ? {
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || "",
        role: ((session.user as any).role as "organizer" | "admin") || "organizer",
      }
    : null

  const isAuthenticated = !!user
  const isSuperAdmin = user?.role === "admin"
  const isOrganizer = user?.role === "organizer"

  const requestOtp = async (
    email: string,
    password?: string,
    type: "login" | "signup" = "login",
    name?: string
  ) => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, type, name }),
      })
      const data = await res.json()
      return data
    } catch (err) {
      return { success: false, message: "Network error sending OTP code." }
    }
  }

  const loginWithOtp = async (email: string, password: string, otp: string) => {
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        otp,
      })

      if (res?.error) {
        return { success: false, message: res.error || "Authentication failed." }
      }

      return { success: true, message: "Signed in successfully!" }
    } catch (err: any) {
      return { success: false, message: err?.message || "Login failed." }
    }
  }

  const signupWithOtp = async (name: string, email: string, password: string, otp: string) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      })
      const data = await res.json()
      return data
    } catch (err) {
      return { success: false, message: "Network error during registration." }
    }
  }

  const changeAdminPassword = async (oldPassword: string, newPassword: string) => {
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      })
      const data = await res.json()
      return data
    } catch (err) {
      return { success: false, message: "Network error updating password." }
    }
  }

  const logout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        isSuperAdmin,
        isOrganizer,
        isLoading,
        requestOtp,
        loginWithOtp,
        signupWithOtp,
        changeAdminPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProviderInner>{children}</AuthContextProviderInner>
    </SessionProvider>
  )
}

export const useAuth = () => useContext(AuthContext)
