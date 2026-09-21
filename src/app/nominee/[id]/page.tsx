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

export default function DedicatedNomineePage() {
  const params = useParams()
  const publicId = params?.id as string

  const nominee = db.getNomineeByPublicId(publicId)
  if (!nominee) {
    notFound()
  }

  const event = db.getEventById(nominee.event_id)
  if (!event) {
    notFound()
  }

  const category = db.getCategoryById(nominee.category_id)
  const packages = db.getVotePackages(event.id)
  const voteCount = db.getNomineeVoteCount(nominee.id)
  const leaderboard = db.getLeaderboard(event.id, nominee.category_id)
  const rank = leaderboard.findIndex((item) => item.nominee_id === nominee.id) + 1

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const isLive = event.status === "published" && new Date(event.end_date) > new Date()
  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${nominee.name} - ${event.name}`,
          text: `Support ${nominee.name} in ${event.name}! Cast your vote online.`,
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
    <div className="py-10 sm:py-16 pb-28 sm:pb-20 bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href={`/event/${event.slug}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {event.name}</span>
          </Link>
        </div>

        {/* Profile Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Left Column: Portrait & Quick Share */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-xl border border-white/[0.06]">
              <img
                src={nominee.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"}
                alt={nominee.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c101b]/90 via-transparent to-black/30" />

              <div className="absolute top-4 left-4 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-amber-400 border border-white/10 shadow-sm">
                ID: #{nominee.public_id}
              </div>

              {rank > 0 && (
                <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/20">
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
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="w-full text-xs font-bold gap-1.5 rounded-2xl"
              >
                <Share2 className="h-4 w-4 text-amber-400" />
                Share Profile
              </Button>
            </div>
          </div>

          {/* Right Column: Bio, Stats & Voting Trigger */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                    JVican Vote Arena
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    {category?.name || "Official Category"}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {nominee.name}
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  Competing in <Link href={`/event/${event.slug}`} className="text-amber-400 hover:underline">{event.name}</Link>
                </p>
              </div>

              {/* Bio */}
              <div className="rounded-2xl bg-neutral-900/80 p-4 sm:p-5 border border-white/[0.06] text-xs sm:text-sm text-slate-300 leading-relaxed">
                {nominee.description || "Dedicated contender competing in the prestigious annual recognition showcase."}
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-3.5 text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Votes</span>
                  <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {voteCount.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-3.5 text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Standings</span>
                  <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
                    #{rank || "1"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-3.5 text-center shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vote Price</span>
                  <div className="text-lg sm:text-xl font-black text-amber-400 mt-0.5">
                    {formatCurrency(event.vote_price, event.currency)}
                  </div>
                </div>
              </div>

              {/* Fast Vote Bundles Preview */}
              {!isClosed && (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                    Quick Vote Packages
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[1, 5, 10, 20, 50, 100].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setIsVoteModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-2xl border border-white/[0.08] bg-neutral-900/80 hover:bg-neutral-800 hover:border-amber-400/30 transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black text-white">{qty} {qty === 1 ? 'Vote' : 'Votes'}</span>
                        <span className="text-[10px] font-bold text-amber-400 mt-0.5">
                          {formatCurrency(qty * event.vote_price, event.currency)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voting CTA */}
            <div className="pt-4 border-t border-white/[0.08]">
              <Button
                variant="primary"
                size="xl"
                disabled={isClosed}
                onClick={() => setIsVoteModalOpen(true)}
                className="w-full justify-center text-base font-extrabold rounded-2xl shadow-lg shadow-amber-500/20 py-4"
              >
                <Vote className="h-5 w-5 mr-2" />
                {isClosed ? "Voting Closed" : `Vote for ${nominee.name}`}
              </Button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Processed securely with TransactPay • Cryptographic public receipt generated instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action on Mobile */}
      {!isClosed && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-neutral-950/95 p-3 backdrop-blur-xl shadow-2xl">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsVoteModalOpen(true)}
            className="w-full justify-center text-sm font-extrabold rounded-full shadow-md shadow-amber-500/20"
          >
            <Vote className="h-4 w-4 mr-2" />
            Vote for {nominee.name} — {formatCurrency(event.vote_price, event.currency)}
          </Button>
        </div>
      )}

      {/* Vote Modal */}
      {isVoteModalOpen && (
        <VoteModal
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          nominee={nominee}
          event={event}
          category={category || null}
          packages={packages}
        />
      )}
    </div>
  )
}
