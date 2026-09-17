import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/Button"
import {
  Users,
  CreditCard,
  Receipt,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Layers,
  Settings,
  Share2,
  Lock,
  Zap,
} from "lucide-react"

export default function HowItWorksPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <span>Architecture & Workflow</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How JVican Vote Arena Works
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            A transparent dual-track platform built for friction-free voter participation and bank-grade contest management for organizers.
          </p>
        </div>

        {/* TRACK 1: FOR VOTERS */}
        <div className="mb-16 rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                For Voters & Supporters
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Zero account registration • 10-second checkout flow • Verified instant receipt</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-2 font-mono">01. DISCOVER</div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">Browse & Select</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Open a contest link from WhatsApp or Instagram, or browse the public contest catalogue to locate your candidate.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-2 font-mono">02. BUNDLE</div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">Choose Vote Package</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Select quick packages (1, 5, 10, 20, 50, 100 votes) or type a custom number with real-time price calculations.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-2 font-mono">03. CHECKOUT</div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">Pay with TransactPay</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your email address and complete payment securely via credit/debit card, bank transfer, or USSD.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800">
              <div className="text-xs font-black text-blue-600 dark:text-blue-400 mb-2 font-mono">04. RECEIPT</div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1.5">Instant Verification</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Your votes are recorded authoritatively. You receive a cryptographic receipt with a permanent verification URL.
              </p>
            </div>
          </div>
        </div>

        {/* TRACK 2: FOR ORGANIZERS */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-8 sm:p-12 shadow-xl">
          <div className="flex items-center gap-3.5 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">For Contest Organizers</h2>
              <p className="text-xs text-slate-400 mt-0.5">Setup in 3 minutes • Live revenue analytics • Automated bank payouts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700">
              <div className="text-xs font-black text-amber-400 mb-2 font-mono">01. CONTEST SETUP</div>
              <h3 className="text-base font-extrabold mb-1.5">Create & Brand</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upload your contest banner, specify categories, add candidates, and set your authoritative price per vote.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700">
              <div className="text-xs font-black text-amber-400 mb-2 font-mono">02. ENGAGEMENT</div>
              <h3 className="text-base font-extrabold mb-1.5">Share & Mobilize</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Each candidate receives a dedicated short link and QR-ready profile for WhatsApp groups and Instagram stories.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-800/80 p-6 border border-slate-700">
              <div className="text-xs font-black text-amber-400 mb-2 font-mono">03. MONITOR & PAYOUT</div>
              <h3 className="text-base font-extrabold mb-1.5">Live Cockpit & Revenue</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Watch real-time leaderboards, download audited CSV transactions, and receive automated TransactPay disbursements.
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Ready to create your first voting event?
            </span>
            <Link href="/create-contest">
              <Button variant="primary" size="md" className="rounded-full px-6 text-xs font-extrabold">
                Launch Contest
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
