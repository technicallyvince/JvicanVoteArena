import React from "react"
import Link from "next/link"
import { ShieldCheck, Lock, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"

export default function AboutPage() {
  return (
    <div className="py-10 sm:py-16 min-h-screen bg-[#050608] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] h-[220px] sm:h-[350px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-6" />
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Philosophy &amp; Architecture</span>
          </div>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-black text-white tracking-tight">
            Voting should feel as easy <br className="hidden sm:inline" />
            <span className="text-[#C9A84C]">
              as discovering.
            </span>
          </h1>
          <p className="mt-4 text-xs sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            JVican Vote Arena was engineered to bring bank-grade security, instant checkout, and cryptographic transparency to pageants, awards, and student elections.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="space-y-6 sm:space-y-8">
          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/80 backdrop-blur-xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
              Why JVican Vote Arena Exists
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
              Traditional voting systems for beauty pageants, regional recognitions, and school competitions frequently suffer from opaque vote tallying, disputed outcomes, and clunky checkout forms that force voters through tedious registration hurdles.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              JVican Vote Arena was built from the ground up to solve these challenges. We separate concerns between event organizers and supporters: voters enjoy a 10-second checkout flow without passwords, while every transaction produces an immutable, publicly verifiable receipt tied directly to authoritative database records.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-8 shadow-xl">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-emerald-400 mb-5">
                <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Server-Authoritative Pricing
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All vote packages and unit prices are strictly resolved server-side. No client-side script or network interceptor can manipulate voting fees or fabricate confirmed tallies.
              </p>
            </div>

            <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-8 shadow-xl">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] mb-5">
                <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                Idempotent Webhook Security
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated with TransactPay, our processing engine guarantees that duplicate webhooks, network retries, or browser refreshes never double-count votes or distort revenues.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-12 sm:mt-16 text-center space-y-4">
          <Link href="/dashboard/events/new">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-xs sm:text-sm font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer">
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[3]" />
            </button>
          </Link>
          <p className="text-xs text-slate-500">
            Join visionary organizations hosting trusted voting events on JVican Vote Arena.
          </p>
        </div>
      </div>
    </div>
  )
}
