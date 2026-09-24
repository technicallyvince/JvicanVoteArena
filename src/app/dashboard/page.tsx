import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Trophy,
  DollarSign,
  Layers,
  TrendingUp,
  ExternalLink,
  Plus,
  Vote,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
} from "lucide-react"

export default function DashboardOverviewPage() {
  const events = db.getEvents()
  const votes = db.getVotes().filter((v) => v.status === "confirmed")
  const payments = db.getPayments().filter((p) => p.status === "successful")

  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
  const totalVotesCast = votes.reduce((acc, v) => acc + Number(v.quantity), 0)
  const activeEventsCount = events.filter((e) => e.status === "published" && new Date(e.end_date) > new Date()).length
  const totalNominees = events.reduce((acc, e) => acc + db.getNominees(e.id).length, 0)

  return (
    <div className="py-8 sm:py-12 bg-[#050608] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-2 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Organizer Center</span>
            </div>
            <h1 className="text-2xl min-[420px]:text-3xl sm:text-4xl font-black text-white tracking-tight">
              Dashboard Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time monitor for voting events, verified receipts, and TransactPay settlement.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/wallet">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-5 py-2.5 text-xs font-bold text-amber-400 hover:text-white hover:bg-amber-500/20 transition-colors cursor-pointer"
              >
                <span>Wallet & Revenue</span>
              </button>
            </Link>
            <Link href="/dashboard/withdrawals">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#0e1018] px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#161824] transition-colors cursor-pointer"
              >
                <span>Withdrawals</span>
              </button>
            </Link>
            <Link href="/dashboard/events">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-[#0e1018] px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#161824] transition-colors cursor-pointer"
              >
                <span>Events Portfolio</span>
              </button>
            </Link>
            <Link href="/dashboard/events/new">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2.5 text-xs font-black text-[#0a0c14] hover:bg-[#D4B86A] transition-all shadow-lg shadow-[#C9A84C]/20 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create Event</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Cards: Total Revenue, Total Verified Votes, Active Events, Total Nominees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {formatCurrency(totalRevenue, "NGN")}
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1.5 inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> TransactPay Authoritative
            </span>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Verified Votes</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/20">
                <Vote className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {totalVotesCast.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              Zero duplicate webhooks
            </span>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Events</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {activeEventsCount}
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              {events.length} Total in Portfolio
            </span>
          </div>

          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Nominees</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight">
              {totalNominees}
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              Across all categories
            </span>
          </div>
        </div>

        {/* Active Events Table */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-8 shadow-2xl backdrop-blur-xl mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Active Events
              </h2>
              <p className="text-xs text-slate-400">Manage nominees, review tallies, and configure settings.</p>
            </div>
            <Link href="/dashboard/events/new">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#0e1018] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#161824] transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Event</span>
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-[#0e1018]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Votes</th>
                  <th className="py-3 px-4">Revenue</th>
                  <th className="py-3 px-4">Nominees</th>
                  <th className="py-3 px-4">End Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {events.map((evt) => {
                  const evtVotes = db.getVotes(evt.id).filter((v) => v.status === "confirmed")
                  const count = evtVotes.reduce((acc, v) => acc + v.quantity, 0)
                  const revenue = evtVotes.reduce((acc, v) => acc + Number(v.total_amount), 0)
                  const nomineeCount = db.getNominees(evt.id).length

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.logo_url || evt.cover_image_url || undefined}
                            alt={evt.name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate max-w-[160px] sm:max-w-none">
                              {evt.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#C9A84C] block truncate">
                              /events/{evt.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {evt.status === "published" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-400">
                            {evt.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#C9A84C]">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(revenue, evt.currency)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-300">
                        {nomineeCount} Nominees
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDate(evt.end_date)}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2 whitespace-nowrap">
                        <Link href={`/dashboard/events/${evt.id}`}>
                          <button
                            type="button"
                            className="rounded-full bg-[#C9A84C] px-3.5 py-1.5 text-xs font-black text-[#0a0c14] hover:bg-[#D4B86A] transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </Link>
                        <Link href={`/events/${evt.slug}`} target="_blank">
                          <button
                            type="button"
                            className="rounded-full border border-white/[0.08] bg-[#0e1018] px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Recent Activity
              </h2>
              <p className="text-xs text-slate-400">Live feed of verified vote transactions processed through TransactPay.</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Live Stream Active
            </span>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-[#0e1018]/60 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Voter Email</th>
                  <th className="py-3 px-4">Nominee</th>
                  <th className="py-3 px-4">Votes</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {votes.slice(0, 8).map((vote) => {
                  const nominee = db.getNomineeById(vote.nominee_id)

                  return (
                    <tr key={vote.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {vote.voter_email}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {nominee?.name || "Nominee"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#C9A84C]">
                        +{vote.quantity} Votes
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatCurrency(vote.total_amount, vote.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {vote.payment_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
