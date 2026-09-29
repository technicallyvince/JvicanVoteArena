import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Lock, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"

export const metadata: Metadata = {
  title: "About JVican Vote Arena — Philosophy & Trust Architecture",
  description:
    "Discover the engineering, security principles, and transparency standards behind JVican Vote Arena's verified multi-contest voting ecosystem.",
  openGraph: {
    title: "About JVican Vote Arena — Verified Voting Ecosystem",
    description: "Built for trust, cryptographic verification, and instant voter participation.",
  },
}

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-16 min-h-screen bg-[#040404] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#040404]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-6" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] mb-2">
            Philosophy &amp; Architecture
          </span>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Voting should feel as easy <br className="hidden sm:inline" />
            <span className="text-[#C9A84C]">
              as discovering.
            </span>
          </h1>
          <p className="mt-4 text-xs sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            JVican Vote Arena was engineered to bring bank-grade security, instant checkout, and cryptographic transparency to pageants, awards, and student elections.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-10 lg:p-12">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Why JVican Vote Arena Exists
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-4">
              Traditional voting systems for beauty pageants, regional recognitions, and school competitions frequently suffer from opaque vote tallying, disputed outcomes, and clunky checkout forms that force voters through tedious registration hurdles.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              JVican Vote Arena was built from the ground up to solve these challenges. We separate concerns between event organizers and supporters: voters enjoy a 10-second checkout flow without passwords, while every transaction produces an immutable, publicly verifiable receipt tied directly to authoritative database records.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] border border-white/[0.08] text-[#C9A84C] mb-5">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Server-Authoritative Pricing
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                All vote packages and unit prices are strictly resolved server-side. No client-side script or network interceptor can manipulate voting fees or fabricate confirmed tallies.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#141414] border border-white/[0.08] text-[#C9A84C] mb-5">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Idempotent Webhook Security
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Our cryptographic processing engine guarantees that duplicate webhooks, network retries, or browser refreshes never double-count votes or distort revenues.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 sm:mt-16 text-center space-y-4">
          <Link href="/dashboard/events/new">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#040404] hover:bg-[#D4B86A] transition-colors cursor-pointer">
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </Link>
          <p className="text-xs text-neutral-500">
            Join visionary organizations hosting trusted voting events on JVican Vote Arena.
          </p>
        </div>
      </div>
    </div>
  )
}
