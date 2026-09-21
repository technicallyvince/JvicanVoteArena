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
    <div className="py-12 sm:py-20 min-h-screen bg-[#080808] relative overflow-hidden pt-24 sm:pt-28">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#ff5500]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 relative z-10">
        {/* Verified Certificate Container */}
        <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121212] backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="bg-gradient-to-b from-[#181818] to-[#121212] p-8 text-white text-center border-b border-white/[0.08] flex flex-col items-center relative">
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                <Lock className="h-3 w-3" /> SECURED
              </span>
            </div>
            
            <BrandLogo size="md" className="mb-4" />
            
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Cryptographically Verified Authentic Receipt
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-3 text-white tracking-tight">
              Official Voting Record
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Public proof of certified vote allocation on the JVican Vote Arena immutable ledger.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Event & Nominee Info */}
            <div className="flex items-center gap-4 rounded-2xl bg-neutral-900/80 p-4 border border-white/[0.06]">
              <img
                src={nominee?.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={nominee?.name || "Nominee"}
                className="h-16 w-16 rounded-xl object-cover ring-2 ring-[#ff5500]/30 shadow-md"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white truncate">
                    {nominee?.name}
                  </h3>
                  <span className="rounded-md bg-[#ff5500]/15 border border-[#ff5500]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ff8c42]">
                    #{nominee?.public_id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#ff8c42] truncate mt-0.5">
                  {category?.name} • {event?.name}
                </p>
              </div>
            </div>

            {/* Receipt Breakdown Table */}
            <div className="space-y-3 rounded-2xl border border-white/[0.08] bg-[#080808] p-4 sm:p-5 text-xs">
              {[
                { label: "Receipt Number", value: receipt.receipt_number, mono: true, bold: true, dark: true },
                { label: "Public Verification ID", value: receipt.public_id, mono: true, colored: true },
                { label: "Votes Recorded", value: `+${vote?.quantity} Confirmed Vote${vote && vote.quantity > 1 ? "s" : ""}`, bold: true, gold: true },
                { label: "Price per Vote", value: formatCurrency(vote?.unit_price || 100, vote?.currency) },
                { label: "Issued Timestamp", value: formatDateTime(receipt.issued_at) },
                { label: "Voter Email", value: receipt.voter_email || "—" },
                { label: "Gateway Reference", value: vote?.payment_reference || "—", mono: true },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex flex-wrap items-start gap-x-4 gap-y-0.5 text-neutral-400 ${
                    i < arr.length - 1 ? "pb-2.5 border-b border-white/5" : ""
                  }`}
                >
                  <span className="shrink-0 min-w-[130px] text-neutral-500">{row.label}:</span>
                  <span
                    className={[
                      "flex-1 min-w-0 break-all text-right sm:text-left",
                      row.mono ? "font-mono" : "",
                      row.bold ? "font-bold" : "font-medium",
                      row.dark ? "text-white" : "",
                      row.gold ? "text-[#ff5500] font-bold text-sm" : "",
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
                <span className="text-xl text-[#ff5500]">
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

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {event && (
                <Link href={`/event/${event.slug}`} className="flex-1">
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] py-3.5 px-6 font-bold text-xs text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer">
                    <Trophy className="h-4 w-4 mr-1" />
                    View {event.name}
                  </button>
                </Link>
              )}
              <Link href="/events" className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-neutral-900 py-3.5 px-6 font-bold text-xs text-neutral-300 hover:text-white hover:border-[#ff5500]/40 transition-colors cursor-pointer">
                  <span>Explore Events</span>
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
