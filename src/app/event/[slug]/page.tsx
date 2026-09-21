"use client"

import React, { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { NomineeCard } from "@/components/public/NomineeCard"
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

export default function EventDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const event = db.getEventBySlug(slug)
  if (!event || event.status === "draft") {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<"overview" | "nominees" | "leaderboard" | "results">("nominees")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all")
  const [votingNominee, setVotingNominee] = useState<Nominee | null>(null)
  const [copied, setCopied] = useState(false)

  const categories = db.getCategories(event.id)
  const nominees = db.getNominees(event.id)
  const packages = db.getVotePackages(event.id)
  const leaderboard = db.getLeaderboard(
    event.id,
    selectedCategoryFilter === "all" ? undefined : selectedCategoryFilter
  )

  const isLive = event.status === "published" && new Date(event.end_date) > new Date()
  const isUpcoming = event.status === "published" && new Date(event.start_date) > new Date()
  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const totalVotesCast = db
    .getVotes(event.id)
    .filter((v) => v.status === "confirmed")
    .reduce((sum, v) => sum + v.quantity, 0)

  const handleShare = async () => {
    const shareUrl = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.name,
          text: `Vote for your favorite nominees in ${event.name}!`,
          url: shareUrl,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const filteredNominees = nominees.filter((c) => {
    if (selectedCategoryFilter === "all") return true
    return c.category_id === selectedCategoryFilter
  })

  // Top 3 Podium for Leaderboard
  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]
  const remainingLeaderboard = leaderboard.slice(3)

  return (
    <div className="min-h-screen pb-24 bg-[#080808] text-white">
      {/* 1. EVENT HERO HEADER WITH OBSIDIAN GLOW */}
      <div className="relative overflow-hidden bg-[#080808] text-white pt-20 sm:pt-24">
        {/* Cover Photo Backdrop with Gradient Blend */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={
              event.cover_image_url ||
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
            }
            alt={event.name}
            className="h-full w-full object-cover brightness-[0.75]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-transparent" />
        </div>

        {/* Floating Event Info Container */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-28 sm:-mt-36 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-400 border border-amber-500/30 backdrop-blur-md">
                  JVican Vote Arena
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE VOTING
                  </span>
                )}
                {isClosed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-800/90 px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 border border-white/10 backdrop-blur-md">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    CONCLUDED
                  </span>
                )}
                <span className="rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md border border-white/5">
                  {categories.length} {categories.length === 1 ? "Category" : "Categories"}
                </span>
                <span className="rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold text-slate-200 backdrop-blur-md border border-white/5">
                  {nominees.length} Nominees
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {event.name}
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
                {event.description}
              </p>

              {/* Metadata Highlights */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-[#ff5500]" />
                  {isClosed ? `Concluded on ${formatDate(event.end_date)}` : `Closing in ${daysLeft} days`}
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5">
                  <Vote className="h-4 w-4 text-emerald-400" />
                  {formatCurrency(event.vote_price, event.currency)} per vote
                </span>
                <span className="text-white/20">•</span>
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Trophy className="h-4 w-4 text-[#ff5500]" />
                  {totalVotesCast.toLocaleString()} Verified Votes Cast
                </span>
              </div>
            </div>

            {/* Actions: Share */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 rounded-full border border-white/[0.1] bg-neutral-900/90 hover:bg-neutral-800 text-white px-5 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-lg hover:border-[#ff5500]/40"
              >
                <Share2 className="h-4 w-4 text-[#ff5500]" />
                <span>{copied ? "Link Copied!" : "Share Event"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EVENT NAVIGATION TABS */}
      <div className="sticky top-16 sm:top-20 z-30 border-b border-white/[0.08] bg-[#080808]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            <button
              onClick={() => setActiveTab("nominees")}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                activeTab === "nominees"
                  ? "bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Nominees ({nominees.length})
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                activeTab === "leaderboard"
                  ? "bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Trophy className="h-3.5 w-3.5" />
              Leaderboard
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                activeTab === "overview"
                  ? "bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              Overview &amp; Rules
            </button>

            {isClosed && (
              <button
                onClick={() => setActiveTab("results")}
                className={cn(
                  "px-5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  activeTab === "results"
                    ? "bg-[#ff5500] text-white font-bold shadow-md shadow-[#ff5500]/25"
                    : "text-[#ff8c42] hover:bg-[#ff5500]/10"
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
        {/* TAB A: NOMINEES */}
        {activeTab === "nominees" && (
          <div className="space-y-6">
            {/* Category Filter Pills */}
            {categories.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={cn(
                    "px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                    selectedCategoryFilter === "all"
                      ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                      : "bg-neutral-900/90 text-slate-300 border border-white/[0.08] hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  All Categories ({nominees.length})
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={cn(
                      "px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                      selectedCategoryFilter === cat.id
                        ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                        : "bg-neutral-900/90 text-slate-300 border border-white/[0.08] hover:bg-neutral-800 hover:text-white"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {/* Nominee Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredNominees.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const voteCount = db.getNomineeVoteCount(c.id)

                return (
                  <NomineeCard
                    key={c.id}
                    nominee={c}
                    categoryName={category?.name || "Official Category"}
                    votePrice={event.vote_price}
                    currency={event.currency}
                    voteCount={voteCount}
                    isVotingClosed={isClosed}
                    onVoteClick={(nom) => setVotingNominee(nom)}
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
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={cn(
                    "px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                    selectedCategoryFilter === "all"
                      ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                      : "bg-neutral-900/90 text-slate-300 border border-white/[0.08] hover:bg-neutral-800 hover:text-white"
                  )}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={cn(
                      "px-4.5 py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                      selectedCategoryFilter === cat.id
                        ? "bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20"
                        : "bg-neutral-900/90 text-slate-300 border border-white/[0.08] hover:bg-neutral-800 hover:text-white"
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
                  <div className="flex flex-col items-center text-center p-5 rounded-3xl border border-white/[0.08] bg-[#0c101b]/90 backdrop-blur-xl shadow-xl">
                    <div className="relative mb-3">
                      <img
                        src={top2.nominee_image || undefined}
                        alt={top2.nominee_name}
                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-slate-400"
                      />
                      <span className="absolute -bottom-2 -right-1 rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-black text-slate-950 shadow-md">
                        #2
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-white line-clamp-1">
                      {top2.nominee_name}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{top2.category_name}</span>
                    <div className="mt-2 rounded-xl bg-neutral-900 px-3 py-1 text-xs font-extrabold text-slate-300 border border-white/5">
                      {top2.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}

                {/* #1 Champion Tall Center Card */}
                {top1 && (
                  <div className="flex flex-col items-center text-center p-6 rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/15 via-[#0c101b] to-[#0c101b] shadow-2xl relative -mt-4 ring-4 ring-amber-400/10">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase text-neutral-950 shadow-md flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      Leader #01
                    </div>
                    <div className="relative mb-3 mt-1">
                      <img
                        src={top1.nominee_image || undefined}
                        alt={top1.nominee_name}
                        className="h-24 w-24 rounded-2xl object-cover ring-4 ring-amber-400 shadow-xl"
                      />
                    </div>
                    <span className="text-sm font-black text-white line-clamp-1">
                      {top1.nominee_name}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold line-clamp-1">
                      {top1.category_name}
                    </span>
                    <div className="mt-3 rounded-xl bg-amber-400 px-4 py-1.5 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/20">
                      {top1.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}

                {/* #3 Rank Card */}
                {top3 && (
                  <div className="flex flex-col items-center text-center p-5 rounded-3xl border border-white/[0.08] bg-[#0c101b]/90 backdrop-blur-xl shadow-xl">
                    <div className="relative mb-3">
                      <img
                        src={top3.nominee_image || undefined}
                        alt={top3.nominee_name}
                        className="h-20 w-20 rounded-2xl object-cover ring-2 ring-amber-700/60"
                      />
                      <span className="absolute -bottom-2 -right-1 rounded-full bg-amber-700 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                        #3
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-white line-clamp-1">
                      {top3.nominee_name}
                    </span>
                    <span className="text-[11px] text-slate-400 line-clamp-1">{top3.category_name}</span>
                    <div className="mt-2 rounded-xl bg-neutral-900 px-3 py-1 text-xs font-extrabold text-slate-300 border border-white/5">
                      {top3.vote_count.toLocaleString()} Votes
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Ranked Standings List */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/90 p-4 sm:p-6 shadow-xl backdrop-blur-xl">
              <h3 className="text-base font-extrabold text-white mb-4">
                Current Verified Standings
              </h3>

              <div className="space-y-3">
                {leaderboard.map((item, idx) => {
                  const maxVotes = top1?.vote_count || 1
                  const percentage = Math.round((item.vote_count / maxVotes) * 100)

                  return (
                    <div
                      key={item.nominee_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-neutral-900/80 border border-white/[0.06] hover:border-amber-400/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                            idx === 0
                              ? "bg-amber-400 text-neutral-950 font-black"
                              : idx === 1
                              ? "bg-slate-300 text-slate-950 font-black"
                              : idx === 2
                              ? "bg-amber-700 text-white font-black"
                              : "bg-neutral-800 text-slate-400 border border-white/5"
                          )}
                        >
                          #{idx + 1}
                        </span>

                        <img
                          src={item.nominee_image || undefined}
                          alt={item.nominee_name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                        />

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-white">
                              {item.nominee_name}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400">
                              #{item.public_id}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {item.category_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="text-right">
                          <span className="text-sm font-black text-white block">
                            {item.vote_count.toLocaleString()} Votes
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {percentage}% of leader
                          </span>
                        </div>

                        {!isClosed && (
                          <Link href={`/nominee/${item.public_id}`}>
                            <button
                              type="button"
                              className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-neutral-950 hover:bg-amber-400 transition-colors shadow-xs"
                            >
                              Vote
                            </button>
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
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
                <h3 className="text-lg font-extrabold text-white mb-3">
                  About This Competition
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                <h4 className="text-sm font-extrabold text-white mt-6 mb-2">
                  Voting Integrity & Rules
                </h4>
                <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside leading-relaxed">
                  <li>Each vote is priced authoritatively at {formatCurrency(event.vote_price, event.currency)}.</li>
                  <li>Supporters can vote multiple times across any category to back their candidate.</li>
                  <li>All payments are processed securely through TransactPay with immediate email receipts.</li>
                  <li>Live leaderboard results update in real-time until the official closing date.</li>
                </ul>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/90 p-6 shadow-xl backdrop-blur-xl">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 mb-3">
                  Event Quick Facts
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-slate-400">Status</span>
                    <span className="font-bold text-emerald-400 uppercase">{event.status}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-slate-400">Start Date</span>
                    <span className="font-semibold text-white">{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-slate-400">End Date</span>
                    <span className="font-semibold text-white">{formatDate(event.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vote Price</span>
                    <span className="font-extrabold text-amber-400">{formatCurrency(event.vote_price, event.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: CERTIFIED RESULTS */}
        {activeTab === "results" && isClosed && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-tr from-amber-500/10 via-[#0c101b] to-[#0c101b] p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                <Award className="h-4 w-4" />
                <span>Certified Official Standings</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Official Crown Winner
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Voting concluded on {formatDate(event.end_date)}. The tallies below have been audited and certified.
              </p>

              {top1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-neutral-900/90 border border-amber-400/30">
                  <img
                    src={top1.nominee_image || undefined}
                    alt={top1.nominee_name}
                    className="h-28 w-28 rounded-2xl object-cover ring-4 ring-amber-400"
                  />
                  <div className="text-center sm:text-left space-y-1">
                    <span className="rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black uppercase text-neutral-950">
                      Overall Title Holder
                    </span>
                    <h3 className="text-2xl font-black text-white">
                      {top1.nominee_name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {top1.category_name} • Candidate #{top1.public_id}
                    </p>
                    <div className="pt-2 text-sm font-black text-amber-400">
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
      {votingNominee && (
        <VoteModal
          isOpen={!!votingNominee}
          onClose={() => setVotingNominee(null)}
          nominee={votingNominee}
          event={event}
          category={categories.find((c) => c.id === votingNominee.category_id) || null}
          packages={packages}
        />
      )}
    </div>
  )
}
