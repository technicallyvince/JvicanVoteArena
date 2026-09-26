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
  Sparkles,
  ArrowUpRight,
  Flame,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SuperAdminOverviewPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          setEvents(data.events)
        } else {
          setEvents([])
        }
      })
      .catch(() => setEvents([]))
      .finally(() => setIsLoading(false))
  }, [])

  const allEvents = events
  const ledger = db.getLedger()
  const withdrawals = db.getWithdrawals()
  const auditLogs = db.getAuditLogs(12)
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
      label: "Gross Platform Volume",
      value: formatCurrency(totalGross),
      icon: DollarSign,
      color: "emerald",
      badge: "Total Processed",
      sub: `${ledger.length} verified ledger entries`,
    },
    {
      label: `JVican Net Fees (${settings.platform_fee_percent}%)`,
      value: formatCurrency(totalFees),
      icon: TrendingUp,
      color: "gold",
      badge: "Platform Revenue",
      sub: `Organizer net: ${formatCurrency(totalOrgEarnings)}`,
    },
    {
      label: "Total Verified Votes",
      value: totalVotesCast.toLocaleString(),
      icon: CheckCircle2,
      color: "sky",
      badge: "100% On-Chain/Ledger",
      sub: `${allVotes.length} transactions completed`,
    },
    {
      label: "Active / Total Events",
      value: `${activeEventsCount} / ${allEvents.length}`,
      icon: CalendarCheck2,
      color: "violet",
      badge: pendingEventsCount > 0 ? `${pendingEventsCount} Pending` : "Live Marketplace",
      sub: `${pendingEventsCount} awaiting approval`,
    },
  ]

  const colorStyles: Record<string, { bg: string; text: string; border: string; glow: string; bar: string }> = {
    emerald: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "group-hover:border-emerald-500/40",
      bar: "from-emerald-500 to-teal-400",
    },
    gold: {
      bg: "bg-[#C9A84C]/10",
      text: "text-[#C9A84C]",
      border: "border-[#C9A84C]/25",
      glow: "group-hover:border-[#C9A84C]/50",
      bar: "from-[#C9A84C] to-[#E3C565]",
    },
    sky: {
      bg: "bg-sky-500/10",
      text: "text-sky-400",
      border: "border-sky-500/20",
      glow: "group-hover:border-sky-500/40",
      bar: "from-sky-500 to-blue-400",
    },
    violet: {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "group-hover:border-violet-500/40",
      bar: "from-violet-500 to-purple-400",
    },
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
    PAYMENT_VERIFIED: { label: "Payment Verified", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    NEWSLETTER_SUBSCRIBED: { label: "Newsletter Sub", color: "text-[#C9A84C] bg-[#C9A84C]/10 border-[#C9A84C]/30" },
    NEWSLETTER_UNSUBSCRIBED: { label: "Newsletter Unsub", color: "text-neutral-400 bg-white/[0.05] border-white/10" },
  }

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c0e17] via-[#080910] to-[#040508] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-[11px] font-black uppercase tracking-widest text-amber-400 mb-3 backdrop-blur-md">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Platform Executive Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Super Admin Overview
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
              Authoritative overview of platform volume, pending administrative reviews, real-time security audits, and financial ledger distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/events/pending"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition active:scale-95"
            >
              <Clock className="h-4 w-4" />
              <span>Pending Queue ({pendingEventsCount})</span>
            </Link>
            <Link
              href="/admin/transactions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-bold transition active:scale-95"
            >
              <ReceiptText className="h-4 w-4 text-[#C9A84C]" />
              <span>View Ledger</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => {
          const colors = colorStyles[stat.color]
          const Icon = stat.icon
          return (
            <div
              key={i}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 sm:p-6 shadow-xl transition-all duration-300 hover:shadow-2xl",
                colors.glow
              )}
            >
              <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", colors.bar)} />
              
              <div className="flex items-center justify-between text-neutral-400 mb-3.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-300">
                  {stat.label}
                </span>
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border shrink-0", colors.bg, colors.text, colors.border)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stat.value}
              </p>

              <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/[0.05]">
                <span className="text-[10px] text-neutral-400 font-medium truncate">
                  {stat.sub}
                </span>
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border shrink-0", colors.bg, colors.text, colors.border)}>
                  {stat.badge}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Queues Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {/* Pending Events Card */}
        <Link href="/admin/events/pending" className="block group">
          <div className="h-full rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-5 sm:p-6 hover:border-amber-500/45 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-extrabold text-white">
                      {pendingEventsCount} Events Pending Review
                    </p>
                    {pendingEventsCount > 0 && (
                      <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-amber-400/80 mt-0.5">
                    Requires compliance check &amp; approval before voter access
                  </p>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-black transition-all">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Withdrawals Card */}
        <Link href="/admin/withdrawals" className="block group">
          <div className="h-full rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-500/[0.08] via-sky-500/[0.03] to-transparent p-5 sm:p-6 hover:border-sky-500/45 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 shrink-0">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-extrabold text-white">
                      {pendingWithdrawalsCount} Payout Requests
                    </p>
                    {pendingWithdrawalsCount > 0 && (
                      <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-sky-400/80 mt-0.5">
                    Total Disbursed: <span className="font-bold text-white">{formatCurrency(completedWithdrawalsTotal)}</span>
                  </p>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-black transition-all">
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Audit Log Stream & Recent Financial Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Real-Time Security Activity Feed */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">Live Platform Audit Feed</h2>
                  <p className="text-[11px] text-neutral-400">Real-time administrator security events</p>
                </div>
              </div>
              <Link
                href="/admin/audit-log"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#C9A84C] hover:underline"
              >
                <span>Full Audit</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
              {auditLogs.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-10">No recent administrative events logged.</p>
              ) : (
                auditLogs.map((log) => {
                  const badge = actionBadgeMap[log.action] || { label: log.action, color: "text-neutral-400 bg-white/[0.05] border-white/10" }
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-400/15 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black border", badge.color)}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono">
                            {formatDateTime(log.created_at)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-neutral-200 mt-1 truncate">
                          {log.target_name || log.target_id || log.reason || "System Operation"}
                        </p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          Triggered by: <span className="text-neutral-300 font-medium">{log.admin_name}</span>
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Recent Financial Ledger Entries */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0b0c13] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <ReceiptText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-white">Recent Transactions Ledger</h2>
                  <p className="text-[11px] text-neutral-400">Authoritative vote payment distributions</p>
                </div>
              </div>
              <Link
                href="/admin/transactions"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:underline"
              >
                <span>Full Ledger</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto no-scrollbar pr-1">
              {ledger.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-10">No ledger transactions recorded yet.</p>
              ) : (
                ledger.slice(0, 7).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-bold text-white truncate">{entry.event_name}</p>
                      <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                        {entry.voter_email} • <span className="font-mono text-neutral-500">{entry.payment_reference}</span>
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">{formatCurrency(entry.gross_amount)}</p>
                      <div className="flex items-center gap-1 text-[10px] mt-0.5 justify-end">
                        <span className="text-[#C9A84C] font-bold">Fee: {formatCurrency(entry.platform_fee)}</span>
                        <span className="text-neutral-600">·</span>
                        <span className="text-emerald-400 font-bold">Net: {formatCurrency(entry.organizer_amount)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

