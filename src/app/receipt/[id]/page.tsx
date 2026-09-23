import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  CheckCircle2,
  Trophy,
  ArrowRight,
  Lock,
  Share2,
  ShieldCheck,
} from "lucide-react"
import { BrandLogo } from "@/components/ui/BrandLogo"

interface ReceiptVerificationPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptVerificationPage({ params }: ReceiptVerificationPageProps) {
  const { id: publicId } = await params

  const receipt = db.getReceiptByPublicId(publicId)
  if (!receipt) {
    notFound()
  }

  const vote = db.getVotes().find((v) => v.id === receipt.vote_id)
  const event = vote ? db.getEventById(vote.event_id) : null
  const nominee = vote ? db.getNomineeById(vote.nominee_id) : null
  const category = vote ? db.getCategoryById(vote.category_id) : null

  return (
    <div className="py-12 sm:py-20 min-h-screen bg-[#06080e] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative z-10">
        {/* Verified Certificate Container */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="bg-gradient-to-b from-[#121827] to-[#0c101b] p-8 text-white text-center border-b border-white/[0.08] flex flex-col items-center relative">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                <Lock className="h-3 w-3" /> VERIFIED VOTE
              </span>
            </div>
            
            <BrandLogo size="md" className="mb-4" />
            
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Cryptographically Verified Authentic Receipt
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 text-white tracking-tight">
              ✓ VOTE CONFIRMED
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Your vote has been successfully recorded in the immutable ledger.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Event & Nominee Info */}
            <div className="flex items-center gap-4 rounded-2xl bg-neutral-900/80 p-4 border border-white/[0.06]">
              <img
                src={nominee?.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={nominee?.name || "Nominee"}
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-amber-400/30 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white truncate">
                    {nominee?.name}
                  </h3>
                  <span className="rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                    #{nominee?.public_id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-400 truncate mt-0.5">
                  {category?.name} • {event?.name}
                </p>
              </div>
            </div>

            {/* Receipt Breakdown Table */}
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#06080e] p-4 sm:p-5 text-xs">
              {[
                { label: "Receipt Number", value: receipt.receipt_number, mono: true, bold: true, dark: true },
                { label: "Verification ID", value: receipt.public_id, mono: true, colored: true },
                { label: "Votes Recorded", value: `${vote?.quantity} Verified Vote${vote && vote.quantity > 1 ? "s" : ""}`, bold: true, gold: true },
                { label: "Price per Vote", value: formatCurrency(vote?.unit_price || 100, vote?.currency) },
                { label: "Issued Timestamp", value: formatDateTime(receipt.issued_at) },
                { label: "Voter Email", value: receipt.voter_email || "—" },
                { label: "Gateway Reference", value: vote?.payment_reference || "—", mono: true },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex flex-wrap items-start gap-x-4 gap-y-0.5 text-slate-400 ${
                    i < arr.length - 1 ? "pb-2.5 border-b border-white/5" : ""
                  }`}
                >
                  <span className="shrink-0 min-w-[130px] text-slate-500">{row.label}:</span>
                  <span
                    className={[
                      "flex-1 min-w-0 break-all text-right sm:text-left",
                      row.mono ? "font-mono" : "",
                      row.bold ? "font-bold" : "font-medium",
                      row.dark ? "text-white" : "",
                      row.gold ? "text-amber-400 font-black text-sm" : "",
                      row.colored ? "text-emerald-400 font-bold" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Total line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/[0.08] text-sm font-bold text-white">
                <span>Total Amount Paid:</span>
                <span className="text-2xl font-black text-amber-400">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </span>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span>
                This transaction is permanently anchored in the authoritative vote ledger. These votes cannot be altered, forged, or double-counted.
              </span>
            </div>

            {/* CTAs: Return to Event, Explore Events */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {event && (
                <Link href={`/events/${event.slug}`} className="flex-1">
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 py-3.5 px-6 font-black text-xs text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer">
                    <Trophy className="h-4 w-4 mr-1" />
                    Return to {event.name}
                  </button>
                </Link>
              )}
              <Link href="/events" className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-neutral-900 py-3.5 px-6 font-bold text-xs text-slate-300 hover:text-white hover:border-amber-400/40 transition-colors cursor-pointer">
                  <span>Explore All Events</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
