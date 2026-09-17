"use client"

import React, { useState } from "react"
import { db } from "@/lib/db"
import { ContestCard } from "@/components/public/ContestCard"
import { Search, Trophy, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContestsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "live" | "upcoming" | "closed" | "featured">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const allContests = db.getEvents().filter((e) => e.status !== "draft")

  const filteredContests = allContests.filter((contest) => {
    const isLive = contest.status === "published" && new Date(contest.end_date) > new Date()
    const isUpcoming = contest.status === "published" && new Date(contest.start_date) > new Date()
    const isClosed = contest.status === "closed" || new Date(contest.end_date) <= new Date()
    const isFeatured = contest.is_featured

    if (activeTab === "live" && !isLive) return false
    if (activeTab === "upcoming" && !isUpcoming) return false
    if (activeTab === "closed" && !isClosed) return false
    if (activeTab === "featured" && !isFeatured) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        contest.name.toLowerCase().includes(q) ||
        (contest.description && contest.description.toLowerCase().includes(q))
      )
    }

    return true
  })

  return (
    <div className="py-12 sm:py-16 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <Trophy className="h-4 w-4" />
            <span>Event Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Contests & Awards
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Browse verified pageants, cultural competitions, and academic awards. Select a competition to view candidates and cast verified votes.
          </p>
        </div>

        {/* Filter Controls Toolbar */}
        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-full border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar">
            {(["all", "live", "featured", "upcoming", "closed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-all cursor-pointer whitespace-nowrap",
                  activeTab === tab
                    ? "bg-white text-slate-950 shadow-xs dark:bg-slate-800 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400"
                )}
              >
                {tab === "all" ? "All Contests" : tab}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-80">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="mt-8">
          {filteredContests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-16 text-center dark:border-slate-800 bg-white dark:bg-slate-900">
              <Trophy className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No contests found
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No competitions match your search filter. Try adjusting your query or switching tabs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContests.map((contest) => {
                const categories = db.getCategories(contest.id)
                const contestants = db.getNominees(contest.id)

                return (
                  <ContestCard
                    key={contest.id}
                    contest={contest}
                    categoriesCount={categories.length || 1}
                    contestantsCount={contestants.length || 2}
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
