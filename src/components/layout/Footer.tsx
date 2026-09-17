import React from "react"
import Link from "next/link"
import { ShieldCheck, Mail, ArrowUpRight, CheckCircle2, Lock } from "lucide-react"
import { BrandLogo } from "../ui/BrandLogo"

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white text-slate-600 dark:border-slate-800 dark:bg-[#070a10] dark:text-slate-400 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" showName showSubtitle />
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
              JVican Vote Arena is the premier competition voting platform for beauty pageants, cultural awards, school competitions, and talent showcases. Frictionless voter checkout with cryptographic instant receipts.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                TransactPay Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Instant Email Verification
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/contests" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  All Contests
                </Link>
              </li>
              <li>
                <Link href="/contestants" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Browse Contestants
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Hall of Champions
                </Link>
              </li>
              <li>
                <Link href="/contest/miss-igbeti-2026" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Miss Igbeti 2026
                </Link>
              </li>
              <li>
                <Link href="/receipt/rc_igbeti_001" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Receipt Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  About JVican Vote Arena
                </Link>
              </li>
              <li>
                <Link href="/create-contest" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Host a Contest
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-500 dark:hover:text-amber-400 transition-colors">
                  Organizer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Integrity */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-900 dark:text-white mb-4">
              Integrity
            </h4>
            <ul className="space-y-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>100% Server-Authoritative pricing model.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span>Zero duplicate vote webhook guarantee.</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Transparency Model
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-slate-100 dark:border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} JVican Vote Arena. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span>Powered by TransactPay & Supabase</span>
            <span>•</span>
            <Link href="/about" className="hover:underline">Privacy & Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
