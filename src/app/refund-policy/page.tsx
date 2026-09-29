import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { AlertTriangle, RefreshCw, CheckCircle2, FileText, HelpCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | JVican Vote Arena",
  description:
    "Official Refund and Cancellation Policy for JVican Vote Arena, operated by JVICAN MASCOT INFLATABLE ENTERTAINMENT. Understand digital finality and voting dispute resolution.",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[#040404] text-white pt-24 sm:pt-28 pb-20 selection:bg-[#C9A84C] selection:text-[#040404]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
            <RefreshCw className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Transaction Policy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400">
            Last Updated: September 2026 • Governing Entity:{" "}
            <strong className="text-neutral-200">JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-neutral-300">
          {/* Important Notice Box */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 sm:p-6 text-amber-200">
            <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-amber-300 mb-2">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Digital Finality Notice</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Voting transactions on <strong>JVican Vote Arena</strong> represent instantaneous digital ballots that directly impact live event rankings and award qualification statuses. Consequently, <strong>all completed vote purchases are strictly final, irreversible, and non-refundable.</strong>
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                1
              </span>
              <span>General Policy on Digital Voting Ballots</span>
            </h2>
            <p>
              When a voter completes a ballot transaction, votes are immediately applied to the selected nominee&apos;s authoritative tally, leaderboard rankings adjust dynamically, and a cryptographic receipt is generated. Because these digital actions are consumed immediately upon processing, refunds cannot be granted for:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400">
              <li>Accidental selection of a candidate or wrong category by the voter.</li>
              <li>Change of preference or mind after checkout completion.</li>
              <li>A nominee&apos;s failure to reach the 1,000-vote award qualification threshold.</li>
              <li>A contestant withdrawing from an event after votes have already been cast.</li>
              <li>Disappointment with the eventual contest winner or category outcome.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                2
              </span>
              <span>Exceptional Circumstances (Technical Overcharges)</span>
            </h2>
            <p>
              A refund investigation may only be initiated under strict technical conditions:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400">
              <li>
                <strong>Duplicate Payment Gateway Debits:</strong> Where the voter was debited multiple times for a single checkout session due to network latency, and only one ballot was issued.
              </li>
              <li>
                <strong>Payment Debited Without Vote Delivery:</strong> In rare cases where a bank successfully processed funds but the system experienced a confirmed API timeout that prevented vote allocation.
              </li>
            </ul>
            <p className="text-neutral-400">
              Claims for duplicate debits must be submitted within <strong>48 hours</strong> of transaction completion, accompanied by the bank debit alert and reference ID.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                3
              </span>
              <span>Event Cancellation by Organizers</span>
            </h2>
            <p>
              In the event that an organizer terminates or cancels a contest prior to the scheduled conclusion date without declaring certified results, the event settlement is frozen by platform management, and resolution will be handled in accordance with the organizer agreement under the supervision of <strong>JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>.
            </p>
          </section>

          {/* Section 4: Support */}
          <section className="space-y-3 pt-6 border-t border-white/[0.08]">
            <h2 className="text-lg sm:text-xl font-bold text-white">Transaction Dispute Inquiries</h2>
            <p className="text-neutral-400">
              If you experienced a technical duplicate charge, please email our billing department:
            </p>
            <div className="rounded-xl bg-[#0e1018] p-4 border border-white/[0.06] text-neutral-300">
              <p className="font-bold text-white">JVICAN MASCOT INFLATABLE ENTERTAINMENT</p>
              <p className="mt-1 text-xs text-neutral-400">Billing &amp; Settlement Team</p>
              <p className="text-xs text-neutral-400">Email: billing@jvicanvotearena.com</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap gap-4 text-xs font-semibold text-neutral-400">
          <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">
            Terms of Service
          </Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/how-it-works" className="hover:text-[#C9A84C] transition-colors">
            How It Works
          </Link>
        </div>
      </div>
    </div>
  )
}
