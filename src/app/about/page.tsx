import React from "react"
import Link from "next/link"
import { ShieldCheck, Trophy, Lock, Heart, ArrowRight, CheckCircle2, Vote, Zap } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { BrandLogo } from "@/components/ui/BrandLogo"

export default function AboutPage() {
  return (
    <div className="py-12 sm:py-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 flex flex-col items-center">
          <BrandLogo size="lg" className="mb-6" />
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <span>Our Philosophy & Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Voting should feel as easy <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent">
              as discovering.
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            JVican Vote Arena was engineered to bring bank-grade security, instant checkout, and cryptographic transparency to pageants, awards, and student elections.
          </p>
        </div>

        {/* Narrative Card */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              Why JVican Vote Arena Exists
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Traditional voting systems for beauty pageants, regional recognitions, and school competitions frequently suffer from opaque vote tallying, disputed outcomes, and clunky checkout forms that force voters through tedious registration hurdles.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              JVican Vote Arena was built from the ground up to solve these challenges. We separate concerns between contest organizers and supporters: voters enjoy a 10-second checkout flow without passwords, while every transaction produces an immutable, publicly verifiable receipt tied directly to authoritative database records.
            </p>
          </div>

          {/* Core Architectural Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                Server-Authoritative Pricing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All vote packages and unit prices are strictly resolved server-side. No client-side script or network interceptor can manipulate voting fees or fabricate confirmed tallies.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 mb-5">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
                Idempotent Webhook Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Integrated with TransactPay, our processing engine guarantees that duplicate webhooks, network retries, or browser refreshes never double-count votes or distort revenues.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="mt-16 text-center space-y-4">
          <Link href="/create-contest">
            <Button variant="primary" size="lg" className="rounded-full px-8 font-extrabold shadow-lg shadow-amber-500/25">
              Launch Your Contest
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <p className="text-xs text-slate-400">
            Join visionary organizations hosting trusted voting events on JVican Vote Arena.
          </p>
        </div>
      </div>
    </div>
  )
}
