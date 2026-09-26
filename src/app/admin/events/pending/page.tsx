"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/Modal"
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldAlert,
  Calendar,
  DollarSign,
  Users,
  Layers,
  ArrowRight,
  Loader2,
  Sparkles,
  Building2,
  AlertCircle,
  ExternalLink,
} from "lucide-react"

export default function PendingEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionModal, setRejectionModal] = useState<{ eventId: string; eventName: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null)

  const fetchPendingEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/events?status=pending_approval", { cache: "no-store" })
      const data = await res.json()
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events)
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error("Failed to load pending events:", err)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const handleApprove = async (eventId: string) => {
    try {
      setIsProcessingId(eventId)
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, status: "published" }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to approve event in database")
      }

      db.updateEventApprovalStatus(eventId, "published")
      setActionFeedback(`Event successfully approved and broadcast to the live voting marketplace.`)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      setTimeout(() => setActionFeedback(null), 4000)
    } catch (err: any) {
      console.error("Approve error:", err)
      alert(err?.message || "Failed to approve event. Please check Supabase credentials.")
    } finally {
      setIsProcessingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectionModal) return
    const id = rejectionModal.eventId
    try {
      setIsProcessingId(id)
      const res = await fetch("/api/admin/events", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: id,
          status: "rejected",
          rejectionReason: rejectionReason || "Does not meet platform requirements.",
        }),
      })
      if (!res.ok) throw new Error("Failed to reject event")

      db.updateEventApprovalStatus(id, "rejected", rejectionReason || "Does not meet platform requirements.")
      setRejectionModal(null)
      setRejectionReason("")
      setActionFeedback("Event rejected. The organizer will be notified via their registered email.")
      setEvents((prev) => prev.filter((e) => e.id !== id))
      setTimeout(() => setActionFeedback(null), 4000)
    } catch (err: any) {
      alert(err?.message || "Failed to reject event")
    } finally {
      setIsProcessingId(null)
    }
  }

  const currentPending = events

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-[#120f06] via-[#0b0c13] to-[#050608] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-amber-400 mb-3 backdrop-blur-md">
              <Clock className="h-3.5 w-3.5" />
              <span>Event Moderation & Verification</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Pending Approval Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Inspect organizer event details, voting price structures, settlement account information, and category setups before granting live marketplace access.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/events">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-slate-300 font-bold text-xs hover:bg-white/[0.08] hover:text-white transition cursor-pointer">
                <span>View All Registry</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Success Feedback Alert */}
      {actionFeedback && (
        <div className="px-5 py-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-3 shadow-lg shadow-emerald-500/10 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Pending Queue Content */}
      {isLoading ? (
        <div className="rounded-3xl border border-white/[0.08] bg-[#0b0c13] p-16 text-center space-y-3">
          <Loader2 className="mx-auto h-8 w-8 text-amber-400 animate-spin" />
          <p className="text-xs font-bold text-slate-400">Loading pending approval queue...</p>
        </div>
      ) : currentPending.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 sm:p-20 text-center bg-[#0b0c13]/60 shadow-xl space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-white">All Clear & Up to Date</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            No events are currently awaiting administrative review. New submissions from organizers will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentPending.map((event) => {
            const categories = Array.isArray(event.categories) && event.categories.length > 0 ? event.categories : db.getCategories(event.id)
            const nominees = Array.isArray(event.nominees) && event.nominees.length > 0 ? event.nominees : db.getNominees(event.id)
            const isProcessing = isProcessingId === event.id

            return (
              <div
                key={event.id}
                className="rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#0e0f17] to-[#0a0b12] p-6 sm:p-7 shadow-2xl hover:border-amber-500/40 transition-all group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 font-black text-xs">
                        {event.name?.charAt(0) || "P"}
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-400 transition-colors truncate max-w-xl">
                          {event.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Slug: /{event.slug} · Submitted on {formatDate(event.created_at || new Date().toISOString())}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)] uppercase tracking-wider inline-flex items-center gap-1.5 ml-auto sm:ml-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        PENDING MODERATION
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {event.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Organizer</span>
                        <span className="text-xs font-bold text-white truncate block mt-0.5">{event.organizer_name || "Unknown"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Voting Window</span>
                        <span className="text-xs font-bold text-slate-300 block mt-0.5">{formatDate(event.start_date)} → {formatDate(event.end_date)}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Categories & Nominees</span>
                        <span className="text-xs font-bold text-amber-400 block mt-0.5">{categories.length} Cats · {nominees.length} Noms</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Vote Price</span>
                        <span className="text-xs font-black text-emerald-400 block mt-0.5">{formatCurrency(event.vote_price, event.currency)}</span>
                      </div>
                    </div>

                    {/* Settlement Account Badge */}
                    {event.payout_bank && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/5 border border-sky-500/20 text-[11px] text-sky-300">
                        <Building2 className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span>
                          Payout Settlement: <strong className="text-white">{event.payout_bank}</strong> ({event.payout_account_number} · {event.payout_account_name})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2.5 shrink-0 border-t lg:border-t-0 lg:border-l border-white/[0.06] pt-4 lg:pt-0 lg:pl-6">
                    <Link href={`/admin/events/${event.id}`} className="w-full">
                      <button className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border border-white/[0.1] bg-white/[0.04] text-slate-300 hover:text-white hover:bg-white/[0.08] transition cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect Full</span>
                      </button>
                    </Link>

                    <button
                      disabled={isProcessing}
                      onClick={() => handleApprove(event.id)}
                      className="w-full flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-black bg-emerald-500 text-[#050505] hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      <span>Approve Live</span>
                    </button>

                    <button
                      disabled={isProcessing}
                      onClick={() => setRejectionModal({ eventId: event.id, eventName: event.name })}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 transition cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={!!rejectionModal}
        onClose={() => { setRejectionModal(null); setRejectionReason("") }}
        title="Reject Event Submission"
        description={rejectionModal ? `Provide clear feedback for rejecting "${rejectionModal.eventName}" so the organizer can rectify the submission.` : ""}
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection (e.g., Incomplete nominee profiles, invalid payout details, misleading title)..."
            rows={4}
            className="w-full rounded-2xl border border-white/[0.1] bg-[#0b0c13] px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none shadow-inner"
          />
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setRejectionModal(null); setRejectionReason("") }}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/[0.08] text-slate-300 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-5 py-2 rounded-xl text-xs font-black bg-rose-500 text-white hover:bg-rose-400 transition shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

