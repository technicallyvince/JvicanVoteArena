"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { BrandLogo } from "@/components/ui/BrandLogo"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("organizer@igbetitourism.org")
  const [password, setPassword] = useState("••••••••")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate organizer authentication session and redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard")
    }, 600)
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-[#050608] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      {/* Background glow flares */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-10 shadow-2xl shadow-black/90 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            JVican Vote Arena
          </h1>
          <p className="text-xs font-bold text-[#C9A84C] mt-1">
            Organizer Portal — Welcome back
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sign in to manage your events, nominees, and TransactPay payouts.
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
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-neutral-700 bg-neutral-900 text-[#C9A84C] focus:ring-[#C9A84C]" />
              <span>Remember this device</span>
            </label>
            <a href="#" className="font-bold text-[#C9A84C] hover:text-[#D4B86A]">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-3.5 px-6 font-black text-xs sm:text-sm text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer mt-2"
          >
            <span>{isLoading ? "Signing in..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          <p>
            Looking to host an event?{" "}
            <Link href="/dashboard/events/new" className="font-bold text-[#C9A84C] hover:text-[#D4B86A]">
              Create an Event
            </Link>
          </p>
          <div className="mt-4 rounded-2xl bg-[#0e1018] p-3 text-[11px] text-slate-400 flex items-center justify-center gap-1.5 border border-white/5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Voters do not need an account to vote.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
