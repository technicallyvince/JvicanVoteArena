import React from "react"
import Link from "next/link"
import { Users, Trophy, ArrowUpRight } from "lucide-react"

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

export default function HowItWorksPage() {
  return (
    <div className="py-12 sm:py-20 min-h-screen bg-[#080808] relative overflow-hidden pt-24 sm:pt-28">
      {/* Glow flares */}
      <div className="absolute top-1/6 left-1/4 w-[500px] h-[300px] bg-[#ff5500]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-3 backdrop-blur-md">
            <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
            <span>Architecture &amp; Workflow</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            How JVican Vote Arena Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 leading-relaxed">
            A transparent dual-track platform built for friction-free voter participation and bank-grade event management for organizers.
          </p>
        </div>

        {/* TRACK 1: FOR VOTERS */}
        <div className="mb-16 rounded-[28px] border border-white/[0.08] bg-[#121212] p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5500] text-white font-bold shadow-lg shadow-[#ff5500]/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                For Voters &amp; Supporters
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Zero account registration • 10-second checkout flow • Verified instant receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-[#ff5500] mb-2 font-mono">01. DISCOVER</div>
              <h3 className="text-base font-bold text-white mb-1.5">Browse &amp; Select</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Open an event link from WhatsApp or Instagram, or browse the public event catalogue to locate your candidate.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-[#ff5500] mb-2 font-mono">02. BUNDLE</div>
              <h3 className="text-base font-bold text-white mb-1.5">Choose Vote Package</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Select quick packages (1, 5, 10, 20, 50, 100 votes) or type a custom number with real-time price calculations.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-[#ff5500] mb-2 font-mono">03. CHECKOUT</div>
              <h3 className="text-base font-bold text-white mb-1.5">Pay with TransactPay</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Enter your email address and complete payment securely via credit/debit card, bank transfer, or USSD.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-emerald-400 mb-2 font-mono">04. RECEIPT</div>
              <h3 className="text-base font-bold text-white mb-1.5">Instant Verification</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your votes are recorded authoritatively. You receive a cryptographic receipt with a permanent verification URL.
              </p>
            </div>
          </div>
        </div>

        {/* TRACK 2: FOR ORGANIZERS */}
        <div className="rounded-[28px] border border-[#ff5500]/20 bg-gradient-to-b from-[#141414] to-[#0d0d0d] text-white p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">For Event Organizers</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Setup in 3 minutes • Live revenue analytics • Automated bank payouts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-[#ff5500] mb-2 font-mono">01. EVENT SETUP</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Create &amp; Brand</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Upload your event banner, specify categories, add candidates, and set your authoritative price per vote.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-[#ff5500] mb-2 font-mono">02. ENGAGEMENT</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Share &amp; Mobilize</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Each candidate receives a dedicated short link and QR-ready profile for WhatsApp groups and Instagram stories.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900/80 p-6 border border-white/[0.06]">
              <div className="text-xs font-bold text-emerald-400 mb-2 font-mono">03. MONITOR &amp; PAYOUT</div>
              <h3 className="text-base font-bold mb-1.5 text-white">Live Cockpit &amp; Revenue</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Watch real-time leaderboards, download audited CSV transactions, and receive automated TransactPay disbursements.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-neutral-400">
              Ready to create your first voting event?
            </span>
            <Link href="/create-event">
              <button className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer">
                <span>Launch Event</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
