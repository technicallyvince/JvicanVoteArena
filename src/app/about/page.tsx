import React from "react"
import Link from "next/link"
import { ShieldCheck, Lock, ArrowRight, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"

function AsteriskStar({ className = "h-4 w-4", color = "#ff5500" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2V22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 12H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 19.07L19.07 4.93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 min-h-screen bg-[#080808] relative overflow-hidden pt-24 sm:pt-28">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#ff5500]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-6" />
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-3 backdrop-blur-md">
            <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
            <span>Philosophy &amp; Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Voting should feel as easy <br className="hidden sm:inline" />
            <span className="text-[#ff5500]">
              as discovering.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            JVican Vote Arena was engineered to bring bank-grade security, instant checkout, and cryptographic transparency to pageants, awards, and student elections.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="space-y-8">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">
              Why JVican Vote Arena Exists
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-4">
              Traditional voting systems for beauty pageants, regional recognitions, and school competitions frequently suffer from opaque vote tallying, disputed outcomes, and clunky checkout forms that force voters through tedious registration hurdles.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              JVican Vote Arena was built from the ground up to solve these challenges. We separate concerns between event organizers and supporters: voters enjoy a 10-second checkout flow without passwords, while every transaction produces an immutable, publicly verifiable receipt tied directly to authoritative database records.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-[#ff5500] mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Server-Authoritative Pricing
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                All vote packages and unit prices are strictly resolved server-side. No client-side script or network interceptor can manipulate voting fees or fabricate confirmed tallies.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-8 shadow-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5500]/10 border border-[#ff5500]/20 text-[#ff5500] mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Idempotent Webhook Security
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Integrated with TransactPay, our processing engine guarantees that duplicate webhooks, network retries, or browser refreshes never double-count votes or distort revenues.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center space-y-4">
          <Link href="/create-event">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer">
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4" />
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
