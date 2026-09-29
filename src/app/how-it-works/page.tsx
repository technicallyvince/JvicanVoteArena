import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Users, Trophy, ArrowUpRight, Sparkles, ShieldCheck, CheckCircle2, Lock } from "lucide-react"

export const metadata: Metadata = {
  title: "How It Works — Frictionless Voting & Event Studio",
  description:
    "Learn how JVican Vote Arena empowers voters with 10-second instant checkout and certified receipts, while offering organizers real-time analytics and automated settlement.",
  openGraph: {
    title: "How JVican Vote Arena Works | Transparent Voting Architecture",
    description: "Zero voter registration, verified receipts, and bank-grade event management.",
  },
}

export default function HowItWorksPage() {
  return (
    <div className="py-10 sm:py-16 min-h-screen bg-[#050608] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      {/* Glow flares */}
      <div className="absolute top-1/6 left-1/4 w-[320px] sm:w-[500px] h-[220px] sm:h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Architecture &amp; Workflow</span>
          </div>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-black text-white tracking-tight">
            How JVican Vote Arena Works
          </h1>
          <p className="mt-4 text-xs sm:text-base text-slate-400 leading-relaxed">
            A transparent dual-track platform built for friction-free voter participation and bank-grade event management for organizers.
          </p>
        </div>

        {/* TRACK 1: FOR VOTERS */}
        <div className="mb-12 sm:mb-16 rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#C9A84C] text-[#0a0c14] font-black shadow-lg shadow-[#C9A84C]/20">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                For Voters &amp; Supporters
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Zero account registration • 10-second checkout flow • Verified instant receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-[#C9A84C] mb-2 font-mono">01. DISCOVER</div>
              <h3 className="text-base font-bold text-white mb-1.5">Browse &amp; Select</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open an event link from social channels or explore the public event marketplace to find your favorite nominee.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-[#C9A84C] mb-2 font-mono">02. BUNDLE</div>
              <h3 className="text-base font-bold text-white mb-1.5">Choose Vote Package</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Select preconfigured packages (10, 25, 50, 100, 250, 500 votes) or enter a custom quantity (minimum 10 votes / ₦1,000) with instant total calculation.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-[#C9A84C] mb-2 font-mono">03. REVIEW &amp; PAY</div>
              <h3 className="text-base font-bold text-white mb-1.5">Review &amp; Checkout</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Review your event, nominee, and price breakdown before completing payment securely via TransactPay gateway.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-emerald-400 mb-2 font-mono">04. RECEIPT</div>
              <h3 className="text-base font-bold text-white mb-1.5">Instant Verification</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Votes are recorded authoritatively in the ledger with a cryptographic receipt and verifiable public proof.
              </p>
            </div>
          </div>
        </div>

        {/* TRACK 2: FOR ORGANIZERS */}
        <div className="rounded-3xl border border-[#C9A84C]/20 bg-gradient-to-b from-[#0e1018] to-[#0a0c14] text-white p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/90">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-[#C9A84C] text-[#0a0c14] font-black shadow-md shadow-[#C9A84C]/25">
              <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">For Event Organizers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Setup in 3 minutes • Live revenue analytics • Automated settlement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-[#C9A84C] mb-2 font-mono">01. EVENT SETUP</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Create &amp; Brand</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your event banner, configure categories, enroll nominees, and set your authoritative price per vote.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-[#C9A84C] mb-2 font-mono">02. ENGAGEMENT</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Share &amp; Mobilize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each nominee receives a dedicated short link and QR-ready profile for WhatsApp groups and Instagram stories.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.05]">
              <div className="text-xs font-bold text-emerald-400 mb-2 font-mono">03. MONITOR &amp; PAYOUT</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Event Studio &amp; Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch real-time standings, download audited CSV transactions, and manage all settings from Event Studio.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400 text-center sm:text-left">
              Ready to create your first voting event?
            </span>
            <Link href="/dashboard/events/new" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-3 text-xs font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer">
                <span>Launch Event</span>
                <ArrowUpRight className="h-4 w-4 stroke-[3]" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
