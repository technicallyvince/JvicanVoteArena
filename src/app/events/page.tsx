"use client"

import React, { useState } from "react"
import { db } from "@/lib/db"
import { EventCard } from "@/components/public/EventCard"
import { DottedGrid } from "@/components/obsidian/DottedGrid"
import { Search, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

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

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "closed" | "featured">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const allEvents = db.getEvents().filter((e) => e.status !== "draft")

  const filteredEvents = allEvents.filter((event) => {
    const isLive = event.status === "published" && new Date(event.end_date) > new Date()
    const isUpcoming = event.status === "published" && new Date(event.start_date) > new Date()
    const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()
    const isFeatured = event.is_featured

    if (activeTab === "live" && !isLive) return false
    if (activeTab === "upcoming" && !isUpcoming) return false
    if (activeTab === "closed" && !isClosed) return false
    if (activeTab === "featured" && !isFeatured) return false

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
    <div className="relative overflow-hidden bg-[#080808] min-h-screen text-white pt-24 sm:pt-28 pb-20">
      {/* Background Dotted Canvas */}
      <DottedGrid className="opacity-20" />

      {/* Glow gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#ff5500]/10 via-[#ff8c42]/5 to-transparent blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-3 backdrop-blur-md">
            <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
            <span>Event Arena</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
            Explore Events &amp; Awards
          </h1>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl">
            Browse verified pageants, cultural competitions, and academic awards. Select an event to explore nominees and cast cryptographically verified votes.
          </p>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-900/90 rounded-full border border-white/[0.08] overflow-x-auto no-scrollbar shadow-lg shadow-black/20">
            {(["all", "live", "featured", "upcoming", "closed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full capitalize transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab
                    ? "bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {tab === "all" ? "All Events" : tab === "live" ? "🔥 Live Now" : tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search events or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/[0.08] bg-neutral-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-[#ff5500] focus:outline-none focus:ring-2 focus:ring-[#ff5500]/20 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {filteredEvents.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/10 p-16 text-center bg-neutral-900/50 backdrop-blur-md">
              <Trophy className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white">
                No events found
              </h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                No events match your search filter. Try adjusting your query or selecting another tab.
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
