"use client"

import React, { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { ContestantCard } from "@/components/public/ContestantCard"
import { VoteModal } from "@/components/public/VoteModal"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Nominee } from "@/types/database"
import {
  Calendar,
  Trophy,
  Share2,
  Users,
  BarChart3,
  Layers,
  CheckCircle2,
  Clock,
  Heart,
  ArrowRight,
  ShieldCheck,
  Award,
  Vote,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function ContestDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const contest = db.getEventBySlug(slug)
  if (!contest || contest.status === "draft") {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<"overview" | "contestants" | "leaderboard" | "results">("contestants")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all")
  const [votingContestant, setVotingContestant] = useState<Nominee | null>(null)
  const [copied, setCopied] = useState(false)

  const categories = db.getCategories(contest.id)
  const contestants = db.getNominees(contest.id)
  const packages = db.getVotePackages(contest.id)
  const leaderboard = db.getLeaderboard(
    contest.id,
    selectedCategoryFilter === "all" ? undefined : selectedCategoryFilter
  )

  const isLive = contest.status === "published" && new Date(contest.end_date) > new Date()
  const isUpcoming = contest.status === "published" && new Date(contest.start_date) > new Date()
  const isClosed = contest.status === "closed" || new Date(contest.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(contest.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const totalVotesCast = db
    .getVotes(contest.id)
    .filter((v) => v.status === "confirmed")
    .reduce((sum, v) => sum + v.quantity, 0)

  const handleShare = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: contest.name,
          text: `Vote for your favorite contenders in ${contest.name}!`,
          url: shareUrl,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const filteredContestants = contestants.filter((c) => {
    if (selectedCategoryFilter === "all") return true
    return c.category_id === selectedCategoryFilter
  })

  // Top 3 Podium for Leaderboard
  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]
  const remainingLeaderboard = leaderboard.slice(3)

  return (
    <div className="min-h-screen pb-24 bg-[#fafafa] dark:bg-[#090d16]">
      {/* 1. CONTEST HERO HEADER */}
      <div className="relative overflow-hidden bg-slate-950 text-white">
        {/* Cover Photo Backdrop */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={
              contest.cover_image_url ||
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
            }
            alt={contest.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-black/30" />
        </div>

        {/* Floating Contest Info Container */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-28 sm:-mt-36 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 border border-amber-500/30">
                  JVican Vote Arena
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md">
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    LIVE VOTING
                  </span>
                )}
                {isClosed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-200 border border-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    CONCLUDED
                  </span>
                )}
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md">
                  {categories.length} {categories.length === 1 ? "Category" : "Categories"}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md">
                  {contestants.length} Nominees
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {contest.name}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {contest.description}
              </p>

              {/* Metadata Highlights */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  {isClosed ? `Concluded on ${formatDate(contest.end_date)}` : `Closing in ${daysLeft} days`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Vote className="h-4 w-4 text-emerald-400" />
                  {formatCurrency(contest.vote_price, contest.currency)} per vote
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  {totalVotesCast.toLocaleString()} Total Votes Cast
                </span>
              </div>
            </div>

            {/* Actions: Share */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="border-slate-700 bg-slate-900/80 text-white hover:bg-slate-800 rounded-full px-5 text-xs font-bold gap-2"
              >
                <Share2 className="h-4 w-4 text-blue-400" />
                <span>{copied ? "Link Copied!" : "Share Contest"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTEST NAVIGATION TABS */}
      <div className="sticky top-16 sm:top-20 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#090d16]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setActiveTab("contestants")}
              className={cn(
                "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap",
                activeTab === "contestants"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              )}
            >
              Contestants ({contestants.length})
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={cn(
                "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                activeTab === "leaderboard"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              )}
            >
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap",
                activeTab === "overview"
                  ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
              )}
            >
              Overview & Rules
            </button>

            {isClosed && (
              <button
                onClick={() => setActiveTab("results")}
                className={cn(
                  "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  activeTab === "results"
                    ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25"
                    : "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-slate-800"
                )}
              >
                <Award className="h-3.5 w-3.5" />
                Certified Results
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* TAB A: CONTESTANTS */}
        {activeTab === "contestants" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                    selectedCategoryFilter === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  )}
                >
                  All Categories ({contestants.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                      selectedCategoryFilter === cat.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Contestant Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredContestants.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const voteCount = db.getNomineeVoteCount(c.id)

                return (
                  <ContestantCard
                    key={c.id}
                    contestant={c}
                    categoryName={category?.name || "Official Category"}
                    votePrice={contest.vote_price}
                    currency={contest.currency}
                    voteCount={voteCount}
                    isVotingClosed={isClosed}
                    onVoteClick={(nom) => setVotingContestant(nom)}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* TAB B: LEADERBOARD & PODIUM */}
        {activeTab === "leaderboard" && (
          <div className="space-y-10">
            {/* Category Filter for Leaderboard */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                    selectedCategoryFilter === "all"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                      selectedCategoryFilter === cat.id
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Visual Podium for Top 3 (Desktop & Tablet) */}
            {leaderboard.length >= 2 && (
              <div className="hidden sm:grid grid-cols-3 gap-4 items-end max-w-3xl mx-auto pt-6 pb-2">
                {/* #2 Rank Card */}
                {top2 && (
                  <div className="flex flex-col items-center text-center p-5 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-md">
                    <div className="relative mb-3">
                      <img
                        src={top2.nominee_image || undefined}
                        alt={top2.nominee_name}
                        className="h-20 w-20 rounded-2xl object-cover ring-4 ring-slate-200 dark:ring-slate-700"
                      />
                      <span className="absolute -bottom-2 -right-1 rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-black text-slate-900 shadow-md">
                        #2
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                      {top2.nominee_name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{top2.category_name}</span>
                    <div className="mt-2 rounded-xl bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:text-white">
                      {top2.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}

                {/* #1 Champion Tall Center Card */}
                {top1 && (
                  <div className="flex flex-col items-center text-center p-6 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 via-white to-white dark:via-slate-900 dark:to-slate-900 shadow-xl relative -mt-4">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase text-slate-950 shadow-md flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Leader #01
                    </div>
                    <div className="relative mb-3 mt-1">
                      <img
                        src={top1.nominee_image || undefined}
                        alt={top1.nominee_name}
                        className="h-24 w-24 rounded-2xl object-cover ring-4 ring-amber-400 shadow-lg"
                      />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                      {top1.nominee_name}
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold line-clamp-1">
                      {top1.category_name}
                    </span>
                    <div className="mt-3 rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-black text-slate-950 shadow-xs">
                      {top1.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}

                {/* #3 Rank Card */}
                {top3 && (
                  <div className="flex flex-col items-center text-center p-5 rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-md">
                    <div className="relative mb-3">
                      <img
                        src={top3.nominee_image || undefined}
                        alt={top3.nominee_name}
                        className="h-20 w-20 rounded-2xl object-cover ring-4 ring-amber-700/40"
                      />
                      <span className="absolute -bottom-2 -right-1 rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                        #3
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white line-clamp-1">
                      {top3.nominee_name}
                    </span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{top3.category_name}</span>
                    <div className="mt-2 rounded-xl bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-900 dark:bg-slate-800 dark:text-white">
                      {top3.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Ranked Standings List */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
                Current Verified Standings
              </h3>

              <div className="space-y-3">
                {leaderboard.map((item, idx) => {
                  const maxVotes = top1?.vote_count || 1
                  const percentage = Math.round((item.vote_count / maxVotes) * 100)

                  return (
                    <div
                      key={item.nominee_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/80 border border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                            idx === 0
                              ? "bg-amber-400 text-slate-950"
                              : idx === 1
                              ? "bg-slate-200 text-slate-900"
                              : idx === 2
                              ? "bg-amber-700 text-white"
                              : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          )}
                        >
                          #{idx + 1}
                        </span>

                        <img
                          src={item.nominee_image || undefined}
                          alt={item.nominee_name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                              {item.nominee_name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{item.public_id}
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {item.category_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900 dark:text-white block">
                            {item.vote_count.toLocaleString()} Votes
                          </span>
                          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                            {percentage}% of leader
                          </span>
                        </div>

                        {!isClosed && (
                          <Link href={`/contestant/${item.public_id}`}>
                            <Button size="sm" variant="primary" className="rounded-xl text-xs font-bold px-4">
                              Vote
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB C: OVERVIEW & RULES */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-3">
                  About This Competition
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {contest.description}
                </p>

                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-6 mb-2">
                  Voting Integrity & Rules
                </h4>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside leading-relaxed">
                  <li>Each vote is priced authoritatively at {formatCurrency(contest.vote_price, contest.currency)}.</li>
                  <li>Supporters can vote multiple times across any category to back their candidate.</li>
                  <li>All payments are processed securely through TransactPay with immediate email receipts.</li>
                  <li>Live leaderboard results update in real-time until the official closing date.</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Event Quick Facts
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Status</span>
                    <span className="font-bold text-emerald-600 uppercase">{contest.status}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Start Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(contest.start_date)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">End Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDate(contest.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vote Price</span>
                    <span className="font-extrabold text-blue-600">{formatCurrency(contest.vote_price, contest.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: CERTIFIED RESULTS */}
        {activeTab === "results" && isClosed && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-tr from-amber-500/10 via-white to-white p-8 dark:via-slate-900 dark:to-slate-900 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
                <Award className="h-4 w-4" />
                <span>Certified Official Standings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Official Crown Winner
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Voting concluded on {formatDate(contest.end_date)}. The tallies below have been audited and certified.
              </p>

              {top1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/50">
                  <img
                    src={top1.nominee_image || undefined}
                    alt={top1.nominee_name}
                    className="h-28 w-28 rounded-2xl object-cover ring-4 ring-amber-400"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <span className="rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase text-slate-950">
                      Overall Title Holder
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                      {top1.nominee_name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {top1.category_name} • Candidate #{top1.public_id}
                    </p>
                    <div className="pt-2 text-sm font-black text-blue-600 dark:text-blue-400">
                      {top1.vote_count.toLocaleString()} Certified Final Votes
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Voting Modal */}
      {votingContestant && (
        <VoteModal
          isOpen={!!votingContestant}
          onClose={() => setVotingContestant(null)}
          contestant={votingContestant}
          contest={contest}
          category={categories.find((c) => c.id === votingContestant.category_id) || null}
          packages={packages}
        />
      )}
    </div>
  )
}
