"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { Modal } from "@/components/ui/Modal"
import { useAuth } from "@/lib/auth"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  redirectTo?: string
}

export function AuthModal({
  isOpen,
  onClose,
  redirectTo = "/create-event",
}: AuthModalProps) {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("organizer@igbetitourism.org")
  const [password, setPassword] = useState("••••••••")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate organizer login and redirect to target page
    setTimeout(() => {
      login(email)
      setIsLoading(false)
      onClose()
      router.push(redirectTo)
    }, 600)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="text-center mb-6 flex flex-col items-center">
        <BrandLogo size="md" className="mb-3" />
        <h2 className="text-xl font-black text-white tracking-tight">
          Sign In to Continue
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Organizer account required to create and manage events.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 text-neutral-400 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-neutral-700 bg-neutral-900 text-[#ff5500] focus:ring-[#ff5500]" />
            <span>Remember me</span>
          </label>
          <a href="#" className="font-bold text-[#ff5500] hover:text-[#ff6b1a]">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3.5 px-6 font-bold text-xs text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer mt-2"
        >
          <span>{isLoading ? "Signing in..." : "Sign In & Continue"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-neutral-400">
        <div className="rounded-2xl bg-neutral-900 p-2.5 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 border border-white/5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#ff5500]" />
          <span>Voters do not need an account to vote.</span>
        </div>
      </div>
    </Modal>
  )
}
