"use client"

import React, { useState } from "react"
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
  const [filter, setFilter] = useState<"all" | "active" | "upcoming" | "completed">("all")
  const events = db.getEvents()

  const filteredEvents = events.filter((e) => {
    const isLive = e.status === "published" && new Date(e.end_date) > new Date()
    const isUpcoming = e.status === "published" && new Date(e.start_date) > new Date()
    const isCompleted = e.status === "closed" || new Date(e.end_date) <= new Date()

    if (filter === "active" && !isLive) return false
    if (filter === "upcoming" && !isUpcoming) return false
    if (filter === "completed" && !isCompleted) return false
    return true
  })

  return (
    <div className="py-8 sm:py-12 bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-white font-bold">Events Portfolio</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Event Management</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Organizer Events
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage your active voting events, configure categories &amp; nominees, and inspect transaction ledgers.
            </p>
          </div>

          <Link href="/dashboard/events/new">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 text-xs font-black text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Create New Event</span>
            </button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 pb-4 mb-6 border-b border-white/[0.08] overflow-x-auto no-scrollbar">
          {(["all", "active", "upcoming", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full capitalize transition-all cursor-pointer whitespace-nowrap",
                filter === tab
                  ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
              )}
            >
              {tab === "all" ? "All Events" : tab === "active" ? "Active Events" : tab === "upcoming" ? "Upcoming" : "Completed"} ({
                events.filter((e) => {
                  const isLive = e.status === "published" && new Date(e.end_date) > new Date()
                  const isUpcoming = e.status === "published" && new Date(e.start_date) > new Date()
                  const isCompleted = e.status === "closed" || new Date(e.end_date) <= new Date()
                  if (tab === "active") return isLive
                  if (tab === "upcoming") return isUpcoming
                  if (tab === "completed") return isCompleted
                  return true
                }).length
              })
            </button>
          ))}
        </div>

        {/* Events Grid / Portfolio */}
        {filteredEvents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center bg-neutral-900/40">
            <Trophy className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
            <h3 className="text-base font-bold text-white">No events found</h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">No events in this category.</p>
            <Link href="/dashboard/events/new">
              <button className="rounded-full bg-amber-500 px-5 py-2 text-xs font-black text-neutral-950 hover:bg-amber-400">
                Create Event
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => {
              const categories = db.getCategories(evt.id)
              const nominees = db.getNominees(evt.id)
              const evtVotes = db.getVotes(evt.id).filter((v) => v.status === "confirmed")
              const votesCount = evtVotes.reduce((sum, v) => sum + v.quantity, 0)
              const revenue = evtVotes.reduce((sum, v) => sum + Number(v.total_amount), 0)

              const isLive = evt.status === "published" && new Date(evt.end_date) > new Date()
              const isClosed = evt.status === "closed" || new Date(evt.end_date) <= new Date()

              return (
                <div
                  key={evt.id}
                  className="flex flex-col justify-between rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 shadow-xl backdrop-blur-xl hover:border-amber-400/30 transition-all"
                >
                  <div>
                    {/* Event Banner / Logo Header */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <img
                        src={evt.logo_url || evt.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=200"}
                        alt={evt.name}
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase",
                              isLive
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-neutral-800 text-slate-400"
                            )}
                          >
                            {isLive ? "Active Live" : isClosed ? "Concluded" : evt.status}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-white truncate mt-1">
                          {evt.name}
                        </h3>
                        <p className="text-[11px] font-mono text-amber-400 truncate">
                          /events/{evt.slug}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-neutral-900/80 border border-white/[0.05] text-xs mb-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Revenue</span>
                        <span className="font-extrabold text-emerald-400 text-sm">
                          {formatCurrency(revenue, evt.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-bold">Verified Votes</span>
                        <span className="font-extrabold text-amber-400 text-sm">
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
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                    <Link href={`/dashboard/events/${evt.id}`} className="flex-1">
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-500 py-2.5 px-4 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
                      >
                        <span>Manage Event</span>
                      </button>
                    </Link>

                    <Link href={`/events/${evt.slug}`} target="_blank">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/[0.08] bg-neutral-900 py-2.5 px-4 text-xs font-bold text-slate-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
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
