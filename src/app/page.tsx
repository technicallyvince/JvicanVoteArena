"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { ObsidianDomeWave } from "@/components/obsidian/ObsidianDomeWave"
import { ArrowUpRight, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Trophy, Vote } from "lucide-react"

export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authRedirect, setAuthRedirect] = useState("/dashboard/events/new")
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleCreateEventClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard/events/new")
    } else {
      setAuthRedirect("/dashboard/events/new")
      setIsAuthModalOpen(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#06080e] text-white selection:bg-[#f59e0b] selection:text-black">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — Obsidian Dark Design
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#06080e] pt-28 sm:pt-36 pb-6 flex flex-col items-center text-center">
        {/* Subtle Ambient Radial Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 -top-28 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/12 via-amber-600/5 to-transparent blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Pill Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-300">Next-Gen Voting Platform</span>
            <span className="text-white/20">·</span>
            <span className="text-amber-400 font-bold">100% Verified</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-[4.5rem] font-black tracking-[-0.04em] text-white leading-[1.05]">
            Make Event Voting Frictionless &amp; Watch{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 font-extrabold italic">
              Your Nominees Shine.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 max-w-2xl text-base sm:text-lg font-normal leading-relaxed text-slate-300">
            Effortlessly run pageants, awards, and talent recognitions on a modern platform with instant checkout, live cryptographic tallies, and automated receipts.
          </p>

          {/* Action Buttons */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleCreateEventClick}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3.5 text-sm font-black text-neutral-950 shadow-lg shadow-amber-500/25 transition-all duration-200 hover:scale-105 hover:bg-amber-400 cursor-pointer active:scale-98"
            >
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3]" />
            </button>

            <Link href="/events">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-neutral-200 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.08] hover:border-white/30 cursor-pointer">
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            </Link>
          </div>
        </div>

        {/* 3D Glowing Dome Matrix Canvas in Amber Glow */}
        <div className="relative mt-8 w-full max-w-6xl h-[240px] sm:h-[340px] pointer-events-none">
          <ObsidianDomeWave className="h-full w-full" glowColor="#f59e0b" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE HIGHLIGHT SECTION — Obsidian Card Grid
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#06080e] pt-12 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section banner */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-200">
                Automate voting events with real-time optimization &amp; verified receipts
              </h2>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Warm Soft Tinted Insight Card */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#0c101b]/95 border border-amber-500/20 p-7 text-white transition-transform duration-300 hover:-translate-y-1 shadow-2xl">
              <div>
                <div className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400">
                  Real-time Insights
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-white leading-snug">
                  Auditable <br />
                  <span className="text-amber-400">live standings</span>
                </h3>
              </div>
              <p className="mt-8 text-xs font-medium text-slate-300 leading-relaxed">
                Transform live voting numbers into real-time auditable receipts with zero manual reconciliation.
              </p>
            </div>

            {/* Card 2: Instant Voter Checkout Card */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#0c101b]/95 border border-emerald-500/20 p-7 text-white transition-transform duration-300 hover:-translate-y-1 shadow-xl">
              <div>
                <div className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                  TransactPay Direct
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-white leading-snug">
                  Instant voter <br />
                  <span className="text-emerald-400">checkout</span>
                </h3>
              </div>
              <p className="mt-8 text-xs text-slate-400 leading-relaxed">
                Seamless multi-channel payment with card, USSD, and transfer via authoritative pricing and zero double-counting.
              </p>
            </div>

            {/* Card 3: Solid Amber Gradient Accent Card */}
            <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 p-7 text-neutral-950 transition-transform duration-300 hover:-translate-y-1 shadow-2xl shadow-amber-500/20">
              <div>
                <div className="inline-block rounded-full border border-black/20 bg-black/10 px-3 py-1 text-[11px] font-black text-neutral-950">
                  Automation
                </div>
                <h3 className="mt-8 text-2xl font-black tracking-tight text-neutral-950 leading-snug">
                  Smarter event <br />
                  <span>execution</span>
                </h3>
              </div>
              <p className="mt-8 text-xs font-bold text-neutral-900/90 leading-relaxed">
                Automate categories, nominee registration, real-time leaderboard reveals, and payout workflows.
              </p>
            </div>

            {/* Card 4: Sleek Dark Monolith */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#0c101b]/95 border border-white/[0.08] p-7 text-white transition-transform duration-300 hover:-translate-y-1 shadow-xl">
              <div>
                <div className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-slate-400">
                  Cryptographic Integrity
                </div>
                <h3 className="mt-8 text-2xl font-bold tracking-tight text-neutral-200 leading-snug">
                  Deliver results <br />
                  <span className="text-amber-400">with precision</span>
                </h3>
              </div>
              <div className="mt-8 flex items-center gap-2 text-sm font-black text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="tracking-tight text-neutral-200">JVican Vote Arena</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ORGANIZER CTA
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#06080e] border-t border-white/[0.06] pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-gradient-to-b from-[#121827] via-[#0c101b] to-[#06080e] p-8 sm:p-14 text-white shadow-2xl">
            {/* Glowing Accent */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-amber-500/15 blur-[90px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="flex-1 max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  Event Creation Studio
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Ready to launch your own <br />
                  <span className="text-amber-400">voting event?</span>
                </h2>
                <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-lg">
                  Host beauty pageants, talent recognitions, school awards, and cultural competitions. Set up categories, add nominees, and collect verified votes in minutes.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-300">
                  {["Free to set up", "TransactPay Verified", "Live Standings", "Instant Receipts"].map((f) => (
                    <span key={f} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto lg:min-w-[220px]">
                <button
                  onClick={handleCreateEventClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-sm font-black text-neutral-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all hover:scale-[1.02] cursor-pointer active:scale-98"
                >
                  <span>Create an Event</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[3]" />
                </button>
                <Link
                  href="/login"
                  className="w-full text-center text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors py-2"
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
