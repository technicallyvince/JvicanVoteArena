import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, FileText, AlertCircle, Scale, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | JVican Vote Arena",
  description:
    "Official Terms of Service for JVican Vote Arena, operated by JVICAN MASCOT INFLATABLE ENTERTAINMENT. Rules, vote qualification standards, and user commitments.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-[#040404] text-white pt-24 sm:pt-28 pb-20 selection:bg-[#C9A84C] selection:text-[#040404]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
            <Scale className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Legal Documentation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400">
            Last Updated: September 2026 • Governing Entity:{" "}
            <strong className="text-neutral-200">JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-neutral-300">
          {/* Section 1: Overview */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                1
              </span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, casting votes, or registering events/nominees on{" "}
              <strong>JVican Vote Arena</strong> (the &quot;Platform&quot;), operated by{" "}
              <strong>JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong> (&quot;Management&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not access or use the Platform.
            </p>
          </section>

          {/* Section 2: Voting & Contestant Qualification Rules */}
          <section className="space-y-4 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#D4B86A] flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#C9A84C] shrink-0" />
              <span>Contestant Qualification &amp; Award Rules</span>
            </h2>
            <p className="text-neutral-200 font-medium">
              All contestants, voters, and organizers must take note of the official qualification thresholds set forth by Management:
            </p>
            <ul className="space-y-2.5 text-neutral-300 list-none">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <span>
                  <strong>Minimum Qualification Threshold:</strong> Contestants must pull up to one thousand (<strong>1,000 votes or above</strong>) to be eligible and qualify for official awards and podium prizes.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <span>
                  <strong>Two-Contestant Category Rule:</strong> In any category with exactly two (2) contestants, both contestants must each pull up <strong>1,000 votes and above</strong> to avoid void votes. If the threshold is not met, the results for that specific category may be nullified to maintain award validity.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#C9A84C] shrink-0 mt-0.5" />
                <span>
                  <strong>Management Authority:</strong> Official rules and certifications are enacted under the direct governance of <strong>JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>.
                </span>
              </li>
            </ul>
          </section>

          {/* Section 3: Voting & Transactions */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                2
              </span>
              <span>Voting Transactions &amp; Digital Finality</span>
            </h2>
            <p>
              Each vote transaction constitutes an authoritative, irrevocable entry in the platform ledger. Votes are tallied in real time upon successful payment verification. Because voting tokens represent instant electronic tallies in live contests, <strong>all vote purchases are final, non-refundable, and non-transferable</strong> once processed.
            </p>
            <p>
              Voters are provided with an instant digital cryptographic receipt containing a unique Reference ID upon every completed ballot transaction.
            </p>
          </section>

          {/* Section 4: Organizer Rights & Responsibilities */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                3
              </span>
              <span>Event Organizers &amp; Content Management</span>
            </h2>
            <p>
              Organizers who host events on the Platform have the authority to manage their event identity, including modifying event descriptions, banner imagery, categories, and timelines through their dedicated Organizer Dashboard. Organizers warrant that:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400">
              <li>All published descriptions, nominee likenesses, and awards are genuine and accurate.</li>
              <li>Events do not infringe upon intellectual property, promote hate speech, or deceive participants.</li>
              <li>Contest timelines and prize distributions are honored in full good faith.</li>
            </ul>
          </section>

          {/* Section 5: Anti-Fraud & Tally Verification */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                4
              </span>
              <span>Voting Integrity &amp; Anti-Fraud Safeguards</span>
            </h2>
            <p>
              JVican Vote Arena employs cryptographic auditing, automated rate limiting, and anomaly detection to guarantee tamper-proof elections. Any attempts to manipulate vote tallies via bot networks, chargebacks, stolen financial instruments, or unauthorized API scripts will result in immediate disqualification of associated nominees and permanent platform blacklisting.
            </p>
          </section>

          {/* Section 6: Contact */}
          <section className="space-y-3 pt-6 border-t border-white/[0.08]">
            <h2 className="text-lg sm:text-xl font-bold text-white">Contact &amp; Governance</h2>
            <p className="text-neutral-400">
              For legal inquiries, dispute arbitration, or questions regarding our voting policies, please contact the Management team at:
            </p>
            <div className="rounded-xl bg-[#0e1018] p-4 border border-white/[0.06] text-neutral-300">
              <p className="font-bold text-white">JVICAN MASCOT INFLATABLE ENTERTAINMENT</p>
              <p className="mt-1 text-xs text-neutral-400">Email: support@jvicanvotearena.com | legal@jvicanvotearena.com</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap gap-4 text-xs font-semibold text-neutral-400">
          <Link href="/privacy" className="hover:text-[#C9A84C] transition-colors">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/refund-policy" className="hover:text-[#C9A84C] transition-colors">
            Refund &amp; Cancellation Policy
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
