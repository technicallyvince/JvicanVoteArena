"use client"

import React, { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { VoteModal } from "@/components/public/VoteModal"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency } from "@/lib/utils"
import {
  Share2,
  Heart,
  ArrowLeft,
  Trophy,
  ShieldCheck,
  CheckCircle,
  Copy,
  Vote,
  TrendingUp,
  Award,
} from "lucide-react"

export default function DedicatedContestantPage() {
  const params = useParams()
  const publicId = params?.id as string

  const contestant = db.getNomineeByPublicId(publicId)
  if (!contestant) {
    notFound()
  }

  const contest = db.getEventById(contestant.event_id)
  if (!contest) {
    notFound()
  }

  const category = db.getCategoryById(contestant.category_id)
  const packages = db.getVotePackages(contest.id)
  const voteCount = db.getNomineeVoteCount(contestant.id)
  const leaderboard = db.getLeaderboard(contest.id, contestant.category_id)
  const rank = leaderboard.findIndex((item) => item.nominee_id === contestant.id) + 1

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLive = contest.status === "published" && new Date(contest.end_date) > new Date()
  const isClosed = contest.status === "closed" || new Date(contest.end_date) <= new Date()

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${contestant.name} - ${contest.name}`,
          text: `Support ${contestant.name} in ${contest.name}! Cast your vote online.`,
          url,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="py-10 sm:py-16 pb-28 sm:pb-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/contest/${contest.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {contest.name}</span>
          </Link>
        </div>

        {/* Profile Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
          {/* Left Column: Portrait & Quick Share */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800 shadow-md">
              <img
                src={contestant.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"}
                alt={contestant.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

              <div className="absolute top-4 left-4 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-mono font-bold text-white border border-white/10 shadow-sm">
                ID: #{contestant.public_id}
              </div>

              {rank > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 shadow-md">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Rank #{rank}</span>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="w-full text-xs font-bold gap-1.5 rounded-2xl"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="w-full text-xs font-bold gap-1.5 rounded-2xl"
              >
                <Share2 className="h-4 w-4 text-blue-600" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Right Column: Bio, Stats & Voting Trigger */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    JVican Vote Arena
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {category?.name || "Official Category"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {contestant.name}
                </h1>
                <p className="text-xs font-semibold text-slate-500">
                  Competing in <Link href={`/contest/${contest.slug}`} className="text-slate-800 dark:text-slate-200 hover:underline">{contest.name}</Link>
                </p>
              </div>

              {/* Bio */}
              <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {contestant.description || "Dedicated contender competing in the prestigious annual recognition showcase."}
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-850">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Votes</span>
                  <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {voteCount.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-850">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standings</span>
                  <div className="text-lg sm:text-xl font-black text-amber-500 mt-0.5">
                    #{rank || "1"}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-white p-3.5 text-center shadow-xs dark:border-slate-800 dark:bg-slate-850">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vote Price</span>
                  <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                    {formatCurrency(contest.vote_price, contest.currency)}
                  </div>
                </div>
              </div>

              {/* Fast Vote Bundles Preview */}
              {!isClosed && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                    Quick Vote Packages
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 5, 10, 20, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setIsVoteModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-750 transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-900 dark:text-white">{qty} {qty === 1 ? 'Vote' : 'Votes'}</span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {formatCurrency(qty * contest.vote_price, contest.currency)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voting CTA */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="primary"
                size="xl"
                disabled={isClosed}
                onClick={() => setIsVoteModalOpen(true)}
                className="w-full justify-center text-base font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 py-4"
              >
                <Vote className="h-5 w-5 mr-2" />
                {isClosed ? "Voting Closed" : `Vote for ${contestant.name}`}
              </Button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Processed with TransactPay • Public cryptographic receipt provided
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action on Mobile */}
      {!isClosed && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur-xl shadow-2xl dark:border-slate-800 dark:bg-slate-950/95">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsVoteModalOpen(true)}
            className="w-full justify-center text-sm font-extrabold rounded-2xl shadow-md shadow-blue-500/30"
          >
            <Vote className="h-4 w-4 mr-2" />
            Vote for {contestant.name} — {formatCurrency(contest.vote_price, contest.currency)}
          </Button>
        </div>
      )}

      {/* Vote Modal */}
      {isVoteModalOpen && (
        <VoteModal
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          contestant={contestant}
          contest={contest}
          category={category || null}
          packages={packages}
        />
      )}
    </div>
  )
}
