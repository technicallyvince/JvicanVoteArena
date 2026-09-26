"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  Trophy,
  Plus,
  ExternalLink,
  Users,
  Layers,
  Vote,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function OrganizerEventsPortfolioPage() {
  const [filter, setFilter] = useState<"all" | "active" | "pending" | "upcoming" | "completed">("all")
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

  const filteredEvents = events.filter((e) => {
    const isLive = (e.status === "published" || e.status === "approved") && new Date(e.end_date) > new Date()
    const isUpcoming = (e.status === "published" || e.status === "approved") && new Date(e.start_date) > new Date()
    const isCompleted = e.status === "closed" || new Date(e.end_date) <= new Date()
    const isPending = e.status === "pending_approval"

    if (filter === "active" && !isLive) return false
    if (filter === "pending" && !isPending) return false
    if (filter === "upcoming" && !isUpcoming) return false
    if (filter === "completed" && !isCompleted) return false
    return true
  })

  return (
    <div className="py-8 sm:py-12 bg-[#050608] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-[#C9A84C] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-white font-bold">Events Portfolio</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-2 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event Management</span>
            </div>
            <h1 className="text-2xl min-[420px]:text-3xl sm:text-4xl font-black text-white tracking-tight">
              Organizer Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your active voting events, configure categories &amp; nominees, and inspect transaction ledgers.
            </p>
          </div>

          <Link href="/dashboard/events/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-6 py-3 text-xs font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create New Event</span>
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
          {(["all", "active", "pending", "upcoming", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab as any)}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full capitalize transition-all cursor-pointer whitespace-nowrap",
                filter === tab
                  ? "bg-[#C9A84C] text-[#0a0c14] font-black shadow-md shadow-[#C9A84C]/20"
                  : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
              )}
            >
              {tab === "all" ? "All Events" : tab === "active" ? "Active Live" : tab === "pending" ? "Pending Approval" : tab === "upcoming" ? "Upcoming" : "Completed"} ({
                events.filter((e) => {
                  const isLive = (e.status === "published" || e.status === "approved") && new Date(e.end_date) > new Date()
                  const isUpcoming = (e.status === "published" || e.status === "approved") && new Date(e.start_date) > new Date()
                  const isCompleted = e.status === "closed" || new Date(e.end_date) <= new Date()
                  const isPending = e.status === "pending_approval"
                  if (tab === "active") return isLive
                  if (tab === "pending") return isPending
                  if (tab === "upcoming") return isUpcoming
                  if (tab === "completed") return isCompleted
                  return true
                }).length
              })
            </button>
          ))}
        </div>

        {/* Events Grid / Portfolio */}
        {isLoading ? (
          <div className="rounded-3xl border border-white/[0.07] p-16 text-center bg-[#0a0c14] flex flex-col items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent mb-3" />
            <p className="text-xs text-slate-400">Loading your events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center bg-[#0a0c14]">
            <Trophy className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
            <h3 className="text-base font-bold text-white">No events found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">No events in this category.</p>
            <Link href="/dashboard/events/new">
              <button className="rounded-full bg-[#C9A84C] px-5 py-2 text-xs font-black text-[#0a0c14] hover:bg-[#D4B86A]">
                Create Event
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const categories = Array.isArray(evt.categories) ? evt.categories : db.getCategories(evt.id)
              const nominees = Array.isArray(evt.nominees) ? evt.nominees : db.getNominees(evt.id)
              const evtVotes = db.getVotes(evt.id).filter((v) => v.status === "confirmed")
              const votesCount = evtVotes.reduce((sum, v) => sum + v.quantity, 0)
              const revenue = evtVotes.reduce((sum, v) => sum + Number(v.total_amount), 0)

              const isLive = (evt.status === "published" || evt.status === "approved") && new Date(evt.end_date) > new Date()
              const isClosed = evt.status === "closed" || new Date(evt.end_date) <= new Date()

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl backdrop-blur-xl hover:border-[#C9A84C]/35 transition-all"
                >
                  <div>
                    {/* Event Banner / Logo Header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <img
                        src={evt.logo_url || evt.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=200"}
                        alt={evt.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                              isLive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : evt.status === "pending_approval"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-neutral-800 text-slate-400"
                            )}
                          >
                            {isLive ? "Active Live" : isClosed ? "Concluded" : evt.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white truncate mt-1">
                          {evt.name}
                        </h3>
                        <p className="text-[11px] font-mono text-[#C9A84C] truncate">
                          /events/{evt.slug}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-[#0e1018] border border-white/[0.05] text-xs mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Revenue</span>
                        <span className="font-extrabold text-emerald-400 text-sm">
                          {formatCurrency(revenue, evt.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Verified Votes</span>
                        <span className="font-extrabold text-[#C9A84C] text-sm">
                          {votesCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.05]">
                        <span className="text-[10px] text-slate-400 block">Nominees: {nominees.length}</span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.05]">
                        <span className="text-[10px] text-slate-400 block">Categories: {categories.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Manage Event & View Public Event */}
                  <div className="flex flex-col min-[420px]:flex-row items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <Link href={`/dashboard/events/${evt.id}`} className="w-full min-[420px]:flex-1">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-[#C9A84C] py-2.5 px-4 text-xs font-black text-[#0a0c14] shadow-md shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
                      >
                        <span>Manage Event</span>
                      </button>
                    </Link>

                    <Link href={`/events/${evt.slug}`} target="_blank" className="w-full min-[420px]:w-auto">
                      <button
                        type="button"
                        className="w-full min-[420px]:w-auto inline-flex items-center justify-center gap-1.5 rounded-full border border-white/[0.07] bg-[#0e1018] py-2.5 px-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-[#161824] transition-colors cursor-pointer"
                        title="View public event"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                        <span>Public</span>
                      </button>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
