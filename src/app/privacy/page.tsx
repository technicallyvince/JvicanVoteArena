import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Lock, Eye, Server, UserCheck, Bell } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | JVican Vote Arena",
  description:
    "Privacy Policy for JVican Vote Arena, operated by JVICAN MASCOT INFLATABLE ENTERTAINMENT. Learn how voter data, email receipts, and organizer information are securely handled.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#040404] text-white pt-24 sm:pt-28 pb-20 selection:bg-[#C9A84C] selection:text-[#040404]">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[#C9A84C]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-4">
            <Lock className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Data Protection &amp; Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-neutral-400">
            Last Updated: September 2026 • Governing Entity:{" "}
            <strong className="text-neutral-200">JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-xs sm:text-sm leading-relaxed text-neutral-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                1
              </span>
              <span>Information We Collect</span>
            </h2>
            <p>
              At <strong>JVican Vote Arena</strong>, operated by{" "}
              <strong>JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>, we prioritize minimal data collection, privacy, and full cryptographic transparency. We collect only what is strictly necessary to authenticate votes and issue verification receipts:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400">
              <li>
                <strong>Voter Contact Data:</strong> Email address provided during checkout for delivery of official digital receipts and audit logs.
              </li>
              <li>
                <strong>Transaction &amp; Ballot Logs:</strong> Nominee selected, vote count, transaction reference, amount paid, timestamp, and payment gateway confirmation.
              </li>
              <li>
                <strong>Nominee &amp; Contestant Data:</strong> Nominee full name, category, stage name, bio, photograph, and public voting identifier.
              </li>
              <li>
                <strong>Organizer Account Data:</strong> Name, verified email, event configurations, description updates, and settlement payout details.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                2
              </span>
              <span>How Your Information is Used</span>
            </h2>
            <p>We use the collected information exclusively to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-neutral-400">
              <li>Authoritatively tally and record votes to calculate leaderboard standings.</li>
              <li>Issue instant electronic proof of voting with cryptographic reference numbers.</li>
              <li>Detect and prevent vote manipulation, duplicate voting anomalies, and fraudulent transactions.</li>
              <li>Distribute verified organizer earnings and maintain compliance records.</li>
            </ul>
            <p className="text-neutral-200">
              <strong>We never sell, rent, or monetize personal voter contact information to third-party advertisers.</strong>
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                3
              </span>
              <span>Payment Security &amp; Financial Data</span>
            </h2>
            <p>
              All payment transactions are handled through PCI-DSS Level 1 compliant payment gateways. JVican Vote Arena does not store, process, or have direct access to your credit card numbers, CVVs, or online banking credentials. All transmissions are protected with end-to-end 256-bit TLS encryption.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#C9A84C]/15 text-[#C9A84C] text-xs font-black">
                4
              </span>
              <span>Data Retention &amp; Integrity</span>
            </h2>
            <p>
              Vote transaction records are permanently stored in an immutable ledger for historical verification and certificate generation. Public nominee profiles remain visible on the event archive pages after contest conclusion for recognition purposes.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-6 border-t border-white/[0.08]">
            <h2 className="text-lg sm:text-xl font-bold text-white">Contact Our Privacy Officer</h2>
            <p className="text-neutral-400">
              If you have any questions, requests for data correction, or privacy inquiries:
            </p>
            <div className="rounded-xl bg-[#0e1018] p-4 border border-white/[0.06] text-neutral-300">
              <p className="font-bold text-white">JVICAN MASCOT INFLATABLE ENTERTAINMENT</p>
              <p className="mt-1 text-xs text-neutral-400">Data Governance Department</p>
              <p className="text-xs text-neutral-400">Email: privacy@jvicanvotearena.com</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-wrap gap-4 text-xs font-semibold text-neutral-400">
          <Link href="/terms" className="hover:text-[#C9A84C] transition-colors">
            Terms of Service
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
