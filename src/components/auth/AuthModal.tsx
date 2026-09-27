"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck } from "lucide-react"
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

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const res = await login(email, password)
    setIsLoading(false)

    if (res.success) {
      onClose()
      router.push(redirectTo)
    } else {
      setError(res.message)
    }
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

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0a0c14] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0c14] border border-white/10 rounded-xl pl-4 pr-11 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C9A84C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-3.5 px-6 font-extrabold text-xs text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 hover:bg-[#D4B86A] transition-all cursor-pointer mt-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
          >
            <span>{isLoading ? "Signing In..." : "Sign In"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

      <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-neutral-400 space-y-2">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" onClick={onClose} className="text-[#C9A84C] font-bold hover:underline">
            Sign up
          </Link>
        </p>
        <div className="rounded-2xl bg-neutral-900 p-2.5 text-[11px] text-neutral-400 flex items-center justify-center gap-1.5 border border-white/5">
          <ShieldCheck className="h-3.5 w-3.5 text-[#C9A84C]" />
          <span>Voters do not need an account to vote.</span>
        </div>
      </div>
    </Modal>
  )
}
