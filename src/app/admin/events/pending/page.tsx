"use client"

import React, { useState } from "react"
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
} from "lucide-react"

export default function PendingEventsPage() {
  const [rejectionModal, setRejectionModal] = useState<{ eventId: string; eventName: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [, setRefreshKey] = useState(0)

  const pendingEvents = db.getEvents().filter((e) => e.status === "pending_approval")

  const handleApprove = (eventId: string) => {
    db.updateEventApprovalStatus(eventId, "published")
    setActionFeedback(`Event approved and published to the live marketplace.`)
    setRefreshKey((k) => k + 1)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const handleReject = () => {
    if (!rejectionModal) return
    db.updateEventApprovalStatus(rejectionModal.eventId, "rejected", rejectionReason || "Does not meet platform requirements.")
    setRejectionModal(null)
    setRejectionReason("")
    setActionFeedback("Event rejected. The organizer will be notified.")
    setRefreshKey((k) => k + 1)
    setTimeout(() => setActionFeedback(null), 3000)
  }

  const currentPending = db.getEvents().filter((e) => e.status === "pending_approval")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400 mb-2">
          <Clock className="h-3.5 w-3.5" />
          <span>Approval Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Events Pending Approval
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review organizer event submissions before they appear on the public marketplace.
        </p>
      </div>

      {/* Success Feedback */}
      {actionFeedback && (
        <div className="mb-6 px-4 py-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Pending Queue */}
      {currentPending.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 p-12 sm:p-20 text-center bg-[#0a0a0a]/50">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400/50 mb-3" />
          <h3 className="text-base font-bold text-white">All Clear</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            No events are awaiting approval at this time. New submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentPending.map((event) => {
            const categories = db.getCategories(event.id)
            const nominees = db.getNominees(event.id)
            return (
              <div
                key={event.id}
                className="rounded-2xl border border-amber-500/15 bg-[#0a0c14] p-5 sm:p-6 shadow-xl hover:border-amber-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-base font-black text-white truncate">{event.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        PENDING REVIEW
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 line-clamp-2">{event.description}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Organizer: <span className="text-white font-semibold">{event.organizer_name || "Unknown"}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.start_date)} → {formatDate(event.end_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {categories.length} categories · {nominees.length} nominees
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Vote price: {formatCurrency(event.vote_price, event.currency)}
                      </span>
                    </div>

                    {/* Payout Info */}
                    {event.payout_bank && (
                      <div className="mt-2 text-[10px] text-slate-500">
                        Payout: {event.payout_bank} · {event.payout_account_number} · {event.payout_account_name}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/admin/events/${event.id}`}>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-white/[0.08] bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer">
                        <Eye className="h-3.5 w-3.5" />
                        Inspect
                      </button>
                    </Link>
                    <button
                      onClick={() => handleApprove(event.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 text-white hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectionModal({ eventId: event.id, eventName: event.name })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25 transition-all cursor-pointer"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={!!rejectionModal}
        onClose={() => { setRejectionModal(null); setRejectionReason("") }}
        title="Reject Event"
        description={rejectionModal ? `Provide a reason for rejecting "${rejectionModal.eventName}"` : ""}
        maxWidth="md"
      >
        <div className="space-y-4">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection (visible to organizer)..."
            rows={4}
            className="w-full rounded-xl border border-white/[0.1] bg-[#0e1018] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => { setRejectionModal(null); setRejectionReason("") }}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-white/[0.08] text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              className="px-5 py-2 rounded-xl text-xs font-black bg-rose-500 text-white hover:bg-rose-400 transition-all shadow-lg shadow-rose-500/20 cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
