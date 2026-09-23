import React from "react"
import Link from "next/link"
import { ShieldCheck, Mail, ArrowUpRight, CheckCircle2, Lock, Sparkles } from "lucide-react"
import { BrandLogo } from "../ui/BrandLogo"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#06080e] text-slate-400 selection:bg-[#f59e0b] selection:text-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" showName showSubtitle variant="dark" />
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              JVican Vote Arena is the premier event voting platform for pageants, cultural recognitions, academic awards, and talent showcases. Frictionless voter checkout with cryptographic instant receipts.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                TransactPay Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-amber-400">
                <Mail className="h-3.5 w-3.5 text-amber-400" />
                Instant Email Verification
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Explore
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/events" className="hover:text-amber-400 transition-colors">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/nominees" className="hover:text-amber-400 transition-colors">
                  Browse Nominees
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-amber-400 transition-colors">
                  Hall of Champions
                </Link>
              </li>
              <li>
                <Link href="/events/miss-igbeti-2026" className="hover:text-amber-400 transition-colors">
                  Miss Igbeti 2026
                </Link>
              </li>
              <li>
                <Link href="/receipt/rc_igbeti_001" className="hover:text-amber-400 transition-colors">
                  Receipt Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Platform
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-amber-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  About JVican Arena
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events/new" className="hover:text-amber-400 transition-colors">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Organizer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Security & Integrity */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Integrity
            </h4>
            <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Server-Authoritative pricing model.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero duplicate vote webhook guarantee.</span>
              </li>
              <li className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Transparency Model
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JVican Vote Arena. All rights reserved.</p>
          <div className="flex items-center gap-6 font-medium">
            <span>Powered by TransactPay &amp; Supabase</span>
            <span>•</span>
            <Link href="/about" className="hover:text-amber-400 transition-colors">Privacy &amp; Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
