"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Mail, ArrowRight, ShieldCheck, ArrowLeft, RefreshCw } from "lucide-react"
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
  const { requestOtp, loginWithOtp } = useAuth()
  
  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null)

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const res = await requestOtp(email, password, "login")
    setIsLoading(false)

    if (res.success) {
      setStep("otp")
      if (res.devOtp) setDevOtpHint(res.devOtp)
    } else {
      setError(res.message)
    }
  }

  const handleVerifyAndLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const res = await loginWithOtp(email, password, otp)
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
          {step === "credentials" ? "Sign In to Continue" : "Enter Verification Code"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {step === "credentials"
            ? "Organizer account required to create and manage events."
            : `Enter the 6-digit code sent to ${email}`}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      {devOtpHint && (
        <div className="mb-4 p-2.5 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] flex items-center justify-between">
          <span>Dev code: <strong>{devOtpHint}</strong></span>
          <button
            type="button"
            onClick={() => setOtp(devOtpHint)}
            className="text-[10px] uppercase font-bold underline cursor-pointer"
          >
            Fill OTP
          </button>
        </div>
      )}

      {step === "credentials" ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
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
            <span>{isLoading ? "Verifying..." : "Continue to OTP"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyAndLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 text-center">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              required
              autoFocus
              className="w-full text-center tracking-[0.4em] font-mono text-base bg-[#0a0c14] border border-[#C9A84C]/40 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-[#C9A84C]"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setStep("credentials")}
              className="flex items-center gap-1 text-slate-400 hover:text-white cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleRequestOtp}
              disabled={isLoading}
              className="flex items-center gap-1 text-[#C9A84C] hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-3.5 px-6 font-extrabold text-xs text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 hover:bg-[#D4B86A] transition-all cursor-pointer mt-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
          >
            <span>{isLoading ? "Signing In..." : "Verify & Continue"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

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
