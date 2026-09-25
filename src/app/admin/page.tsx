"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  ShieldAlert,
  DollarSign,
  TrendingUp,
  Layers,
  Users,
  Clock,
  Wallet,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Activity,
  ReceiptText,
  CalendarCheck2,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SuperAdminOverviewPage() {
  const [events, setEvents] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/admin/events")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events)
        } else {
          setEvents(db.getEvents())
        }
      })
      .catch(() => setEvents(db.getEvents()))
  }, [])

  const allEvents = events.length > 0 ? events : db.getEvents()
  const ledger = db.getLedger()
  const withdrawals = db.getWithdrawals()
  const auditLogs = db.getAuditLogs(10)
  const allVotes = db.getVotes()
  const settings = db.getPlatformSettings()

  // Platform-level financial aggregation
  const totalGross = ledger.filter((l) => l.status === "verified").reduce((s, l) => s + l.gross_amount, 0)
  const totalFees = ledger.filter((l) => l.status === "verified").reduce((s, l) => s + l.platform_fee, 0)
  const totalOrgEarnings = totalGross - totalFees

  const totalVotesCast = allVotes.filter((v) => v.status === "confirmed").reduce((s, v) => s + v.quantity, 0)
  const activeEventsCount = allEvents.filter((e) => e.status === "published" && new Date(e.end_date) > new Date()).length
  const pendingEventsCount = allEvents.filter((e) => e.status === "pending_approval").length
  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === "pending_approval").length
  const completedWithdrawalsTotal = withdrawals.filter((w) => w.status === "completed").reduce((s, w) => s + w.amount, 0)

  const stats = [
    {
      label: "Platform Volume (Gross)",
      value: formatCurrency(totalGross),
      icon: DollarSign,
      color: "emerald",
      sub: `${ledger.length} verified ledger entries`,
    },
    {
      label: `Platform Fees (${settings.platform_fee_percent}%)`,
      value: formatCurrency(totalFees),
      icon: TrendingUp,
      color: "amber",
      sub: `Organizer net: ${formatCurrency(totalOrgEarnings)}`,
    },
    {
      label: "Total Verified Votes",
      value: totalVotesCast.toLocaleString(),
      icon: CheckCircle2,
      color: "sky",
      sub: `${allVotes.length} transactions processed`,
    },
    {
      label: "Active / Total Events",
      value: `${activeEventsCount} / ${allEvents.length}`,
      icon: CalendarCheck2,
      color: "violet",
      sub: `${pendingEventsCount} awaiting approval`,
    },
  ]

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    emerald: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/20" },
    amber: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/20" },
    sky: { bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/20" },
    violet: { bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/20" },
  }

  const actionBadgeMap: Record<string, { label: string; color: string }> = {
    ADMIN_APPROVED_EVENT: { label: "Approved Event", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    ADMIN_REJECTED_EVENT: { label: "Rejected Event", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
    ADMIN_APPROVED_WITHDRAWAL: { label: "Approved WD", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    ADMIN_REJECTED_WITHDRAWAL: { label: "Rejected WD", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
    ADMIN_COMPLETED_WITHDRAWAL: { label: "Completed WD", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
    ORGANIZER_SUBMITTED_EVENT: { label: "Event Submitted", color: "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/30" },
    ORGANIZER_REQUESTED_WITHDRAWAL: { label: "WD Requested", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    ADMIN_UPDATED_PLATFORM_SETTING: { label: "Setting Update", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
    PAYMENT_VERIFIED: { label: "Payment", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  }

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-400 mb-2 backdrop-blur-md">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Platform Command Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Super Admin Overview
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time platform performance, financial health, and operational metrics.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => {
          const colors = colorMap[stat.color]
          const Icon = stat.icon
          return (
            <div key={i} className="rounded-2xl border border-white/[0.07] bg-[#0a0c14] p-5 shadow-xl">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider">{stat.label}</span>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", colors.bg, colors.text, colors.border)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
              <span className="text-[10px] text-slate-500 mt-1 block font-medium">{stat.sub}</span>
            </div>
          )
        })}
      </div>

      {/* Pending Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Pending Events Card */}
        <Link href="/admin/events/pending" className="block group">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 hover:bg-amber-500/[0.07] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{pendingEventsCount} Events Pending Approval</p>
                  <p className="text-[11px] text-amber-400/70">Requires Super Admin review before going live</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Pending Withdrawals Card */}
        <Link href="/admin/withdrawals" className="block group">
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.04] p-5 hover:bg-sky-500/[0.07] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/25">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{pendingWithdrawalsCount} Withdrawals Pending</p>
                  <p className="text-[11px] text-sky-400/70">
                    Disbursed: {formatCurrency(completedWithdrawalsTotal)}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-sky-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      {/* Audit Log Stream & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Real-Time Activity Feed */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0a0c14] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Activity Feed</h2>
            </div>
            <Link href="/admin/audit-log" className="text-[10px] font-bold text-amber-400 hover:underline">
              View Full Log →
            </Link>
          </div>
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No audit activity yet.</p>
            ) : (
              auditLogs.map((log) => {
                const badge = actionBadgeMap[log.action] || { label: log.action, color: "text-slate-400 bg-white/[0.05] border-white/10" }
                return (
                  <div key={log.id} className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                    <div className="mt-0.5 h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-400/10 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-black border", badge.color)}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-slate-500">{log.admin_name}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 truncate">
                        {log.target_name || log.target_id}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Recent Ledger Entries */}
        <div className="rounded-2xl border border-white/[0.07] bg-[#0a0c14] p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ReceiptText className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Recent Ledger</h2>
            </div>
            <Link href="/admin/transactions" className="text-[10px] font-bold text-emerald-400 hover:underline">
              View All →
            </Link>
          </div>
          <div className="space-y-2 max-h-[380px] overflow-y-auto no-scrollbar pr-1">
            {ledger.slice(0, 8).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-white truncate">{entry.event_name}</p>
                  <p className="text-[10px] text-slate-500">{entry.voter_email} · {formatDateTime(entry.created_at)}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-xs font-bold text-white">{formatCurrency(entry.gross_amount)}</p>
                  <div className="flex items-center gap-1.5 text-[9px] mt-0.5">
                    <span className="text-amber-400 font-bold">Fee: {formatCurrency(entry.platform_fee)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-emerald-400 font-bold">Net: {formatCurrency(entry.organizer_amount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
