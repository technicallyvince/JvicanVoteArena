"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { ObsidianDomeWave } from "@/components/obsidian/ObsidianDomeWave"
import { ArrowUpRight, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

// Minimalist Asterisk Star icon matching the reference design top-left logo & badges
function AsteriskStar({ className = "h-5 w-5", color = "#ff5500" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2V22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 12H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 19.07L19.07 4.93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authRedirect, setAuthRedirect] = useState("/create-event")
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleCreateEventClick = () => {
    if (isAuthenticated) {
      router.push("/create-event")
    } else {
      setAuthRedirect("/create-event")
      setIsAuthModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#080808] text-white selection:bg-[#ff5500] selection:text-black">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — Inspired by the Futuristic Minimalist Dark Layout
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#080808] pt-28 sm:pt-36 pb-6 flex flex-col items-center text-center">

        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -top-28 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#ff5500]/12 via-[#ff8c42]/5 to-transparent blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">

          {/* Pill Badge matching the design's rounded capsule style */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-[#141414]/90 px-4 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-xl">
            <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
            <span className="text-neutral-400">Next-Gen Voting</span>
            <span className="text-white/20">·</span>
            <span className="text-[#ff5500] font-semibold">100% Auditable</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-[4.5rem] font-bold tracking-[-0.04em] text-white leading-[1.05]">
            Make Event Voting Frictionless &amp; Watch{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b1a] via-[#ff5500] to-[#ff8c42] font-extrabold italic">
              Your Nominees Shine.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-neutral-400">
            Effortlessly run pageants, awards, and talent recognitions on a modern platform with instant checkout, live cryptographic tallies, and automated receipts.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleCreateEventClick}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff5500]/25 transition-all duration-200 hover:scale-105 hover:bg-[#ff661a] cursor-pointer active:scale-98"
            >
              <span>Create Event Free</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </button>

            <Link href="/events">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-neutral-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] hover:border-white/30 cursor-pointer">
                <span>Browse Events</span>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>
            </Link>
          </div>
        </div>

        {/* 3D Glowing Dome Matrix Canvas in Warm Ember Orange */}
        <div className="relative mt-8 w-full max-w-6xl h-[240px] sm:h-[340px] pointer-events-none">
          <ObsidianDomeWave className="h-full w-full" glowColor="#ff5500" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE HIGHLIGHT SECTION — Minimalist Asymmetric Card Grid
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#080808] pt-12 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Section banner with Asterisk Accent */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-3">
              <AsteriskStar className="h-6 w-6" color="#ff5500" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-200">
                Automate voting events with real-time optimization &amp; verified receipts
              </h2>
            </div>
          </div>

          {/* Cards Grid Inspired by the Presentation Design Spec */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Card 1: Crisp Clean White High-Contrast Card */}
            <div className="flex flex-col justify-between rounded-[28px] bg-[#ffffff] p-7 text-neutral-900 transition-transform duration-300 hover:-translate-y-1 shadow-2xl">
              <div>
                <div className="inline-block rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-semibold text-neutral-700">
                  Insights
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-neutral-900 leading-snug">
                  Data-driven <br />
                  <span className="text-[#ff5500]">decisions</span>
                </h3>
              </div>
              <p className="mt-8 text-xs font-medium text-neutral-600 leading-relaxed">
                Transform live voting numbers into real-time auditable receipts with zero manual reconciliation.
              </p>
            </div>

            {/* Card 2: Warm Frosted AI Automation Card */}
            <div className="flex flex-col justify-between rounded-[28px] bg-[#1a1512] border border-[#ff5500]/20 p-7 text-neutral-100 transition-transform duration-300 hover:-translate-y-1 shadow-xl">
              <div>
                <div className="inline-block rounded-full border border-[#ff5500]/40 bg-[#ff5500]/10 px-3 py-1 text-[11px] font-semibold text-[#ff8c42]">
                  Verification
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-white leading-snug">
                  Instant voter <br />
                  <span className="text-neutral-300">checkout</span>
                </h3>
              </div>
              <p className="mt-8 text-xs text-neutral-400 leading-relaxed">
                Seamless multi-channel payment with card, USSD, and transfer via TransactPay encryption.
              </p>
            </div>

            {/* Card 3: Solid Vivid Ember Orange Accent Card */}
            <div className="flex flex-col justify-between rounded-[28px] bg-gradient-to-br from-[#ff5500] to-[#e64a00] p-7 text-white transition-transform duration-300 hover:-translate-y-1 shadow-2xl shadow-[#ff5500]/20">
              <div>
                <div className="inline-block rounded-full border border-white/40 bg-white/15 px-3 py-1 text-[11px] font-semibold text-white">
                  Automation
                </div>
                <h3 className="mt-8 text-2xl font-extrabold tracking-tight text-white leading-snug">
                  Smarter event <br />
                  <span>execution</span>
                </h3>
              </div>
              <p className="mt-8 text-xs font-medium text-white/90 leading-relaxed">
                Automate categories, contender registration, real-time leaderboard reveals, and payout workflows.
              </p>
            </div>

            {/* Card 4: Sleek Dark Monolith with Brand Badge */}
            <div className="flex flex-col justify-between rounded-[28px] bg-[#111111] border border-white/[0.08] p-7 text-white transition-transform duration-300 hover:-translate-y-1 shadow-xl">
              <div>
                <div className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-neutral-400">
                  Integrity
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-neutral-200 leading-snug">
                  Deliver results <br />
                  <span className="text-[#ff5500]">with precision</span>
                </h3>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-black text-white">
                <AsteriskStar className="h-5 w-5" color="#ff5500" />
                <span className="tracking-tight text-neutral-200">JVican Arena</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ORGANIZER CTA — Pure Clean Minimalist Container
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#080808] border-t border-white/[0.06] pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.10] bg-gradient-to-b from-[#121212] via-[#0f0f0f] to-[#080808] p-8 sm:p-14 text-white shadow-2xl">

            {/* Glowing Accent */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#ff5500]/15 blur-[90px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="flex-1 max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold text-[#ff5500]">
                  <Sparkles className="h-3.5 w-3.5 text-[#ff5500]" />
                  Event Creator Studio
                </div>
                <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                  Ready to launch your own <br />
                  <span className="text-[#ff5500]">voting event?</span>
                </h2>
                <p className="mt-4 text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Host beauty pageants, talent recognitions, school awards, and leadership polls. Set up categories, add nominees, and collect verified votes in minutes.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-neutral-300">
                  {["Free to set up", "TransactPay Verified", "Live Standings", "Instant Receipts"].map((f) => (
                    <span key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#ff5500] shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto lg:min-w-[220px]">
                <button
                  onClick={handleCreateEventClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all hover:scale-[1.02] cursor-pointer active:scale-98"
                >
                  <span>Create Event Free</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </button>
                <Link
                  href="/login"
                  className="w-full text-center text-xs font-semibold text-neutral-500 hover:text-[#ff5500] transition-colors py-2"
                >
                  Existing Organizer? Sign In →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo={authRedirect}
      />
    </div>
  )
}
