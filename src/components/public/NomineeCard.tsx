"use client"

import React from "react"
import Link from "next/link"
import { Nominee } from "@/types/database"
import { Trophy, Vote, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface NomineeCardProps {
  nominee: Nominee
  categoryName?: string
  votePrice?: number
  currency?: string
  voteCount?: number
  rank?: number
  isVotingClosed?: boolean
  onVoteClick?: (nominee: Nominee) => void
  showRank?: boolean
}

export function NomineeCard({
  nominee,
  categoryName = "General Category",
  votePrice = 100,
  currency = "NGN",
  voteCount = 0,
  rank,
  isVotingClosed = false,
  onVoteClick,
  showRank = false,
}: NomineeCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121212] transition-all duration-300 hover:border-[#ff5500]/30 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(255,85,0,0.15)] text-white shadow-xl shadow-black/60">
      {/* Nominee Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-950">
        <img
          src={
            nominee.image_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
          }
          alt={nominee.name}
          className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.9] group-hover:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/30" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] font-mono font-bold text-[#ff8c42] border border-white/10 shadow-xs">
            #{nominee.public_id}
          </div>

          {showRank && rank !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold shadow-sm backdrop-blur-md",
                rank === 1
                  ? "bg-[#ff5500] text-white font-black ring-2 ring-[#ff5500]/40"
                  : rank === 2
                  ? "bg-neutral-200 text-neutral-900"
                  : rank === 3
                  ? "bg-[#ff8c42] text-white"
                  : "bg-black/60 text-neutral-200 border border-white/10"
              )}
            >
              <Trophy className="h-3 w-3" />
              <span>Rank #{rank}</span>
            </div>
          )}
        </div>

        {/* Bottom image overlay details */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#ff8c42] truncate mb-0.5">
            {categoryName}
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-white line-clamp-1 group-hover:text-[#ff8c42] transition-colors">
            {nominee.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Vote Count & Stats */}
          <div className="flex items-center justify-between rounded-2xl bg-neutral-900/80 px-3.5 py-2.5 border border-white/[0.06]">
            <span className="text-xs font-semibold text-neutral-400">
              Verified Votes:
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-white">
              <span>{voteCount.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Tallied
              </span>
            </div>
          </div>

          {nominee.description && (
            <p className="mt-3 line-clamp-2 text-xs text-neutral-400 leading-relaxed">
              {nominee.description}
            </p>
          )}
        </div>

        {/* Actions Bar */}
        <div className="mt-4 pt-1 grid grid-cols-2 gap-2">
          <Link
            href={`/nominee/${nominee.public_id}`}
            className="flex items-center justify-center gap-1 rounded-full border border-white/[0.08] bg-neutral-900/90 py-2.5 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <span>Profile</span>
            <ExternalLink className="h-3 w-3 text-neutral-500" />
          </Link>

          <button
            type="button"
            disabled={isVotingClosed}
            onClick={() => onVoteClick && onVoteClick(nominee)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-bold transition-all duration-200 shadow-md cursor-pointer",
              isVotingClosed
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-60 border border-white/5"
                : "bg-[#ff5500] text-white hover:bg-[#ff661a] shadow-[#ff5500]/20 active:scale-98"
            )}
          >
            <Vote className="h-3.5 w-3.5" />
            <span>Vote</span>
          </button>
        </div>
      </div>
    </div>
  )
}
