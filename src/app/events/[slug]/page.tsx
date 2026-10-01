"use client"

import React, { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { NomineeCard } from "@/components/public/NomineeCard"
import { VoteModal } from "@/components/public/VoteModal"
import { ApplyNomineeModal } from "@/components/public/ApplyNomineeModal"
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
  ArrowLeft,
  ShieldCheck,
  Award,
  Vote,
  Check,
  Flame,
  ChevronRight,
  Sparkles,
  Search,
  UserPlus,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function EventDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [event, setEvent] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [nominees, setNominees] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [lastUpdatedTime, setLastUpdatedTime] = useState<Date>(new Date())

  const refreshEventData = async (silent = true) => {
    if (!slug) return
    if (!silent) setIsLoadingEvent(true)
    try {
      const res = await fetch(`/api/events/details?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      const data = await res.json()
      if (data.success && data.event) {
        setEvent(data.event)
        if (Array.isArray(data.categories)) setCategories(data.categories)
        if (Array.isArray(data.nominees)) setNominees(data.nominees)
        if (Array.isArray(data.packages)) setPackages(data.packages)
        setLastUpdatedTime(new Date())
      }
    } catch (err) {
      console.error("Error refreshing live event data:", err)
    } finally {
      if (!silent) setIsLoadingEvent(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    refreshEventData(false)
  }, [slug])

  // Real-time Supabase postgres_changes channel for instant live vote tallies
  useEffect(() => {
    if (!event?.id) return

    const supabase = getSupabaseBrowserClient()
    const channel = supabase
      .channel(`realtime-votes-event-${event.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          console.log('[Realtime] Vote update received:', payload)
          refreshEventData(true)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [event?.id])

  if (!event && !isLoadingEvent) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<"categories" | "leaderboard" | "overview" | "results">("categories")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [categorySearchQuery, setCategorySearchQuery] = useState("")
  const [votingNominee, setVotingNominee] = useState<Nominee | null>(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!event) {
    return (
      <div className="min-h-screen bg-[#040404] text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    )
  }

  const isPending = event.status === "pending_approval"
  const isDraft = event.status === "draft"
  const isLive = (event.status === "published" || event.status === "approved" || isPending) && new Date(event.end_date) > new Date()
  const isUpcoming = (event.status === "published" || event.status === "approved") && new Date(event.start_date) > new Date()
  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const totalVotesCast =
    event.total_votes !== undefined
      ? event.total_votes
      : nominees.reduce((sum: number, n: any) => sum + (n.vote_count || 0), 0) ||
        db
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

  // Filtered nominees for selected category
  const filteredNominees = selectedCategory === "all" || selectedCategory === null
    ? nominees
    : nominees.filter((c) => c.category_id === selectedCategory)

  const activeCategoryObj = categories.find((cat) => cat.id === selectedCategory)

  // Dynamic Leaderboard data using authoritative vote counts
  const categoriesMap = new Map(categories.map((c) => [c.id, c.name]))
  const candidatesForLeaderboard = (
    selectedCategory && selectedCategory !== "all"
      ? nominees.filter((n) => n.category_id === selectedCategory)
      : nominees
  ).map((n) => ({
    nominee_id: n.id,
    nominee_name: n.name,
    nominee_slug: n.slug,
    nominee_image: n.image_url,
    public_id: n.public_id,
    category_id: n.category_id,
    category_name: categoriesMap.get(n.category_id) || "General Category",
    vote_count: n.vote_count ?? db.getNomineeVoteCount(n.id) ?? 0,
    rank: 0,
  }))
  candidatesForLeaderboard.sort((a, b) => b.vote_count - a.vote_count)
  const leaderboard = candidatesForLeaderboard.map((item, idx) => ({ ...item, rank: idx + 1 }))

  // Top 3 Podium for Leaderboard
  const top1 = leaderboard[0]
  const top2 = leaderboard[1]
  const top3 = leaderboard[2]

  return (
    <div className="min-h-screen pb-24 bg-[#040404] text-white selection:bg-[#C9A84C] selection:text-[#040404]">
      {/* Pending / Draft Preview Mode Notice */}
      {(isPending || isDraft) && (
        <div className="sticky top-16 z-30 bg-amber-500/15 backdrop-blur-md border-b border-amber-500/30 px-4 py-2.5 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            {isPending
              ? "Preview Mode: This contest is currently awaiting Super Admin review before it appears in public marketplace listings. You can still test categories and contestant applications."
              : "Draft Preview Mode: This event is currently a draft."}
          </span>
        </div>
      )}

      {/* 1. EVENT HERO HEADER WITH STEALTH OBSIDIAN & GOLD GLOW */}
      <div className="relative overflow-hidden bg-[#040404] text-white pt-20 sm:pt-24">
        {/* Cover Photo Backdrop with Gradient Blend */}
        <div className="relative h-60 min-[480px]:h-72 sm:h-96 w-full overflow-hidden">
          <img
            src={
              event.cover_image_url ||
              "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
            }
            alt={event.name}
            className="h-full w-full object-cover brightness-[0.65]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-[#040404]/80 to-transparent" />
        </div>

        {/* Floating Event Info Container */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-20 min-[480px]:-mt-28 sm:-mt-36 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="space-y-3">
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-[11px] font-bold text-neutral-300">
                  JVican Vote Arena
                </span>
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/25">
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                    Pending Review
                  </span>
                )}
                {isLive && !isPending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-3 py-1 text-[11px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live Voting
                  </span>
                )}
                {isClosed && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-bold text-neutral-400 border border-white/[0.08]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400" />
                    Concluded
                  </span>
                )}
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-neutral-300 border border-white/[0.08]">
                  {categories.length} {categories.length === 1 ? "Category" : "Categories"}
                </span>
                <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-neutral-300 border border-white/[0.08]">
                  {nominees.length} Nominees
                </span>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl min-[480px]:text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                {event.name}
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed">
                {event.description}
              </p>

              {/* Metadata Highlights */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-neutral-400 pt-1">
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Calendar className="h-4 w-4 text-[#C9A84C]" />
                  {isClosed ? `Concluded on ${formatDate(event.end_date)}` : `Closing in ${daysLeft} days`}
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 whitespace-nowrap">
                  <Vote className="h-4 w-4 text-emerald-400" />
                  {formatCurrency(event.vote_price, event.currency)} per vote
                </span>
                <span className="text-white/20 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5 font-bold text-white whitespace-nowrap">
                  <Trophy className="h-4 w-4 text-[#C9A84C]" />
                  {totalVotesCast.toLocaleString()} Verified Votes Cast
                </span>
              </div>
            </div>

            {/* Actions: Quick Category Pick, Apply to Contest, & Share */}
            <div className="flex flex-col min-[480px]:flex-row items-stretch min-[480px]:items-center gap-2.5 w-full lg:w-auto">
              {!isClosed && categories.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("categories")
                    const el = document.getElementById("event-tabs-anchor")
                    if (el) el.scrollIntoView({ behavior: "smooth" })
                  }}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] hover:bg-[#D4B86A] text-[#050505] font-extrabold px-5 py-3 sm:py-2.5 text-xs sm:text-sm transition-all cursor-pointer shadow-lg shadow-[#C9A84C]/20 active:scale-98 btn-shimmer"
                >
                  <Layers className="h-4 w-4 text-[#050505]" />
                  <span>Browse &amp; Vote</span>
                </button>
              )}
              
              {!isClosed && (
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 hover:bg-[#C9A84C]/20 text-[#D4B86A] hover:text-white px-5 py-3 sm:py-2.5 text-xs sm:text-sm font-extrabold transition-all cursor-pointer shadow-md backdrop-blur-md"
                >
                  <UserPlus className="h-4 w-4 text-[#C9A84C]" />
                  <span>Apply as Nominee</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-2 rounded-full border border-white/[0.1] bg-[#0a0a0a] hover:bg-[#141414] text-white px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg hover:border-[#C9A84C]/40"
              >
                <Share2 className="h-4 w-4 text-[#C9A84C]" />
                <span>{copied ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EVENT NAVIGATION TABS */}
      <div id="event-tabs-anchor" className="sticky top-14 sm:top-20 z-30 border-b border-white/[0.08] bg-[#040404]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 sm:py-3 no-scrollbar max-w-full">
            <button
              onClick={() => {
                setActiveTab("categories")
              }}
              className={cn(
                "px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                activeTab === "categories"
                  ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={cn(
                "px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                activeTab === "leaderboard"
                  ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Leaderboard &amp; Standings</span>
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={cn(
                "px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                activeTab === "overview"
                  ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/25"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.05]"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Overview &amp; Rules</span>
            </button>

            {isClosed && (
              <button
                onClick={() => setActiveTab("results")}
                className={cn(
                  "px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5",
                  activeTab === "results"
                    ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/25"
                    : "text-[#D4B86A] hover:bg-[#C9A84C]/10"
                )}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Certified Results</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* TAB A: CATEGORIES FIRST FLOW */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            {/* VIEW A1: ROOT CATEGORIES LIST (Default) */}
            {selectedCategory === null ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Header & Search */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                      <span>Award Categories</span>
                      <span className="rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 px-2.5 py-0.5 text-xs font-black text-[#D4B86A]">
                        {categories.length}
                      </span>
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-400">
                      Select any category to view its contenders, explore profiles, and cast votes.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="text-xs font-bold text-[#C9A84C] hover:text-[#D4B86A] hover:underline cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <span>View All ({nominees.length}) Nominees</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {categories.map((cat, idx) => {
                    const catNominees = nominees.filter((n) => n.category_id === cat.id)
                    const catTotalVotes = catNominees.reduce(
                      (sum, n) => sum + db.getNomineeVoteCount(n.id),
                      0
                    )
                    const topNominee = [...catNominees].sort(
                      (a, b) => db.getNomineeVoteCount(b.id) - db.getNomineeVoteCount(a.id)
                    )[0]

                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-6 sm:p-7 text-white transition-colors duration-200 hover:border-[#C9A84C]/40 cursor-pointer"
                      >
                        <div>
                          {/* Category Badge & Contenders Count */}
                          <div className="flex items-center justify-between gap-2 mb-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] px-3 py-1 text-[11px] font-bold text-neutral-300">
                              <Trophy className="h-3.5 w-3.5 text-[#C9A84C]" />
                              Category #{idx + 1}
                            </span>
                            <span className="rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/25 px-3 py-1 text-[11px] font-black text-[#D4B86A]">
                              {catNominees.length} {catNominees.length === 1 ? "Nominee" : "Nominees"}
                            </span>
                          </div>

                          {/* Category Name */}
                          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight group-hover:text-[#D4B86A] transition-colors leading-snug">
                            {cat.name}
                          </h3>

                          {/* Category Description */}
                          {cat.description && (
                            <p className="mt-2 text-xs text-neutral-400 leading-relaxed line-clamp-2">
                              {cat.description}
                            </p>
                          )}

                          {/* Contender Preview Avatars */}
                          <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between gap-3">
                            <div className="flex items-center -space-x-2">
                              {catNominees.slice(0, 4).map((nom) => (
                                <img
                                  key={nom.id}
                                  src={nom.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                                  alt={nom.name}
                                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#0a0a0a]"
                                />
                              ))}
                              {catNominees.length > 4 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#161616] text-[10px] font-black text-neutral-300 ring-2 ring-[#0a0a0a] border border-white/10">
                                  +{catNominees.length - 4}
                                </div>
                              )}
                            </div>

                            {topNominee && (
                              <div className="text-right">
                                <span className="text-[10px] text-neutral-400 block font-medium">Leading</span>
                                <span className="text-xs font-bold text-[#C9A84C] line-clamp-1 max-w-[120px]">
                                  {topNominee.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className="mt-6 pt-2">
                          <div className="flex items-center justify-between rounded-2xl bg-[#121212] group-hover:bg-[#C9A84C] group-hover:text-[#050505] px-4 py-3 text-xs font-extrabold text-neutral-200 transition-all duration-200 border border-white/[0.06] group-hover:border-transparent">
                            <span>View Nominees &amp; Vote</span>
                            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* VIEW A2: DRILL-DOWN INTO SELECTED CATEGORY NOMINEES */
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Top Breadcrumb & Back Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-[#0a0a0a] border border-white/[0.08] shadow-xl">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-[#141414] hover:bg-[#C9A84C] text-neutral-300 hover:text-[#050505] transition-all cursor-pointer border border-white/[0.06] shrink-0"
                      title="Back to All Categories"
                    >
                      <ArrowLeft className="h-4 w-4 stroke-[2.5]" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C9A84C]">
                          Category View
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[11px] text-neutral-400 font-semibold">
                          {filteredNominees.length} Contenders Registered
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                        {selectedCategory === "all"
                          ? "All Event Nominees"
                          : activeCategoryObj?.name || "Category Nominees"}
                      </h2>
                    </div>
                  </div>

                  {/* Switch Category Pill Group */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar max-w-full">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-3.5 py-1.5 text-xs font-bold rounded-full border border-white/[0.08] bg-[#121212] text-neutral-300 hover:text-white hover:border-[#C9A84C]/40 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      All Categories Grid
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={cn(
                          "px-3.5 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                          selectedCategory === cat.id
                            ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/20"
                            : "bg-[#121212] text-neutral-400 border border-white/[0.06] hover:text-white hover:bg-[#181818]"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Nominee Cards Grid for this category */}
                {filteredNominees.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/10 p-12 sm:p-16 text-center bg-[#0a0a0a]">
                    <Users className="mx-auto h-12 w-12 text-neutral-500 mb-3" />
                    <h3 className="text-lg font-bold text-white">No Nominees Registered Yet</h3>
                    <p className="mt-1 text-xs text-neutral-400">
                      There are currently no contenders registered under this category.
                    </p>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2.5 text-xs font-extrabold text-[#050505] cursor-pointer"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      <span>Browse Other Categories</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredNominees.map((c) => {
                      const category = categories.find((cat) => cat.id === c.category_id)
                      const voteCount = c.vote_count !== undefined ? c.vote_count : db.getNomineeVoteCount(c.id)

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
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB B: LEADERBOARD & PODIUM */}
        {activeTab === "leaderboard" && (
          <div className="space-y-8 sm:space-y-10">
            {/* Category Filter for Leaderboard */}
            {categories.length > 1 && (
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Filter by Category
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                      "px-4 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                      selectedCategory === null || selectedCategory === "all"
                        ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/20"
                        : "bg-[#0a0a0a] text-neutral-300 border border-white/[0.08] hover:bg-[#141414] hover:text-white"
                    )}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "px-4 py-1.5 sm:py-2 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap",
                        selectedCategory === cat.id
                          ? "bg-[#C9A84C] text-[#050505] font-black shadow-md shadow-[#C9A84C]/20"
                          : "bg-[#0a0a0a] text-neutral-300 border border-white/[0.08] hover:bg-[#141414] hover:text-white"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visual Podium for Top 3 (1st = Gold, 2nd = Silver, 3rd = Bronze) */}
            {leaderboard.length >= 2 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-3xl mx-auto pt-4 sm:pt-6 pb-2">
                {/* #2 Rank Card - Silver */}
                {top2 && (
                  <div className="flex flex-col items-center text-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-neutral-400/40 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-xl">
                    <div className="relative mb-2 sm:mb-3">
                      <img
                        src={top2.nominee_image || undefined}
                        alt={top2.nominee_name}
                        className="h-14 w-14 min-[480px]:h-20 min-[480px]:w-20 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl object-cover ring-2 ring-neutral-300"
                      />
                      <span className="absolute -bottom-1.5 sm:-bottom-2 -right-1 rounded-full bg-neutral-300 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-[#040404] shadow-md">
                        2nd
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-extrabold text-white line-clamp-1">
                      {top2.nominee_name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1 hidden min-[480px]:block">{top2.category_name}</span>
                    <div className="mt-1.5 sm:mt-2 rounded-lg sm:rounded-xl bg-[#141414] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-neutral-200 border border-white/5">
                      {top2.vote_count.toLocaleString()} <span className="hidden sm:inline">Votes</span>
                    </div>
                  </div>
                )}

                {/* #1 Champion Tall Center Card - Gold */}
                {top1 && (
                  <div className="flex flex-col items-center text-center p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-[#C9A84C] bg-gradient-to-b from-[#C9A84C]/20 via-[#0a0a0a] to-[#0a0a0a] shadow-2xl relative -mt-3 sm:-mt-4 ring-2 sm:ring-4 ring-[#C9A84C]/10">
                    <div className="absolute -top-2.5 sm:-top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A84C] px-2.5 sm:px-3 py-0.5 text-[9px] sm:text-[10px] font-black uppercase text-[#050505] shadow-md flex items-center gap-1 whitespace-nowrap">
                      <Trophy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>1st (Gold)</span>
                    </div>
                    <div className="relative mb-2 sm:mb-3 mt-1">
                      <img
                        src={top1.nominee_image || undefined}
                        alt={top1.nominee_name}
                        className="h-16 w-16 min-[480px]:h-24 min-[480px]:w-24 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl object-cover ring-2 sm:ring-4 ring-[#C9A84C] shadow-xl"
                      />
                    </div>
                    <span className="text-xs sm:text-sm font-black text-white line-clamp-1">
                      {top1.nominee_name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-[#D4B86A] font-semibold line-clamp-1 hidden min-[480px]:block">
                      {top1.category_name}
                    </span>
                    <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl bg-[#C9A84C] px-2.5 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-black text-[#050505] shadow-md shadow-[#C9A84C]/20">
                      {top1.vote_count.toLocaleString()} <span className="hidden sm:inline">Votes</span>
                    </div>
                  </div>
                )}

                {/* #3 Rank Card - Bronze */}
                {top3 && (
                  <div className="flex flex-col items-center text-center p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-[#7A5C1E]/60 bg-[#0a0a0a]/90 backdrop-blur-xl shadow-xl">
                    <div className="relative mb-2 sm:mb-3">
                      <img
                        src={top3.nominee_image || undefined}
                        alt={top3.nominee_name}
                        className="h-14 w-14 min-[480px]:h-20 min-[480px]:w-20 sm:h-20 sm:w-20 rounded-xl sm:rounded-2xl object-cover ring-2 ring-[#7A5C1E]"
                      />
                      <span className="absolute -bottom-1.5 sm:-bottom-2 -right-1 rounded-full bg-[#7A5C1E] px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-white shadow-md">
                        3rd
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-extrabold text-white line-clamp-1">
                      {top3.nominee_name}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1 hidden min-[480px]:block">{top3.category_name}</span>
                    <div className="mt-1.5 sm:mt-2 rounded-lg sm:rounded-xl bg-[#141414] px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-extrabold text-neutral-200 border border-white/5">
                      {top3.vote_count.toLocaleString()} <span className="hidden sm:inline">Votes</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Complete Ranked Standings List / Leaderboard */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Event Standings &amp; Full Leaderboard
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live Standings
                  </span>
                </div>
                <span className="text-[11px] sm:text-xs text-neutral-400 font-semibold">
                  {leaderboard.length} Nominees Ranked
                </span>
              </div>

              <div className="space-y-2.5 sm:space-y-3">
                {leaderboard.map((item, idx) => {
                  const maxVotes = top1?.vote_count || 1
                  const percentage = Math.round((item.vote_count / maxVotes) * 100)

                  return (
                    <div
                      key={item.nominee_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#121212] border border-white/[0.06] hover:border-[#C9A84C]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black",
                            idx === 0
                              ? "bg-[#C9A84C] text-[#050505] font-black"
                              : idx === 1
                              ? "bg-neutral-300 text-[#050505] font-black"
                              : idx === 2
                              ? "bg-[#7A5C1E] text-white font-black"
                              : "bg-[#181818] text-neutral-400 border border-white/5"
                          )}
                        >
                          #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                        </span>

                        <img
                          src={item.nominee_image || undefined}
                          alt={item.nominee_name}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover shrink-0 ring-1 ring-white/10"
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                              {item.nominee_name}
                            </span>
                            <span className="text-[10px] font-mono text-[#C9A84C] shrink-0">
                              #{item.public_id}
                            </span>
                          </div>
                          <span className="text-[11px] sm:text-xs text-neutral-400 truncate block">
                            {item.category_name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.04]">
                        <div className="text-left sm:text-right">
                          <span className="text-xs sm:text-sm font-black text-white block">
                            {item.vote_count.toLocaleString()} Votes
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            {percentage}% of leader
                          </span>
                        </div>

                        {!isClosed && (
                          <button
                            type="button"
                            onClick={() => {
                              const nom = nominees.find((n) => n.id === item.nominee_id)
                              if (nom) setVotingNominee(nom)
                            }}
                            className="rounded-full bg-[#C9A84C] px-3.5 sm:px-4 py-1.5 text-xs font-bold text-[#050505] hover:bg-[#D4B86A] transition-colors shadow-xs cursor-pointer active:scale-98"
                          >
                            Vote
                          </button>
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
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            <div className="md:col-span-8 space-y-6">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0a0a0a]/90 p-5 sm:p-8 shadow-xl backdrop-blur-xl">
                <h3 className="text-base sm:text-lg font-extrabold text-white mb-3">
                  About {event.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {event.description}
                </p>

                <h4 className="text-xs sm:text-sm font-extrabold text-white mt-6 mb-2">
                  Voting Integrity &amp; General Rules
                </h4>
                <ul className="space-y-2 text-xs text-neutral-400 list-disc list-inside leading-relaxed">
                  <li>Each vote is priced authoritatively at {formatCurrency(event.vote_price, event.currency)}.</li>
                  <li>Supporters can vote multiple times across any category to back their favorite nominees.</li>
                  <li>All payments are processed securely with immediate cryptographically signed receipts.</li>
                  <li>Live standings update in real-time until the official closing date.</li>
                </ul>

                {/* Official Rules Notice Box */}
                <div className="mt-6 rounded-2xl border border-[#C9A84C]/30 bg-[#C9A84C]/5 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-4 w-4 text-[#C9A84C]" />
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#D4B86A]">
                      All Contestants to Note the Official Rules
                    </h5>
                  </div>
                  <ul className="space-y-2 text-xs text-neutral-300">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] font-bold">•</span>
                      <span>
                        Contestants must pull up to a thousand (<strong>1,000 Votes or above</strong>) to be able to qualify for the above AWARDS.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C] font-bold">•</span>
                      <span>
                        If in a Category there are two contestants, then they have to pull up <strong>1,000 votes and above</strong> to avoid void votes.
                      </span>
                    </li>
                  </ul>
                  <div className="mt-3 pt-2.5 border-t border-[#C9A84C]/20 text-[11px] text-neutral-400">
                    By the Management: <strong className="text-white">JVICAN MASCOT INFLATABLE ENTERTAINMENT</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 space-y-4">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0a0a0a]/90 p-5 sm:p-6 shadow-xl backdrop-blur-xl">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#C9A84C] mb-3">
                  Event Quick Facts
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-neutral-400">Status</span>
                    <span className="font-bold text-emerald-400 uppercase">{event.status}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-neutral-400">Start Date</span>
                    <span className="font-semibold text-white">{formatDate(event.start_date)}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-neutral-400">End Date</span>
                    <span className="font-semibold text-white">{formatDate(event.end_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Vote Price</span>
                    <span className="font-extrabold text-[#C9A84C]">{formatCurrency(event.vote_price, event.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: CERTIFIED RESULTS */}
        {activeTab === "results" && isClosed && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#C9A84C]/30 bg-gradient-to-tr from-[#C9A84C]/10 via-[#0a0a0a] to-[#0a0a0a] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#C9A84C] mb-2">
                <Award className="h-4 w-4" />
                <span>Certified Official Standings</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white">
                Official Crown Winner
              </h2>
              <p className="text-xs text-neutral-400 mt-1">
                Voting concluded on {formatDate(event.end_date)}. The tallies below have been audited and certified.
              </p>

              {top1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 p-5 sm:p-6 rounded-2xl bg-[#121212] border border-[#C9A84C]/30 text-center sm:text-left">
                  <img
                    src={top1.nominee_image || undefined}
                    alt={top1.nominee_name}
                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl object-cover ring-4 ring-[#C9A84C]"
                  />
                  <div className="space-y-1">
                    <span className="rounded-full bg-[#C9A84C] px-3 py-0.5 text-[10px] font-black uppercase text-[#050505]">
                      Overall Title Holder
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {top1.nominee_name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      {top1.category_name} • Nominee #{top1.public_id}
                    </p>
                    <div className="pt-2 text-sm font-black text-[#C9A84C]">
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

      {/* Contestant Application Modal */}
      <ApplyNomineeModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        event={event}
        categories={categories}
      />
    </div>
  )
}
