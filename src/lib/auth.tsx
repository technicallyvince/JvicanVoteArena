"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: "organizer" | "admin"
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isOrganizer: boolean
  isLoading: boolean
  login: (email: string, role?: "organizer" | "admin") => void
  switchRole: (role: "organizer" | "admin") => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isSuperAdmin: false,
  isOrganizer: false,
  isLoading: true,
  login: () => {},
  switchRole: () => {},
  logout: () => {},
})

const AUTH_STORAGE_KEY = "jvican_auth_user"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY)
      if (stored) {
        setUser(JSON.parse(stored))
      } else {
        // Default to organizer session so demo works smoothly out of the box
        const defaultUser: AuthUser = {
          id: "11111111-1111-1111-1111-111111111111",
          email: "organizer@igbetitourism.org",
          name: "Igbeti Tourism Board",
          role: "organizer",
        }
        setUser(defaultUser)
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(defaultUser))
      }
    } catch {}
    setIsLoading(false)
  }, [])

  const login = (email: string, role: "organizer" | "admin" = "organizer") => {
    const isAdmin = role === "admin" || email.includes("admin@jvican") || email.includes("superadmin")
    const mockUser: AuthUser = {
      id: isAdmin ? "admin-0000-0000-0000-000000000000" : "11111111-1111-1111-1111-111111111111",
      email: email || (isAdmin ? "admin@jvican.com" : "organizer@igbetitourism.org"),
      name: isAdmin ? "Chief Executive Super Admin" : email.split("@")[0] || "Organizer",
      role: isAdmin ? "admin" : "organizer",
    }
    setUser(mockUser)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser))
    } catch {}
  }

  const switchRole = (role: "organizer" | "admin") => {
    if (role === "admin") {
      login("admin@jvican.com", "admin")
    } else {
      login("organizer@igbetitourism.org", "organizer")
    }
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
  }

  const isSuperAdmin = user?.role === "admin"
  const isOrganizer = user?.role === "organizer"

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isSuperAdmin,
        isOrganizer,
        isLoading,
        login,
        switchRole,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
