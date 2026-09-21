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
  isLoading: boolean
  login: (email: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
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
      }
    } catch {}
    setIsLoading(false)
  }, [])

  const login = (email: string) => {
    const mockUser: AuthUser = {
      id: "11111111-1111-1111-1111-111111111111",
      email: email || "organizer@igbetitourism.org",
      name: email.split("@")[0] || "Organizer",
      role: "organizer",
    }
    setUser(mockUser)
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser))
    } catch {}
  }

  const logout = () => {
    setUser(null)
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
