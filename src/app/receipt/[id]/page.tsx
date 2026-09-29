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
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

interface ReceiptVerificationPageProps {
  params: Promise<{ id: string }>
}

export default async function ReceiptVerificationPage({ params }: ReceiptVerificationPageProps) {
  const { id: publicId } = await params

  let receipt: any = db.getReceiptByPublicId(publicId)
  let vote: any = receipt ? db.getVotes().find((v) => v.id === receipt.vote_id) : null
  let event: any = vote ? db.getEventById(vote.event_id) : null
  let nominee: any = vote ? db.getNomineeById(vote.nominee_id) : null
  let category: any = vote ? db.getCategoryById(vote.category_id) : null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabase = supabaseUrl && !supabaseUrl.includes('placeholder')

  if (!receipt && hasSupabase) {
    try {
      const admin = getSupabaseAdmin()
      const supabase = await createClient()
      const dbClient = admin || supabase
      if (dbClient) {
        const { data: rData } = await dbClient
          .from('receipts')
          .select('*')
          .eq('public_id', publicId)
          .maybeSingle()
        if (rData) {
          receipt = rData
          const { data: vData } = await dbClient
            .from('votes')
            .select('*')
            .eq('id', rData.vote_id)
            .maybeSingle()
          if (vData) {
            vote = vData
            const [eRes, nRes, cRes] = await Promise.all([
              dbClient.from('events').select('*').eq('id', vData.event_id).maybeSingle(),
              dbClient.from('nominees').select('*').eq('id', vData.nominee_id).maybeSingle(),
              dbClient.from('categories').select('*').eq('id', vData.category_id).maybeSingle(),
            ])
            event = eRes.data || db.getEventById(vData.event_id)
            nominee = nRes.data || db.getNomineeById(vData.nominee_id)
            category = cRes.data || db.getCategoryById(vData.category_id)
          }
        }
      }
    } catch (err) {
      console.warn('Error retrieving receipt from Supabase:', err)
    }
  }

  if (!receipt) {
    notFound()
  }

  if (vote && !event) event = db.getEventById(vote.event_id)
  if (vote && !nominee) nominee = db.getNomineeById(vote.nominee_id)
  if (vote && !category) category = db.getCategoryById(vote.category_id)

  return (
    <div className="py-8 sm:py-20 min-h-screen bg-[#06080e] relative overflow-hidden pt-20 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#06080e]">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[#C9A84C]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-2xl px-3.5 sm:px-6 relative z-10">
        {/* Verified Certificate Container */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0a0c14]/95 backdrop-blur-xl shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="bg-gradient-to-b from-[#121827] to-[#0a0c14] p-6 sm:p-8 text-white text-center border-b border-white/[0.08] flex flex-col items-center relative">
            <div className="sm:absolute top-4 right-4 mb-3 sm:mb-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                <Lock className="h-3 w-3" /> VERIFIED VOTE
              </span>
            </div>
            
            <BrandLogo size="md" className="mb-3 sm:mb-4" />
            
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3.5 py-1 text-[11px] sm:text-xs font-bold text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Cryptographically Verified Receipt</span>
            </span>
            <h1 className="text-xl sm:text-3xl font-black mt-3 text-white tracking-tight">
              ✓ VOTE CONFIRMED
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              Your vote has been successfully recorded in the immutable ledger.
            </p>
          </div>

          {/* Receipt Body */}
          <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
            {/* Event & Nominee Info */}
            <div className="flex items-center gap-3 sm:gap-4 rounded-2xl bg-neutral-900/80 p-3.5 sm:p-4 border border-white/[0.06]">
              <img
                src={nominee?.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"}
                alt={nominee?.name || "Nominee"}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover ring-2 ring-[#C9A84C]/30 shadow-md shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white truncate">
                    {nominee?.name}
                  </h3>
                  <span className="rounded-md bg-[#C9A84C]/15 border border-[#C9A84C]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#C9A84C] shrink-0">
                    #{nominee?.public_id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#D4B86A] truncate mt-0.5">
                  {category?.name} • {event?.name}
                </p>
              </div>
            </div>

            {/* Receipt Breakdown Table */}
            <div className="space-y-2.5 sm:space-y-3 rounded-2xl border border-white/[0.08] bg-[#06080e] p-3.5 sm:p-5 text-xs">
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
                  className={`flex flex-col min-[480px]:flex-row min-[480px]:items-center justify-between gap-1 min-[480px]:gap-3 text-slate-400 ${
                    i < arr.length - 1 ? "pb-2.5 border-b border-white/5" : ""
                  }`}
                >
                  <span className="text-slate-500 shrink-0">{row.label}:</span>
                  <span
                    className={[
                      "break-all min-[480px]:text-right",
                      row.mono ? "font-mono" : "",
                      row.bold ? "font-bold" : "font-medium",
                      row.dark ? "text-white" : "",
                      row.gold ? "text-[#C9A84C] font-black text-sm" : "",
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
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/[0.08] text-xs sm:text-sm font-bold text-white">
                <span>Total Amount Paid:</span>
                <span className="text-xl sm:text-2xl font-black text-[#C9A84C]">
                  {formatCurrency(receipt.amount, receipt.currency)}
                </span>
              </div>
            </div>

            {/* Security Assurance */}
            <div className="flex items-center gap-2.5 sm:gap-3 rounded-2xl bg-emerald-500/10 p-3.5 sm:p-4 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
              <span className="leading-relaxed">
                This transaction is permanently anchored in the authoritative vote ledger. These votes cannot be altered, forged, or double-counted.
              </span>
            </div>

            {/* CTAs: Return to Event, Explore Events */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
              {event && (
                <Link href={`/events/${event.slug}`} className="flex-1">
                  <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] py-3.5 px-6 font-black text-xs text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer btn-shimmer active:scale-98">
                    <Trophy className="h-4 w-4 mr-1" />
                    Return to {event.name}
                  </button>
                </Link>
              )}
              <Link href="/events" className="flex-1">
                <button className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-[#0a0c14] py-3.5 px-6 font-bold text-xs text-slate-300 hover:text-white hover:border-[#C9A84C]/40 transition-colors cursor-pointer">
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
