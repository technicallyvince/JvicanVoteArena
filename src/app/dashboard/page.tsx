import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency } from "@/lib/utils"
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
} from "lucide-react"

function AsteriskStar({ className = "h-4 w-4", color = "#ff5500" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2V22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 12H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 19.07L19.07 4.93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

export default function DashboardOverviewPage() {
  const events = db.getEvents()
  const votes = db.getVotes().filter((v) => v.status === "confirmed")
  const payments = db.getPayments().filter((p) => p.status === "successful")

  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
  const totalVotesCast = votes.reduce((acc, v) => acc + Number(v.quantity), 0)
  const activeEventsCount = events.filter((e) => e.status === "published").length

  return (
    <div className="py-8 sm:py-12 bg-[#080808] min-h-screen text-white pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-2 backdrop-blur-md">
              <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
              <span>Organizer Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Organizer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Real-time monitor for voting competitions, verified receipts, and TransactPay settlement.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create-event">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-[#ff5500] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#ff661a] transition-all shadow-lg shadow-[#ff5500]/25 active:scale-98 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Create Event</span>
              </button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 shadow-xl card-hover backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-tight">
              {formatCurrency(totalRevenue, "NGN")}
            </p>
            <span className="text-[11px] text-emerald-400 font-bold mt-1.5 inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> TransactPay Authoritative
            </span>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 shadow-xl card-hover backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Confirmed Votes</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#ff5500]/15 text-[#ff5500] border border-[#ff5500]/20">
                <Vote className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-tight">
              {totalVotesCast.toLocaleString()}
            </p>
            <span className="text-[11px] text-neutral-400 mt-1.5 block font-medium">
              Zero duplicate webhooks
            </span>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 shadow-xl card-hover backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Active Events</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-white mt-3 tracking-tight">
              {activeEventsCount}
            </p>
            <span className="text-[11px] text-neutral-400 mt-1.5 block font-medium">
              {events.length} Total Registered
            </span>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 shadow-xl card-hover backdrop-blur-xl">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Settlement Status</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-3 tracking-tight">
              Ready
            </p>
            <span className="text-[11px] text-neutral-400 mt-1.5 block font-medium">
              Direct bank payout linked
            </span>
          </div>
        </div>

        {/* Hosted Events Table */}
        <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 sm:p-8 shadow-2xl backdrop-blur-xl mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Your Competitions
              </h2>
              <p className="text-xs text-neutral-400">Manage nominees, review tallies, and configure settings.</p>
            </div>
            <Link href="/create-event">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-neutral-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Event</span>
              </button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-neutral-900/60 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Event Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Vote Price</th>
                  <th className="py-3 px-4">Candidates</th>
                  <th className="py-3 px-4">Votes Cast</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {events.map((evt) => {
                  const evtVotes = db.getVotes(evt.id).filter((v) => v.status === "confirmed")
                  const count = evtVotes.reduce((acc, v) => acc + v.quantity, 0)
                  const candidateCount = db.getNominees(evt.id).length

                  return (
                    <tr key={evt.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.logo_url || evt.cover_image_url || undefined}
                            alt={evt.name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              {evt.name}
                            </span>
                            <span className="text-[11px] font-mono text-[#ff5500]">
                              /{evt.slug}
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
                          <span className="rounded-full bg-neutral-800 px-2.5 py-0.5 text-[10px] font-bold text-neutral-400">
                            {evt.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(evt.vote_price, evt.currency)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-neutral-300">
                        {candidateCount} Nominees
                      </td>
                      <td className="py-4 px-4 font-bold text-[#ff5500]">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link href={`/dashboard/events/${evt.id}`}>
                          <button
                            type="button"
                            className="rounded-full border border-white/[0.08] bg-neutral-900/90 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                          >
                            Manage
                          </button>
                        </Link>
                        <Link href={`/event/${evt.slug}`} target="_blank">
                          <button
                            type="button"
                            className="rounded-full p-1.5 text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
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

        {/* Recent Votes Ledger Preview */}
        <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">
                Recent Vote Transactions
              </h2>
              <p className="text-xs text-neutral-400">Live feed of verified votes processed through TransactPay.</p>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              Live Stream Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/[0.08] bg-neutral-900/60 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-4">Voter Email</th>
                  <th className="py-3 px-4">Candidate</th>
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
                      <td className="py-3.5 px-4 font-medium text-neutral-300">
                        {nominee?.name || "Candidate"}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#ff5500]">
                        +{vote.quantity} Votes
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {formatCurrency(vote.total_amount, vote.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">
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
