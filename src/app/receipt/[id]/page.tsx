import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  ShieldCheck,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Receipt,
  Mail,
  Calendar,
  Lock,
  Vote,
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
  const contest = vote ? db.getEventById(vote.event_id) : null
  const contestant = vote ? db.getNomineeById(vote.nominee_id) : null
  const category = vote ? db.getCategoryById(vote.category_id) : null

  return (
    <div className="py-12 sm:py-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Verified Badge Header */}
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-[#090d16] p-8 text-white text-center border-b border-slate-800 flex flex-col items-center">
            <BrandLogo size="md" className="mb-4" />
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3.5 py-1 text-xs font-black text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Cryptographically Verified Authentic Receipt
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
              Official Voting Record
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Public proof of payment & certified vote allocation on the JVican Vote Arena ledger.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Contest & Nominee Info */}
            <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <img
                src={contestant?.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={contestant?.name || "Contestant"}
                className="h-16 w-16 rounded-xl object-cover shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {contestant?.name}
                  </h3>
                  <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                    #{contestant?.public_id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 truncate mt-0.5">
                  {category?.name} • {contest?.name}
                </p>
              </div>
            </div>

            {/* Receipt Breakdown Table */}
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-850 text-xs">
              {[
                { label: "Receipt Number", value: receipt.receipt_number, mono: true, bold: true, dark: true },
                { label: "Public Verification ID", value: receipt.public_id, mono: true, colored: true },
                { label: "Votes Recorded", value: `+${vote?.quantity} Confirmed Vote${vote && vote.quantity > 1 ? "s" : ""}`, bold: true, dark: true },
                { label: "Price per Vote", value: formatCurrency(vote?.unit_price || 100, vote?.currency) },
                { label: "Issued Timestamp", value: formatDateTime(receipt.issued_at) },
                { label: "Voter Email", value: receipt.voter_email || "—" },
                { label: "Gateway Reference", value: vote?.payment_reference || "—", mono: true },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className={`flex flex-wrap items-start gap-x-4 gap-y-0.5 text-slate-500 ${
                    i < arr.length - 1 ? "pb-2.5 border-b border-slate-100 dark:border-slate-800" : ""
                  }`}
                >
                  <span className="shrink-0 min-w-[130px] text-slate-400">{row.label}:</span>
                  <span
                    className={[
                      "flex-1 min-w-0 break-all text-right sm:text-left",
                      row.mono ? "font-mono" : "",
                      row.bold ? "font-extrabold" : "font-medium",
                      row.dark ? "text-slate-900 dark:text-white" : "",
                      row.colored ? "text-blue-600 dark:text-blue-400 font-bold" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              {/* Total line */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t-2 border-slate-900 dark:border-white text-sm font-black text-slate-900 dark:text-white">
                <span>Total Amount Paid:</span>
                <span className="text-xl text-blue-600 dark:text-blue-400">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </span>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>
                This transaction has been permanently anchored in the authoritative vote ledger. These votes cannot be duplicated, modified, or forged.
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {contest && (
                <Link href={`/contest/${contest.slug}`} className="flex-1">
                  <Button variant="primary" size="lg" className="w-full justify-center rounded-2xl font-extrabold text-xs shadow-md shadow-blue-500/20">
                    <Trophy className="h-4 w-4 mr-2" />
                    View {contest.name}
                  </Button>
                </Link>
              )}
              <Link href="/contests" className="flex-1">
                <Button variant="outline" size="lg" className="w-full justify-center rounded-2xl font-bold text-xs">
                  Explore Contests
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
