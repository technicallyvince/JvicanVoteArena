"use client"

import React, { useState } from "react"
import { db } from "@/lib/db"
import { NomineeCard } from "@/components/public/NomineeCard"
import { VoteModal } from "@/components/public/VoteModal"
import { Search, Users, Sparkles } from "lucide-react"
import { Nominee } from "@/types/database"
import { cn } from "@/lib/utils"

export default function NomineesDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventFilter, setSelectedEventFilter] = useState("all")
  const [votingNominee, setVotingNominee] = useState<Nominee | null>(null)

  const allEvents = db.getEvents().filter((e) => e.status !== "draft")
  const allNominees = db.getNominees().filter((n) => n.status === "active")
  const allCategories = db.getCategories()

  const filteredNominees = allNominees.filter((c) => {
    if (selectedEventFilter !== "all" && c.event_id !== selectedEventFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.public_id.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
      )
    }
    return true
  })

  const currentEvent = votingNominee
    ? db.getEventById(votingNominee.event_id) || null
    : null
  const currentCategory = votingNominee
    ? db.getCategoryById(votingNominee.category_id) || null
    : null
  const currentPackages = currentEvent ? db.getVotePackages(currentEvent.id) : []

  return (
    <div className="py-12 sm:py-16 bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Nominees Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Discover Nominees
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Search nominees across all active pageants, school awards, and leadership events. Every nominee has a direct voting link and dedicated profile.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedEventFilter("all")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                selectedEventFilter === "all"
                  ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-neutral-900/90 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-neutral-800"
              )}
            >
              All Events ({allNominees.length})
            </button>
            {allEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => setSelectedEventFilter(ev.id)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                  selectedEventFilter === ev.id
                    ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                    : "bg-neutral-900/90 border border-white/[0.08] text-slate-400 hover:text-white hover:bg-neutral-800"
                )}
              >
                {ev.name}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search nominee name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/[0.08] bg-neutral-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-md"
              />
            </div>
          </div>
        </div>

        {/* Nominees Grid */}
        <div className="mt-8">
          {filteredNominees.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-16 text-center bg-neutral-900/50 backdrop-blur-md">
              <Users className="mx-auto h-12 w-12 text-neutral-600 mb-3" />
              <h3 className="text-base font-bold text-white">
                No nominees found
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No nominees match your search query. Try searching with a different keyword or nominee ID.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredNominees.map((c) => {
                const event = allEvents.find((e) => e.id === c.event_id)
                const category = allCategories.find((cat) => cat.id === c.category_id)
                const voteCount = db.getNomineeVoteCount(c.id)
                const isClosed = event?.status === "closed"

                return (
                  <NomineeCard
                    key={c.id}
                    nominee={c}
                    categoryName={category?.name || "Official Category"}
                    votePrice={event?.vote_price || 100}
                    currency={event?.currency || "NGN"}
                    voteCount={voteCount}
                    isVotingClosed={isClosed}
                    onVoteClick={(nom) => setVotingNominee(nom)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Voting Modal */}
      {votingNominee && currentEvent && (
        <VoteModal
          isOpen={!!votingNominee}
          onClose={() => setVotingNominee(null)}
          nominee={votingNominee}
          event={currentEvent}
          category={currentCategory}
          packages={currentPackages}
        />
      )}
    </div>
  )
}
