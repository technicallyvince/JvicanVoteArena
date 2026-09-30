"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { ArrowUpRight, ArrowRight, CheckCircle2, ShieldCheck, Trophy, Crown, Zap, BarChart3, CreditCard, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

/* ─────────────────────────────────────────────────────────────
   SKELETON LOADER — shown during initial hydration
   Uses pure CSS shimmer, no layout shift
   ───────────────────────────────────────────────────────────── */
function HeroSkeleton() {
  return (
    <div className="flex flex-col min-h-screen bg-[#040404] text-white" aria-hidden="true">
      <section className="relative overflow-hidden pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 flex flex-col items-center text-center px-4">
        <div className="mx-auto max-w-5xl w-full flex flex-col items-center gap-6">
          {/* Badge skeleton */}
          <div className="h-7 w-64 rounded-full skeleton-shimmer" />
          {/* Headline skeleton */}
          <div className="space-y-3 w-full max-w-3xl">
            <div className="h-10 sm:h-14 w-full rounded-2xl skeleton-shimmer" />
            <div className="h-10 sm:h-14 w-3/4 mx-auto rounded-2xl skeleton-shimmer" />
          </div>
          {/* Subtitle skeleton */}
          <div className="space-y-2 w-full max-w-2xl">
            <div className="h-4 w-full rounded-xl skeleton-shimmer" />
            <div className="h-4 w-5/6 mx-auto rounded-xl skeleton-shimmer" />
          </div>
          {/* Guarantees skeleton */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-5 w-32 rounded-full skeleton-shimmer" />
            ))}
          </div>
          {/* CTA skeleton */}
          <div className="flex flex-col min-[480px]:flex-row items-center gap-3 mt-4">
            <div className="h-12 w-44 rounded-full skeleton-shimmer" />
            <div className="h-12 w-40 rounded-full skeleton-shimmer" />
          </div>
        </div>
      </section>

      {/* Feature cards skeleton */}
      <section className="pt-12 pb-20 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 space-y-2">
            <div className="h-7 w-56 rounded-xl skeleton-shimmer" />
            <div className="h-4 w-80 rounded-lg skeleton-shimmer" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a] p-7 space-y-4">
                <div className="h-10 w-10 rounded-xl skeleton-shimmer" />
                <div className="h-4 w-20 rounded-lg skeleton-shimmer" />
                <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
                <div className="space-y-1.5 pt-4">
                  <div className="h-3 w-full rounded skeleton-shimmer" />
                  <div className="h-3 w-5/6 rounded skeleton-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SCROLL REVEAL HOOK — IntersectionObserver, fires once per element
   ───────────────────────────────────────────────────────────── */
function useScrollReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced-motion preference
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (!motionOk) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

