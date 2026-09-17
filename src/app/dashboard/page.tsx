import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Trophy,
  Users,
  DollarSign,
  Layers,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Plus,
  Vote,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react"

export default function DashboardOverviewPage() {
  const events = db.getEvents()
  const votes = db.getVotes().filter((v) => v.status === "confirmed")
  const payments = db.getPayments().filter((p) => p.status === "successful")

  const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0)
  const totalVotesCast = votes.reduce((acc, v) => acc + Number(v.quantity), 0)
  const activeEventsCount = events.filter((e) => e.status === "published").length

  return (
    <div className="py-8 sm:py-12 bg-[#fafafa] dark:bg-[#090d16] min-h-[90vh]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>JVican Vote Arena Cockpit</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Organizer Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time monitor for voting competitions, verified receipts, and TransactPay settlement.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/create-contest">
              <Button
                variant="primary"
                size="md"
                className="gap-2 font-extrabold text-xs rounded-full px-5 shadow-md shadow-blue-500/20"
              >
                <Plus className="h-4 w-4" />
                Create Contest
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Total Revenue</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
              {formatCurrency(totalRevenue, "NGN")}
            </p>
            <span className="text-[11px] text-emerald-600 font-bold mt-1.5 inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> TransactPay Authoritative
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Confirmed Votes</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                <Vote className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
              {totalVotesCast.toLocaleString()}
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              Zero duplicate webhooks
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Active Contests</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
              {activeEventsCount}
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              {events.length} Total Registered
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 card-hover">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">Settlement Status</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50">
                <Trophy className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-3 tracking-tight">
              Ready
            </p>
            <span className="text-[11px] text-slate-400 mt-1.5 block font-medium">
              Direct bank transfer linked
            </span>
          </div>
        </div>

        {/* Hosted Contests Table */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Your Competitions
              </h2>
              <p className="text-xs text-slate-500">Manage nominees, review tallies, and configure settings.</p>
            </div>
            <Link href="/create-contest">
              <Button size="sm" variant="outline" className="rounded-full text-xs font-bold gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                New Event
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-850">
                <tr>
                  <th className="py-3 px-4">Contest Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Vote Price</th>
                  <th className="py-3 px-4">Candidates</th>
                  <th className="py-3 px-4">Votes Cast</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.map((evt) => {
                  const evtVotes = db.getVotes(evt.id).filter((v) => v.status === "confirmed")
                  const count = evtVotes.reduce((acc, v) => acc + v.quantity, 0)
                  const candidateCount = db.getNominees(evt.id).length

                  return (
                    <tr key={evt.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={evt.logo_url || evt.cover_image_url || undefined}
                            alt={evt.name}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {evt.name}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              /{evt.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {evt.status === "published" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {evt.status}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(evt.vote_price, evt.currency)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {candidateCount} Contestants
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white">
                        {count.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <Link href={`/dashboard/events/${evt.id}`}>
                          <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                            Manage Event
                          </Button>
                        </Link>
                        <Link href={`/contest/${evt.slug}`} target="_blank">
                          <Button size="sm" variant="ghost" className="rounded-xl text-xs">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
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
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Recent Vote Transactions
              </h2>
              <p className="text-xs text-slate-500">Live feed of verified votes processed through TransactPay.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              Live Stream Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-850">
                <tr>
                  <th className="py-3 px-4">Voter Email</th>
                  <th className="py-3 px-4">Contestant</th>
                  <th className="py-3 px-4">Votes</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {votes.slice(0, 8).map((vote) => {
                  const nominee = db.getNomineeById(vote.nominee_id)

                  return (
                    <tr key={vote.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {vote.voter_email}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {nominee?.name || "Candidate"}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                        +{vote.quantity} Votes
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(vote.total_amount, vote.currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                        {vote.payment_reference}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
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
