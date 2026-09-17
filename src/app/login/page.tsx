"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trophy, Lock, Mail, ArrowRight, User, ShieldCheck, Vote } from "lucide-react"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
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
    <div className="flex min-h-[80vh] items-center justify-center p-4 bg-[#fafafa] dark:bg-[#090d16]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-4" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            JVican Vote Arena
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Organizer Portal — Welcome back
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Sign in to manage your competitions, candidates, and TransactPay payouts.
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
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-blue-600" />
              <span>Remember this device</span>
            </label>
            <a href="#" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center font-extrabold text-sm shadow-md shadow-blue-500/20 rounded-2xl py-3.5 mt-2"
          >
            Sign In to Dashboard
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </form>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 dark:border-slate-800">
          <p>
            Looking to host a contest?{" "}
            <Link href="/create-contest" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Create a Contest
            </Link>
          </p>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-850 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Voters do not need an account to vote.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
