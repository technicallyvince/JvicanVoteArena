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
      published: { label: "Live", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
      pending_approval: { label: "Pending", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
      approved: { label: "Approved", cls: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
      draft: { label: "Draft", cls: "text-slate-400 bg-white/[0.05] border-white/10" },
      closed: { label: "Closed", cls: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
      rejected: { label: "Rejected", cls: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
      archived: { label: "Archived", cls: "text-slate-500 bg-white/[0.03] border-white/[0.08]" },
    }
    const s = map[status] || { label: status, cls: "text-slate-400 bg-white/[0.05] border-white/10" }
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black border uppercase", s.cls)}>
        {s.label}
      </span>
    )
  }

  const statusCounts: Record<string, number> = {}
  allEvents.forEach((e) => {
    statusCounts[e.status] = (statusCounts[e.status] || 0) + 1
  })

  const filters = [
    { id: "all", label: `All (${allEvents.length})` },
    { id: "published", label: `Live (${statusCounts["published"] || 0})` },
    { id: "pending_approval", label: `Pending (${statusCounts["pending_approval"] || 0})` },
    { id: "closed", label: `Closed (${statusCounts["closed"] || 0})` },
    { id: "rejected", label: `Rejected (${statusCounts["rejected"] || 0})` },
  ]

  return (
    <div className="max-w-7xl w-full mx-auto space-y-6">
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-[#C9A84C] mb-2">
          <CalendarCheck2 className="h-3.5 w-3.5" />
          <span>Event Registry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">All Events</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">Complete registry of all events across the platform.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-1.5 p-1 bg-[#0a0a0a] rounded-full border border-white/[0.08] overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={cn(
                "px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                statusFilter === f.id
                  ? "bg-[#C9A84C] text-[#050505] font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name or organizer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-white/[0.08] bg-[#0a0a0a] pl-9 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C]"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#0a0c14] overflow-hidden shadow-xl">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck2 className="mx-auto h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm font-bold text-white">No events match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting a different status or clearing the search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Event</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Organizer</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Dates</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500">Revenue</th>
                  <th className="px-5 py-3 text-[10px] font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const eventLedger = db.getLedger(event.id)
                  const gross = eventLedger.reduce((s, l) => s + l.gross_amount, 0)
                  const nominees = db.getNominees(event.id)
                  return (
                    <tr key={event.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-white truncate max-w-[200px]">{event.name}</p>
                        <p className="text-[10px] text-slate-500">{nominees.length} nominees</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[11px] text-slate-300 truncate max-w-[140px]">{event.organizer_name || "—"}</p>
                      </td>
                      <td className="px-5 py-3.5">{statusBadge(event.status)}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-[10px] text-slate-400">{formatDate(event.start_date)}</p>
                        <p className="text-[10px] text-slate-500">→ {formatDate(event.end_date)}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-white">{formatCurrency(gross)}</p>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/events/${event.id}`}>
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.04] cursor-pointer transition-all">
                            <Eye className="h-3 w-3" />
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
        )}
      </div>
    </div>
  )
}
