"use client"

import React, { useState } from "react"
import { db } from "@/lib/db"
import { EventCard } from "@/components/public/EventCard"
import { DottedGrid } from "@/components/obsidian/DottedGrid"
import { Search, Trophy, Sparkles, Flame, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function EventsDiscoveryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "completed">("all")
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const allEvents = db.getEvents().filter((e) => e.status !== "draft")

  const filteredEvents = allEvents.filter((event) => {
    const isLive = event.status === "published" && new Date(event.end_date) > new Date()
    const isUpcoming = event.status === "published" && new Date(event.start_date) > new Date()
    const isCompleted = event.status === "closed" || new Date(event.end_date) <= new Date()

    if (activeTab === "live" && !isLive) return false
    if (activeTab === "upcoming" && !isUpcoming) return false
    if (activeTab === "completed" && !isCompleted) return false

    // Filter by type keywords
    if (selectedCategoryType !== "all") {
      const qType = selectedCategoryType.toLowerCase()
      const eventMatches =
        event.name.toLowerCase().includes(qType) ||
        (event.description && event.description.toLowerCase().includes(qType))
      if (!eventMatches) return false
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        event.name.toLowerCase().includes(q) ||
        (event.description && event.description.toLowerCase().includes(q))
      )
    }

    return true
  })

  return (
    <div className="relative overflow-hidden bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28 pb-20 selection:bg-[#f59e0b] selection:text-black">
      {/* Background Dotted Canvas */}
      <DottedGrid className="opacity-15" />

      {/* Glow gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-amber-600/5 to-transparent blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Event Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Explore Events &amp; Awards
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Browse verified pageants, cultural competitions, and academic awards. Select an event to explore nominees and cast cryptographically verified votes.
          </p>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-10 space-y-4 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-full border border-white/[0.08] overflow-x-auto no-scrollbar shadow-lg shadow-black/20">
              {[
                { id: "all", label: "All Events" },
                { id: "live", label: "Active Now" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search events or nominees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-white/[0.08] bg-neutral-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Secondary Filter by Event Type: Pageantry, Awards, Cultural, University */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Type:</span>
            {[
              { id: "all", label: "All Types" },
              { id: "pageant", label: "Pageantry" },
              { id: "award", label: "Awards" },
              { id: "culture", label: "Cultural" },
              { id: "university", label: "University" },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedCategoryType(type.id)}
                className={cn(
                  "px-3.5 py-1 text-xs font-semibold rounded-full border transition-all cursor-pointer whitespace-nowrap",
                  selectedCategoryType === type.id
                    ? "border-amber-400 bg-amber-400/10 text-amber-400 font-bold"
                    : "border-white/[0.06] bg-neutral-900 text-slate-400 hover:text-white"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {filteredEvents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center bg-neutral-900/50 backdrop-blur-md">
              <Trophy className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white">
                No events found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No events match your filter criteria. Try selecting "All Events" or clearing the search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const categories = db.getCategories(event.id)
                const nominees = db.getNominees(event.id)

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    categoriesCount={categories.length || 1}
                    nomineesCount={nominees.length || 2}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
