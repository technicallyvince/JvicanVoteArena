"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, ShieldCheck, ShieldAlert, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { useAuth } from "@/lib/auth"

export default function SignupPage() {
  const router = useRouter()
  const { signup, isAuthenticated } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!name.trim()) {
      setErrorMessage("Please enter your full name or organization name.")
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please fill in all fields.")
      return
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.")
      return
    }

    setIsLoading(true)

    const result = await signup(email, password, name)

    if (result.success) {
      if (result.message.includes("check your email")) {
        setSuccessMessage(result.message)
      } else {
        router.push("/dashboard")
      }
    } else {
      setErrorMessage(result.message)
    }

    setIsLoading(false)
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-[#050608] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      {/* Background glow flares */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-10 shadow-2xl shadow-black/90 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-6 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-4" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs font-bold text-[#C9A84C] mt-1">
            Organizer Registration
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sign up to create and manage voting events on JVican Vote Arena.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label="Full Name / Organization"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Media Group / John Doe"
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {/* Password with show/hide toggle */}
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-3 pr-12 text-sm text-white transition-all duration-150 placeholder:text-neutral-500 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#C9A84C] transition-colors cursor-pointer p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password with show/hide toggle */}
            <div className="w-full space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#121212] px-4 py-3 pr-12 text-sm text-white transition-all duration-150 placeholder:text-neutral-500 focus:border-[#C9A84C] focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#C9A84C] transition-colors cursor-pointer p-1"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-3.5 px-6 font-black text-xs sm:text-sm text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isLoading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-400">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#C9A84C] hover:text-[#D4B86A]">
              Sign In
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
