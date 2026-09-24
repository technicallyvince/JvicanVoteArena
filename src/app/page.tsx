"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { ObsidianDomeWave } from "@/components/obsidian/ObsidianDomeWave"
import { ArrowUpRight, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Trophy, Vote, Crown } from "lucide-react"

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
    <div className="flex flex-col min-h-screen bg-[#050608] text-white selection:bg-[#C9A84C] selection:text-[#050608]">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#050608] pt-28 sm:pt-36 md:pt-40 pb-0 flex flex-col items-center text-center">
        {/* Layered ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Primary gold crown glow */}
          <div className="absolute left-1/2 -top-32 h-[450px] sm:h-[600px] w-[600px] sm:w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#C9A84C]/10 via-[#C9A84C]/04 to-transparent blur-[120px] sm:blur-[160px]" />
          {/* Deep atmosphere */}
          <div className="absolute left-1/2 top-20 h-[300px] sm:h-[400px] w-[400px] sm:w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#C9A84C]/05 to-transparent blur-[80px] sm:blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Floating Pill Badge */}
          <div className="animate-float mb-6 sm:mb-8 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/08 px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold text-[#D4B86A] backdrop-blur-xl shadow-lg shadow-[#C9A84C]/10 max-w-full">
            <Crown className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
            <span className="text-slate-300 truncate">Premier Voting Platform</span>
            <span className="text-white/15">·</span>
            <span className="text-[#C9A84C] font-bold shrink-0">100% Verified</span>
          </div>

          {/* Main Headline */}
          <h1 className="max-w-4xl text-3xl min-[420px]:text-4xl sm:text-6xl md:text-[4.5rem] font-black tracking-[-0.04em] text-white leading-[1.08] sm:leading-[1.05]">
            Make Event Voting{" "}
            <span className="relative inline-block">
              Frictionless
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
            </span>
            {" "}& Watch{" "}
            <span className="text-gold-gradient font-extrabold italic block min-[480px]:inline">
              Your Nominees Shine.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-7 max-w-2xl text-sm sm:text-base md:text-lg font-normal leading-relaxed text-slate-400 px-2">
            Effortlessly run pageants, awards, and talent recognitions on a modern platform with instant checkout, live cryptographic tallies, and automated receipts.
          </p>

          {/* Trust indicators */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-[11px] sm:text-xs text-slate-500 px-2">
            {["TransactPay Secured", "Idempotent Receipts", "Live Leaderboards", "Zero Duplicate Votes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="h-3 w-3 text-[#C9A84C]/70 shrink-0" />
                {t}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-9 flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={handleCreateEventClick}
              className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#C9A84C] px-7 sm:px-8 py-3.5 text-sm font-extrabold text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 transition-all duration-200 hover:scale-105 hover:bg-[#D4B86A] hover:shadow-xl hover:shadow-[#C9A84C]/35 cursor-pointer active:scale-98 btn-shimmer"
            >
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3]" />
            </button>

            <Link href="/events" className="w-full min-[480px]:w-auto">
              <button className="w-full min-[480px]:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-7 sm:px-8 py-3.5 text-sm font-semibold text-neutral-300 backdrop-blur-xl transition-all duration-200 hover:bg-white/[0.07] hover:border-[#C9A84C]/20 hover:text-white cursor-pointer">
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4 text-slate-500" />
              </button>
            </Link>
          </div>
        </div>

        {/* 3D Glowing Dome Matrix Canvas */}
        <div className="relative mt-8 sm:mt-10 w-full max-w-6xl h-[190px] min-[480px]:h-[240px] sm:h-[340px] pointer-events-none">
          <ObsidianDomeWave className="h-full w-full" glowColor="#C9A84C" />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE HIGHLIGHT — Premium Bento Grid
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#050608] pt-12 sm:pt-16 pb-20 sm:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6 sm:pb-7">
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 shrink-0 mt-0.5 sm:mt-0">
                <Trophy className="h-4.5 w-4.5 text-[#C9A84C]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-100">
                  Everything you need to run a premium voting event
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">Real-time, verified, and fully automated</p>
              </div>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A84C] hover:text-[#D4B86A] transition-colors shrink-0"
            >
              How it works
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Bento Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Live Insights */}
            <div className="group flex flex-col justify-between rounded-3xl bg-[#0a0c14] border border-[#C9A84C]/15 p-6 sm:p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A84C]/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9),0_0_30px_-6px_rgba(201,168,76,0.10)] shadow-2xl shadow-black/60">
              <div>
                <div className="inline-block rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/08 px-3 py-1 text-[11px] font-bold text-[#C9A84C]">
                  Real-time Insights
                </div>
                <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  Auditable <br className="hidden sm:inline" />
                  <span className="text-gold-gradient">live standings</span>
                </h3>
              </div>
              <p className="mt-6 sm:mt-8 text-xs font-medium text-slate-400 leading-relaxed">
                Transform live voting numbers into real-time auditable receipts with zero manual reconciliation.
              </p>
            </div>

            {/* Card 2: Instant Checkout */}
            <div className="group flex flex-col justify-between rounded-3xl bg-[#0a0c14] border border-emerald-500/15 p-6 sm:p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9),0_0_30px_-6px_rgba(16,185,129,0.08)] shadow-2xl shadow-black/60">
              <div>
                <div className="inline-block rounded-full border border-emerald-500/25 bg-emerald-500/08 px-3 py-1 text-[11px] font-bold text-emerald-400">
                  TransactPay Direct
                </div>
                <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  Instant voter <br className="hidden sm:inline" />
                  <span className="text-emerald-400">checkout</span>
                </h3>
              </div>
              <p className="mt-6 sm:mt-8 text-xs text-slate-400 leading-relaxed">
                Seamless multi-channel payment with card, USSD, and transfer via authoritative pricing and zero double-counting.
              </p>
            </div>

            {/* Card 3: Gold Accent — Automation */}
            <div className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#C9A84C] via-[#B8922E] to-[#7A5C1E] p-6 sm:p-7 text-[#0a0c14] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#C9A84C]/25 shadow-2xl shadow-[#C9A84C]/10 overflow-hidden">
              {/* Internal shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
              <div>
                <div className="inline-block rounded-full border border-black/20 bg-black/15 px-3 py-1 text-[11px] font-black text-[#0a0c14]">
                  Automation
                </div>
                <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-black tracking-tight text-[#0a0c14] leading-snug">
                  Smarter event <br className="hidden sm:inline" />
                  <span>execution</span>
                </h3>
              </div>
              <p className="mt-6 sm:mt-8 text-xs font-bold text-[#0a0c14]/80 leading-relaxed">
                Automate categories, nominee registration, real-time leaderboard reveals, and payout workflows.
              </p>
            </div>

            {/* Card 4: Cryptographic Integrity */}
            <div className="group flex flex-col justify-between rounded-3xl bg-[#0a0c14] border border-white/[0.06] p-6 sm:p-7 text-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A84C]/20 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.9)] shadow-2xl shadow-black/60">
              <div>
                <div className="inline-block rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-slate-400">
                  Cryptographic Integrity
                </div>
                <h3 className="mt-6 sm:mt-8 text-xl sm:text-2xl font-bold tracking-tight text-neutral-200 leading-snug">
                  Deliver results <br className="hidden sm:inline" />
                  <span className="text-gold-gradient">with precision</span>
                </h3>
              </div>
              <div className="mt-6 sm:mt-8 flex items-center gap-2 text-sm font-black text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span className="tracking-tight text-neutral-200">JVican Vote Arena</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ORGANIZER CTA
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#050608] border-t border-white/[0.05] pb-20 sm:pb-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/12 bg-gradient-to-b from-[#0e1018] via-[#0a0c14] to-[#050608] p-6 sm:p-12 md:p-14 text-white shadow-2xl shadow-black/80">
            {/* Corner glow accents */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#C9A84C]/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-[#C9A84C]/05 blur-[80px]" />
            {/* Top gold line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/40 to-transparent" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
              <div className="flex-1 max-w-2xl">
                <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/08 px-3.5 py-1 text-xs font-bold text-[#C9A84C]">
                  <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
                  Event Creation Studio
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Ready to launch your own <br className="hidden sm:inline" />
                  <span className="text-gold-gradient">voting event?</span>
                </h2>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg">
                  Host beauty pageants, talent recognitions, school awards, and cultural competitions. Set up categories, add nominees, and collect verified votes in minutes.
                </p>
                <div className="mt-5 flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 text-xs text-slate-400">
                  {["Free to set up", "TransactPay Verified", "Live Standings", "Instant Receipts"].map((f) => (
                    <span key={f} className="flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto lg:min-w-[220px]">
                <button
                  onClick={handleCreateEventClick}
                  className="relative w-full inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-[#C9A84C] px-8 py-3.5 sm:py-4 text-sm font-extrabold text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 hover:bg-[#D4B86A] hover:shadow-xl hover:shadow-[#C9A84C]/35 transition-all hover:scale-[1.02] cursor-pointer active:scale-98 btn-shimmer"
                >
                  <span>Create an Event</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[3]" />
                </button>
                <Link
                  href="/login"
                  className="w-full text-center text-xs font-semibold text-slate-500 hover:text-[#C9A84C] transition-colors py-1.5"
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
