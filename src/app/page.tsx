"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { ArrowUpRight, ArrowRight, CheckCircle2, ShieldCheck, Trophy, Crown } from "lucide-react"

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
    <div className="flex flex-col min-h-screen bg-[#040404] text-white selection:bg-[#C9A84C] selection:text-[#040404]">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Clean, Solid High-Contrast Typography)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#040404] pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 flex flex-col items-center text-center">
        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Subtle Verified Indicator */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0c0c] px-3.5 py-1 text-xs font-semibold text-neutral-300">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
            <span>Verified Voting &amp; Instant Receipts</span>
          </div>

          {/* Main Headline — Solid White & Gold Accent, No Clip Gradients or Fake Italics */}
          <h1 className="max-w-4xl text-3xl min-[420px]:text-4xl sm:text-6xl md:text-[4.5rem] font-extrabold tracking-[-0.04em] text-white leading-[1.08] sm:leading-[1.05]">
            Make Event Voting Frictionless.{" "}
            <span className="text-[#C9A84C] block min-[480px]:inline">
              Watch Your Nominees Win.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 sm:mt-7 max-w-2xl text-sm sm:text-base md:text-lg font-normal leading-relaxed text-neutral-400 px-2">
            Run pageants, awards, and talent recognitions on an authoritative platform with instant checkout, live tallies, and automated receipts.
          </p>

          {/* Key Guarantees */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-2 text-xs text-neutral-400">
            {["TransactPay Verified", "Immutable Receipts", "Live Tallies", "Zero Duplicate Votes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 whitespace-nowrap">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                {t}
              </span>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 sm:mt-10 flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={handleCreateEventClick}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-sm font-bold text-[#040404] transition-colors hover:bg-[#D4B86A] cursor-pointer"
            >
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </button>

            <Link href="/events" className="w-full min-[480px]:w-auto">
              <button className="w-full min-[480px]:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-[#0c0c0c] px-8 py-3.5 text-sm font-semibold text-neutral-200 transition-colors hover:bg-[#161616] hover:text-white cursor-pointer">
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4 text-neutral-400" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE HIGHLIGHTS (Subdued, Clean Layout)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#040404] pt-12 sm:pt-16 pb-20 sm:pb-32 border-t border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6 sm:pb-7">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Platform Architecture
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                Engineered for speed, mathematical tally integrity, and verified payments.
              </p>
            </div>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A84C] hover:text-[#D4B86A] transition-colors shrink-0"
            >
              Read full workflow
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {/* Card 1: Live Insights */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 sm:p-7 text-white transition-colors hover:border-white/[0.16]">
              <div>
                <span className="text-xs font-semibold text-[#C9A84C] block mb-3">
                  Live Tallies
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  Authoritative public standings
                </h3>
              </div>
              <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Transform incoming votes into verifiable public receipts with zero manual intervention.
              </p>
            </div>

            {/* Card 2: Instant Checkout */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 sm:p-7 text-white transition-colors hover:border-white/[0.16]">
              <div>
                <span className="text-xs font-semibold text-[#C9A84C] block mb-3">
                  10-Second Checkout
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  Multi-channel checkout
                </h3>
              </div>
              <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Direct payments via cards, USSD, and bank transfers powered by TransactPay.
              </p>
            </div>

            {/* Card 3: Organizer Execution */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 sm:p-7 text-white transition-colors hover:border-white/[0.16]">
              <div>
                <span className="text-xs font-semibold text-[#C9A84C] block mb-3">
                  Event Studio
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  Automated management
                </h3>
              </div>
              <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Configure categories, approve contestant profiles, and manage revenue settlements in one place.
              </p>
            </div>

            {/* Card 4: Cryptographic Integrity */}
            <div className="flex flex-col justify-between rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 sm:p-7 text-white transition-colors hover:border-white/[0.16]">
              <div>
                <span className="text-xs font-semibold text-[#C9A84C] block mb-3">
                  Auditing
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                  Server-side pricing &amp; proof
                </h3>
              </div>
              <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                Strict database-backed transaction validation eliminates tampering and duplicate counts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ORGANIZER CTA (Crisp, High-Impact Editorial)
         ───────────────────────────────────────────────────────────── */}
      <section className="bg-[#040404] border-t border-white/[0.06] py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-8 sm:p-12 md:p-14 text-white">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
              <div className="flex-1 max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] block mb-2">
                  Organizer Studio
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Ready to launch your voting event?
                </h2>
                <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-lg">
                  Host beauty pageants, talent recognitions, school awards, and cultural competitions. Set up categories, add nominees, and collect verified votes in minutes.
                </p>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-400">
                  {["Free setup", "TransactPay Verified", "Live Standings", "Instant Receipts"].map((f) => (
                    <span key={f} className="flex items-center gap-1.5 whitespace-nowrap">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-stretch gap-3 w-full lg:w-auto lg:min-w-[220px]">
                <button
                  onClick={handleCreateEventClick}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-sm font-bold text-[#040404] hover:bg-[#D4B86A] transition-colors cursor-pointer"
                >
                  <span>Create an Event</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </button>
                <Link
                  href="/login"
                  className="w-full text-center text-xs font-semibold text-neutral-400 hover:text-white transition-colors py-1.5"
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
