"use client"

import React, { useState, useEffect } from "react"
import { db } from "@/lib/db"
import { NomineeCard } from "@/components/public/NomineeCard"
import { VoteModal } from "@/components/public/VoteModal"
import { Search, Users, Sparkles, X } from "lucide-react"
import { Nominee } from "@/types/database"
import { cn } from "@/lib/utils"

export default function NomineesDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedEventFilter, setSelectedEventFilter] = useState("all")
  const [votingNominee, setVotingNominee] = useState<Nominee | null>(null)

  const [allEvents, setAllEvents] = useState<any[]>([])
  const [allNominees, setAllNominees] = useState<any[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/events", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.events)) {
          const publishedEvents = data.events.filter((e: any) => e.status === "published" || e.status === "approved")
          setAllEvents(publishedEvents)
          const noms: any[] = []
          const cats: any[] = []
          publishedEvents.forEach((e: any) => {
            if (Array.isArray(e.nominees)) noms.push(...e.nominees)
            if (Array.isArray(e.categories)) cats.push(...e.categories)
          })
          setAllNominees(noms)
          setAllCategories(cats)
        }
      })
      .catch((err) => console.error("Error fetching nominees:", err))
      .finally(() => setIsLoading(false))
  }, [])

  const filteredNominees = allNominees.filter((c) => {
    if (selectedEventFilter !== "all" && c.event_id !== selectedEventFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const category = allCategories.find((cat) => cat.id === c.category_id)
      const event = allEvents.find((e) => e.id === c.event_id)

      const matchesName = c.name?.toLowerCase().includes(q)
      const matchesPublicId = c.public_id?.toLowerCase().includes(q)
      const matchesBio = c.description ? c.description.toLowerCase().includes(q) : false
      const matchesCategory = category ? category.name?.toLowerCase().includes(q) : false
      const matchesEvent = event ? event.name?.toLowerCase().includes(q) : false

      return matchesName || matchesPublicId || matchesBio || matchesCategory || matchesEvent
    }
    return true
  })

  const currentEvent = votingNominee
    ? allEvents.find((e) => e.id === votingNominee.event_id) || db.getEventById(votingNominee.event_id) || null
    : null
  const currentCategory = votingNominee
    ? allCategories.find((cat) => cat.id === votingNominee.category_id) || db.getCategoryById(votingNominee.category_id) || null
    : null
  const currentPackages = currentEvent ? currentEvent.packages || db.getVotePackages(currentEvent.id) : []

  const handleClearSearch = () => {
    setSearchQuery("")
  }

  return (
    <div className="py-10 sm:py-16 bg-[#050608] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Nominees Directory</span>
          </div>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-black text-white tracking-tight">
            Discover Nominees
          </h1>
          <p className="mt-3 text-xs sm:text-base text-slate-400 leading-relaxed">
            Search nominees across all active pageants, school awards, and leadership events. Every nominee has a direct voting link and dedicated profile.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
            <button
              onClick={() => setSelectedEventFilter("all")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                selectedEventFilter === "all"
                  ? "bg-[#C9A84C] text-[#0a0c14] font-black shadow-md shadow-[#C9A84C]/20"
                  : "bg-[#0e1018] border border-white/[0.07] text-slate-400 hover:text-white hover:bg-[#161824]"
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
                    ? "bg-[#C9A84C] text-[#0a0c14] font-black shadow-md shadow-[#C9A84C]/20"
                    : "bg-[#0e1018] border border-white/[0.07] text-slate-400 hover:text-white hover:bg-[#161824]"
                )}
              >
                {ev.name}
              </button>
            ))}
          </div>

          {/* Search Bar with Button */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 w-full lg:w-auto"
          >
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search nominee name, ID, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-white/[0.08] bg-[#0e1018] pl-10 pr-9 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-[#C9A84C] focus:outline-none focus:ring-1 focus:ring-[#C9A84C] shadow-md"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black text-[#0a0c14] shadow-md shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer shrink-0"
            >
              <Search className="h-3.5 w-3.5 text-[#0a0c14]" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Nominees Grid */}
        <div className="mt-8">
          {filteredNominees.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 p-12 sm:p-16 text-center bg-[#0a0c14] backdrop-blur-md">
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