/* ─────────────────────────────────────────────────────────────
   FEATURE CARD DATA
   ───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: BarChart3,
    label: "Live Tallies",
    title: "Authoritative public standings",
    description: "Transform incoming votes into verifiable public receipts with zero manual intervention.",
  },
  {
    icon: CreditCard,
    label: "10-Second Checkout",
    title: "Multi-channel checkout",
    description: "Direct payments via cards, USSD, and bank transfers with instant verification.",
  },
  {
    icon: Zap,
    label: "Event Studio",
    title: "Automated management",
    description: "Configure categories, approve contestant profiles, and manage revenue settlements in one place.",
  },
  {
    icon: Lock,
    label: "Auditing",
    title: "Server-side pricing & proof",
    description: "Strict database-backed transaction validation eliminates tampering and duplicate counts.",
  },
] as const

/* ─────────────────────────────────────────────────────────────
   MAIN HOMEPAGE COMPONENT
   ───────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authRedirect, setAuthRedirect] = useState("/dashboard/events/new")
  const [hydrated, setHydrated] = useState(false)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Scroll-reveal refs for each section
  const featuresSection = useScrollReveal<HTMLElement>(0.1)
  const ctaSection = useScrollReveal<HTMLElement>(0.15)

  useEffect(() => {
    // Mark hydration complete after a single frame to ensure paint
    const id = requestAnimationFrame(() => setHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const handleCreateEventClick = useCallback(() => {
    if (isAuthenticated) {
      router.push("/dashboard/events/new")
    } else {
      setAuthRedirect("/dashboard/events/new")
      setIsAuthModalOpen(true)
    }
  }, [isAuthenticated, router])

  // Full content rendered immediately on server and hydrated seamlessly
  return (
    <div className="flex flex-col min-h-screen bg-[#040404] text-white selection:bg-[#C9A84C] selection:text-[#040404]">

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION — Dramatic radial glow, staggered reveal
         ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#040404] pt-28 sm:pt-36 md:pt-40 pb-16 sm:pb-24 flex flex-col items-center text-center">

        {/* Background radial glow — GPU-composited */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="hero-glow absolute left-1/2 top-[-5%] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-radial from-[#C9A84C]/[0.12] via-[#C9A84C]/[0.04] to-transparent blur-[100px]" />
          <div className="hero-glow-secondary absolute left-1/2 top-[10%] h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-radial from-[#D4B86A]/[0.06] to-transparent blur-[80px]" />
        </div>

        {/* Floating decorative particles — pure CSS */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="particle particle-1" />
          <div className="particle particle-2" />
          <div className="particle particle-3" />
          <div className="particle particle-4" />
          <div className="particle particle-5" />
        </div>

        {/* Subtle grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex flex-col items-center">

          {/* Verified Badge — stagger delay 0 */}
          <div className="hero-reveal hero-reveal-1 mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-neutral-300 shadow-lg shadow-black/20">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
            <span>Verified Voting & Instant Receipts</span>
          </div>

          {/* Main Headline — stagger delay 1 */}
          <h1 className="hero-reveal hero-reveal-2 max-w-4xl text-3xl min-[420px]:text-4xl sm:text-6xl md:text-[4.5rem] font-extrabold tracking-[-0.04em] text-white leading-[1.08] sm:leading-[1.05]">
            Make Event Voting Frictionless.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A84C] via-[#D4B86A] to-[#C9A84C] block min-[480px]:inline">
              Watch Your Nominees Win.
            </span>
          </h1>

          {/* Subtitle — stagger delay 2 */}
          <p className="hero-reveal hero-reveal-3 mt-5 sm:mt-7 max-w-2xl text-sm sm:text-base md:text-lg font-normal leading-relaxed text-neutral-400 px-2">
            Run pageants, awards, and talent recognitions on an authoritative platform with instant checkout, live tallies, and automated receipts.
          </p>

          {/* Key Guarantees — stagger delay 3 */}
          <div className="hero-reveal hero-reveal-4 mt-6 flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-7 gap-y-2 text-xs text-neutral-400">
            {["Securely Encrypted", "Immutable Receipts", "Live Tallies", "Zero Duplicate Votes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5 whitespace-nowrap transition-colors duration-200 hover:text-neutral-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#C9A84C] shrink-0" />
                {t}
              </span>
            ))}
          </div>

          {/* Action CTAs — stagger delay 4 */}
          <div className="hero-reveal hero-reveal-5 mt-8 sm:mt-10 flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={handleCreateEventClick}
              className="group/cta inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-sm font-bold text-[#040404] transition-all duration-300 hover:bg-[#D4B86A] hover:shadow-[0_0_30px_rgba(201,168,76,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-0.5" />
            </button>

            <Link href="/events" className="w-full min-[480px]:w-auto">
              <button className="group/explore w-full min-[480px]:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-[#0c0c0c]/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-neutral-200 transition-all duration-300 hover:bg-[#161616] hover:text-white hover:border-white/[0.2] cursor-pointer">
                <span>Explore Events</span>
                <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform duration-300 group-hover/explore:translate-x-1" />
              </button>
            </Link>
          </div>

          {/* Trust indicator — stagger delay 5 */}
          <div className="hero-reveal hero-reveal-6 mt-10 sm:mt-14 flex items-center gap-3 text-[11px] text-neutral-500">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-7 w-7 rounded-full border-2 border-[#040404] bg-gradient-to-br from-neutral-700 to-neutral-800 flex items-center justify-center text-[9px] font-bold text-neutral-400"
                >
                  {["JV", "AO", "NK", "TB"][i]}
                </div>
              ))}
            </div>
            <span className="leading-tight">
              <span className="text-neutral-400 font-medium">Trusted by organizers</span> across 20+ events
            </span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE HIGHLIGHTS — Scroll-reveal with stagger
         ───────────────────────────────────────────────────────────── */}
      <section
        ref={featuresSection.ref}
        className="bg-[#040404] pt-12 sm:pt-16 pb-20 sm:pb-32 border-t border-white/[0.06]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div
            className={cn(
              "mb-10 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.06] pb-6 sm:pb-7 transition-all duration-700",
              featuresSection.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-6"
            )}
          >
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
              className="group/link inline-flex items-center gap-1.5 text-xs font-semibold text-[#C9A84C] hover:text-[#D4B86A] transition-colors shrink-0"
            >
              Read full workflow
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.label}
                  className={cn(
                    "group/card flex flex-col justify-between rounded-2xl bg-[#0a0a0a] border border-white/[0.08] p-6 sm:p-7 text-white transition-all duration-500 hover:border-[#C9A84C]/30 hover:bg-[#0d0d0d]",
                    featuresSection.isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  )}
                  style={{
                    transitionDelay: featuresSection.isVisible ? `${150 + idx * 100}ms` : "0ms",
                  }}
                >
                  <div>
                    {/* Icon */}
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 transition-colors duration-300 group-hover/card:bg-[#C9A84C]/15">
                      <Icon className="h-5 w-5 text-[#C9A84C]" />
                    </div>
                    <span className="text-xs font-semibold text-[#C9A84C] block mb-3">
                      {feature.label}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="mt-6 text-xs text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ORGANIZER CTA — Scroll-reveal
         ───────────────────────────────────────────────────────────── */}
      <section
        ref={ctaSection.ref}
        className="bg-[#040404] border-t border-white/[0.06] py-16 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-8 sm:p-12 md:p-14 text-white transition-all duration-700",
              ctaSection.isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            )}
          >
            {/* CTA section background glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-gradient-radial from-[#C9A84C]/[0.06] to-transparent blur-[80px]" aria-hidden="true" />

            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 sm:gap-10">
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
                  {["Free setup", "Instant Verification", "Live Standings", "Certified Receipts"].map((f) => (
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
                  className="group/cta2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-sm font-bold text-[#040404] hover:bg-[#D4B86A] hover:shadow-[0_0_30px_rgba(201,168,76,0.25)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <span>Create an Event</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5] transition-transform duration-300 group-hover/cta2:translate-x-0.5 group-hover/cta2:-translate-y-0.5" />
                </button>
                <Link
                  href="/login"
                  className="w-full text-center text-xs font-semibold text-neutral-400 hover:text-white transition-colors duration-200 py-1.5"
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
