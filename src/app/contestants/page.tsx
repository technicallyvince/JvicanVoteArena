"use client"

import React, { useState } from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { ContestantCard } from "@/components/public/ContestantCard"
import { VoteModal } from "@/components/public/VoteModal"
import { Search, Users } from "lucide-react"
import { Nominee } from "@/types/database"
import { cn } from "@/lib/utils"

export default function ContestantsDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContestFilter, setSelectedContestFilter] = useState("all")
  const [votingContestant, setVotingContestant] = useState<Nominee | null>(null)

  const allContests = db.getEvents().filter((e) => e.status !== "draft")
  const allContestants = db.getNominees().filter((n) => n.status === "active")
  const allCategories = db.getCategories()

  const filteredContestants = allContestants.filter((c) => {
    if (selectedContestFilter !== "all" && c.event_id !== selectedContestFilter) return false
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

  const currentContest = votingContestant
    ? db.getEventById(votingContestant.event_id) || null
    : null
  const currentCategory = votingContestant
    ? db.getCategoryById(votingContestant.category_id) || null
    : null
  const currentPackages = currentContest ? db.getVotePackages(currentContest.id) : []

  return (
    <div className="py-12 sm:py-16 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <Users className="h-4 w-4" />
            <span>Contenders & Nominees</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Discover Contestants
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Search candidates across all active pageants, school awards, and leadership competitions. Every candidate has a direct voting link and dedicated profile.
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedContestFilter("all")}
              className={cn(
                "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                selectedContestFilter === "all"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              )}
            >
              All Contests ({allContestants.length})
            </button>
            {allContests.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setSelectedContestFilter(ct.id)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                  selectedContestFilter === ct.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                )}
              >
                {ct.name}
              </button>
            ))}
          </div>

          <div className="w-full sm:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contestant name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Contestants Grid */}
        <div className="mt-8">
          {filteredContestants.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
              <Users className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No contestants found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No candidates match your search query. Try searching with a different keyword or candidate ID.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContestants.map((c) => {
                const contest = allContests.find((e) => e.id === c.event_id)
                const category = allCategories.find((cat) => cat.id === c.category_id)
                const voteCount = db.getNomineeVoteCount(c.id)
                const isClosed = contest?.status === "closed"

                return (
                  <ContestantCard
                    key={c.id}
                    contestant={c}
                    categoryName={category?.name || "Official Category"}
                    votePrice={contest?.vote_price || 100}
                    currency={contest?.currency || "NGN"}
                    voteCount={voteCount}
                    isVotingClosed={isClosed}
                    onVoteClick={(nom) => setVotingContestant(nom)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Voting Modal */}
      {votingContestant && currentContest && (
        <VoteModal
          isOpen={!!votingContestant}
          onClose={() => setVotingContestant(null)}
          contestant={votingContestant}
          contest={currentContest}
          category={currentCategory}
          packages={currentPackages}
        />
      )}
    </div>
  )
}
