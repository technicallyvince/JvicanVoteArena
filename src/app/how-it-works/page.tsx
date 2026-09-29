import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Users, Trophy, ArrowUpRight, CheckCircle2 } from "lucide-react"

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
    <div className="py-10 sm:py-16 min-h-screen bg-[#040404] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#040404]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] block mb-2">
            Architecture &amp; Workflow
          </span>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            How JVican Vote Arena Works
          </h1>
          <p className="mt-4 text-xs sm:text-base text-neutral-400 leading-relaxed">
            A dual-track platform built for friction-free voter participation and bank-grade event management for organizers.
          </p>
        </div>

        {/* TRACK 1: FOR VOTERS */}
        <div className="mb-12 sm:mb-16 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C] text-[#040404] font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                For Voters &amp; Supporters
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Zero account registration • 10-second checkout flow • Verified instant receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 1</span>
              <h3 className="text-base font-bold text-white mb-1.5">Browse &amp; Select</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Open a direct link or explore the public marketplace to find your favorite nominee.
              </p>
            </div>

            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 2</span>
              <h3 className="text-base font-bold text-white mb-1.5">Choose Vote Package</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Select preconfigured packages or enter a custom quantity (minimum 10 votes / ₦1,000).
              </p>
            </div>

            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 3</span>
              <h3 className="text-base font-bold text-white mb-1.5">Review &amp; Checkout</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Review your event, nominee, and price breakdown before completing payment securely.
              </p>
            </div>

            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 4</span>
              <h3 className="text-base font-bold text-white mb-1.5">Instant Verification</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Votes are recorded authoritatively in the ledger with a cryptographic receipt and verifiable proof.
              </p>
            </div>
          </div>
        </div>

        {/* TRACK 2: FOR ORGANIZERS */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] text-white p-6 sm:p-10 lg:p-12">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A84C] text-[#040404] font-bold">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">For Event Organizers</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Setup in minutes • Live revenue analytics • Automated settlement</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 1</span>
              <h3 className="text-base font-bold text-white mb-1.5">Create Categories &amp; Nominees</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Configure voting unit pricing, define competition categories, and register contestant profiles.
              </p>
            </div>

            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 2</span>
              <h3 className="text-base font-bold text-white mb-1.5">Distribute &amp; Engage</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Share dedicated profile links across social media. Supporters can vote in 10 seconds without signup friction.
              </p>
            </div>

            <div className="rounded-xl bg-[#111111] p-5 sm:p-6 border border-white/[0.06]">
              <span className="text-xs font-bold text-[#C9A84C] block mb-2">Step 3</span>
              <h3 className="text-base font-bold text-white mb-1.5">Track &amp; Withdraw</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Monitor live tallies on your dashboard and request automated bank settlement directly to your verified account.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center space-y-4">
          <Link href="/dashboard/events/new">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3.5 text-xs sm:text-sm font-bold text-[#040404] hover:bg-[#D4B86A] transition-colors cursor-pointer">
              <span>Create an Event</span>
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </Link>
          <p className="text-xs text-neutral-500">
            Free setup • Instant verification • Automated settlement
          </p>
        </div>
      </div>
    </div>
  )
}
