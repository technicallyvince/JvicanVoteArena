import React from "react"
import Link from "next/link"
import { ShieldCheck, Mail, ArrowRight, CheckCircle2, Lock, Crown } from "lucide-react"
import { BrandLogo } from "../ui/BrandLogo"
import { NewsletterSignup } from "../newsletter/NewsletterSignup"

export function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#040404] text-neutral-400 selection:bg-[#C9A84C] selection:text-[#040404]">
      {/* Top gold line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Col */}
          <div className="sm:col-span-2 space-y-4 sm:space-y-5">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo size="md" showName showSubtitle variant="dark" />
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 max-w-sm">
              JVican Vote Arena is the premier event voting platform for pageants, cultural recognitions, academic awards, and talent showcases. Frictionless voter checkout with cryptographic instant receipts.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-1 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 text-neutral-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                TransactPay Encrypted
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C]/06 border border-[#C9A84C]/15 px-3 py-1.5 text-[#C9A84C]">
                <Mail className="h-3.5 w-3.5 text-[#C9A84C]" />
                Instant Email Receipts
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C9A84C] mb-4 sm:mb-5">
              Explore
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/events" className="hover:text-[#C9A84C] transition-colors duration-150">
                  All Events
                </Link>
              </li>
              <li>
                <Link href="/nominees" className="hover:text-[#C9A84C] transition-colors duration-150">
                  Browse Nominees
                </Link>
              </li>
              <li>
                <Link href="/winners" className="hover:text-[#C9A84C] transition-colors duration-150">
                  Hall of Fame
                </Link>
              </li>
              <li>
                <Link href="/apply" className="hover:text-[#C9A84C] transition-colors duration-150">
                  Nominee Application
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#C9A84C] mb-4 sm:mb-5">
              Platform
            </h4>
            <ul className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/how-it-works" className="hover:text-[#C9A84C] transition-colors duration-150">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#C9A84C] transition-colors duration-150">
                  About JVican Arena
                </Link>
              </li>
              <li>
                <Link href="/dashboard/events/new" className="hover:text-[#C9A84C] transition-colors duration-150">
                  Create an Event
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#C9A84C] transition-colors duration-150">
                  Organizer Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Stay Updated / Newsletter */}
          <div className="sm:col-span-1">
            <NewsletterSignup />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 sm:mt-14 border-t border-white/[0.05] pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>© {new Date().getFullYear()} JVican Vote Arena. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <span>Powered by TransactPay &amp; Supabase</span>
            <span>•</span>
            <Link href="/about" className="hover:text-[#C9A84C] transition-colors">Privacy &amp; Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
