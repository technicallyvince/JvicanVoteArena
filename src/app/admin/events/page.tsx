"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  CalendarCheck2,
  Search,
  Eye,
  Users,
  Layers,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
  Filter,
  Loader2,
  Trash2,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react"

export default function AdminAllEventsPage() {
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/admin/events", { cache: "no-store" })
      const data = await res.json()
      if (data.success && Array.isArray(data.events)) {
        setEvents(data.events)
      } else {
        setEvents([])
      }
    } catch (err) {
      console.error("Failed to load events:", err)
      setEvents([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const handleDeleteEvent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }
    try {
      const res = await fetch(`/api/admin/events?eventId=${encodeURIComponent(id)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete event.")
      fetchEvents()
    } catch (err: any) {
      alert(err?.message || "Failed to delete event.")
    }
  }

  const allEvents = events

  const filteredEvents = allEvents.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        e.name.toLowerCase().includes(q) ||
        (e.organizer_name || "").toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q)
      )
    }
    return true
  })

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      published: { label: "Live", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]" },
      pending_approval: { label: "Pending", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]" },
      approved: { label: "Approved", cls: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
      draft: { label: "Draft", cls: "text-slate-400 bg-white/[0.05] border-white/10" },
      closed: { label: "Closed", cls: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
      rejected: { label: "Rejected", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
      archived: { label: "Archived", cls: "text-slate-500 bg-white/[0.03] border-white/[0.08]" },
    }
    const s = map[status] || { label: status, cls: "text-slate-400 bg-white/[0.05] border-white/10" }
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider inline-flex items-center gap-1.5", s.cls)}>
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
        {s.label}
      </span>
    )
  }

  const statusCounts: Record<string, number> = {}
  allEvents.forEach((e) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
  })

  const totalRevenue = allEvents.reduce((acc, ev) => {
    const ledger = db.getLedger(ev.id)
    return acc + ledger.reduce((s, l) => s + l.gross_amount, 0)
  }, 0)

  const filters = [
    { id: "all", label: `All (${allEvents.length})` },
    { id: "published", label: `Live (${statusCounts["published"] || 0})` },
    { id: "pending_approval", label: `Pending (${statusCounts["pending_approval"] || 0})` },
    { id: "closed", label: `Closed (${statusCounts["closed"] || 0})` },
    { id: "rejected", label: `Rejected (${statusCounts["rejected"] || 0})` },
  ]

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[#C9A84C]/25 bg-gradient-to-br from-[#0c0d16] via-[#07080d] to-[#050608] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#C9A84C]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 bottom-0 h-40 w-40 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-[#C9A84C] mb-3 backdrop-blur-md">
              <CalendarCheck2 className="h-3.5 w-3.5" />
              <span>Event Governance & Marketplace Registry</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              All Platform Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-2xl">
              Inspect lifecycle statuses, moderation queues, nominee counts, and real-time revenue collection across all active and archived voting events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/events/pending">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs hover:bg-amber-500/25 transition shadow-lg shadow-amber-500/10 cursor-pointer">
                <Clock className="h-4 w-4 text-amber-400" />
                <span>Pending Approval ({statusCounts["pending_approval"] || 0})</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/[0.08]">
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Events</p>
            <p className="text-xl font-black text-white mt-0.5">{allEvents.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Live & Active</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">{statusCounts["published"] || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Awaiting Review</p>
            <p className="text-xl font-black text-amber-400 mt-0.5">{statusCounts["pending_approval"] || 0}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <p className="text-[10px] uppercase font-bold text-[#C9A84C] tracking-wider">Platform Volume</p>
            <p className="text-xl font-black text-[#C9A84C] mt-0.5">{formatCurrency(totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1.5 bg-[#0b0c13] rounded-2xl border border-white/[0.08] overflow-x-auto no-scrollbar shadow-inner">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap",
                statusFilter === f.id
                  ? "bg-[#C9A84C] text-[#050505] font-black shadow-lg shadow-[#C9A84C]/20"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by event, organizer, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-white/[0.08] bg-[#0b0c13] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] shadow-inner"
          />
        </div>
      </div>

      {/* Events Table / Card Grid */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#0b0c13] overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="mx-auto h-8 w-8 text-[#C9A84C] animate-spin" />
            <p className="text-xs font-bold text-slate-400">Loading events directory...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <CalendarCheck2 className="mx-auto h-12 w-12 text-slate-600" />
            <p className="text-base font-bold text-white">No events match your criteria</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search keywords or switching between the status filter tabs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Event Title & Nominees</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Organizer</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Voting Window</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Revenue</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredEvents.map((event) => {
                  const eventLedger = db.getLedger(event.id)
                  const gross = eventLedger.reduce((s, l) => s + l.gross_amount, 0)
                  const nominees = db.getNominees(event.id)
                  return (
                    <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[#C9A84C]/10 border border-[#C9A84C]/25 flex items-center justify-center shrink-0 text-[#C9A84C] font-black text-xs">
                            {event.name?.charAt(0) || "E"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-[#C9A84C] transition-colors truncate max-w-[240px]">
                              {event.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              /{event.slug} · <span className="text-slate-400">{nominees.length} nominees</span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-semibold text-slate-300 truncate max-w-[160px]">{event.organizer_name || "—"}</p>
                        <p className="text-[10px] text-slate-500 font-mono">Organizer</p>
                      </td>
                      <td className="px-6 py-4">{statusBadge(event.status)}</td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-300">{formatDate(event.start_date)}</p>
                        <p className="text-[10px] text-slate-500">to {formatDate(event.end_date)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-black text-white">{formatCurrency(gross)}</p>
                        <p className="text-[10px] text-[#C9A84C] font-medium">{eventLedger.length} votes</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/events/${event.id}`}>
                            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/[0.1] bg-white/[0.03] text-slate-300 hover:text-white hover:bg-white/[0.08] cursor-pointer transition-all">
                              <Eye className="h-3.5 w-3.5" />
                              Inspect
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDeleteEvent(event.id, event.name)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-all"
                            title="Delete event"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

