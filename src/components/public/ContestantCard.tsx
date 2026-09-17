"use client"

import React from "react"
import Link from "next/link"
import { Nominee } from "@/types/database"
import { formatCurrency } from "@/lib/utils"
import { Trophy, Heart, ArrowRight, CheckCircle2, Vote } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContestantCardProps {
  contestant: Nominee
  categoryName?: string
  votePrice?: number
  currency?: string
  voteCount?: number
  rank?: number
  isVotingClosed?: boolean
  onVoteClick?: (nominee: Nominee) => void
  showRank?: boolean
}

export function ContestantCard({
  contestant,
  categoryName = "General Category",
  votePrice = 100,
  currency = "NGN",
  voteCount = 0,
  rank,
  isVotingClosed = false,
  onVoteClick,
  showRank = false,
}: ContestantCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition-all duration-300 card-hover dark:border-slate-800 dark:bg-slate-900/90">
      {/* Contestant Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={
            contestant.image_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
          }
          alt={contestant.name}
          className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-bold text-white border border-white/10 shadow-xs">
            #{contestant.public_id}
          </div>

          {showRank && rank !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm backdrop-blur-md",
                rank === 1
                  ? "bg-amber-400 text-slate-950"
                  : rank === 2
                  ? "bg-slate-200 text-slate-900"
                  : rank === 3
                  ? "bg-amber-700 text-white"
                  : "bg-black/60 text-slate-200 border border-white/10"
              )}
            >
              <Trophy className="h-3 w-3" />
              <span>Rank #{rank}</span>
            </div>
          )}
        </div>

        {/* Bottom image overlay details */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-300 truncate mb-0.5">
            {categoryName}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white line-clamp-1">
            {contestant.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Vote Count & Stats */}
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3.5 py-2.5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Verified Votes:
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900 dark:text-white">
              <span>{voteCount.toLocaleString()}</span>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Votes
              </span>
            </div>
          </div>

          {contestant.description && (
            <p className="mt-3 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {contestant.description}
            </p>
          )}
        </div>

        {/* Actions Bar */}
        <div className="mt-4 pt-2 grid grid-cols-2 gap-2">
          <Link
            href={`/contestant/${contestant.public_id}`}
            className="flex items-center justify-center rounded-full border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Profile
          </Link>

          <button
            type="button"
            disabled={isVotingClosed}
            onClick={() => onVoteClick && onVoteClick(contestant)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-extrabold transition-all duration-200 shadow-md cursor-pointer",
              isVotingClosed
                ? "bg-slate-400 text-slate-200 cursor-not-allowed opacity-60"
                : "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20 active:scale-98"
            )}
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Vote Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}
