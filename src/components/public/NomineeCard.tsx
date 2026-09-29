"use client"

import React from "react"
import Link from "next/link"
import { Nominee } from "@/types/database"
import { Trophy, Vote, ExternalLink, Crown } from "lucide-react"
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] transition-colors duration-180 hover:border-[#C9A84C]/40 text-white">
      {/* Nominee Image Container */}
      <div className="relative aspect-3/4 w-full overflow-hidden bg-neutral-950">
        <img
          src={
            nominee.image_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
          }
          alt={nominee.name}
          className="h-full w-full object-cover object-top brightness-[0.85] transition-opacity duration-300 group-hover:brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/10 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <div className="rounded-full bg-black/80 px-3 py-1 text-[11px] font-mono font-bold text-[#C9A84C] border border-white/10">
            #{nominee.public_id}
          </div>

          {showRank && rank !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border",
                rank === 1
                  ? "bg-[#C9A84C] text-[#040404] border-[#C9A84C]"
                  : rank === 2
                  ? "bg-slate-200 text-slate-950 border-white/20"
                  : rank === 3
                  ? "bg-[#7A5C1E] text-white border-white/20"
                  : "bg-black/80 text-neutral-300 border-white/10"
              )}
            >
              {rank === 1 ? <Crown className="h-3 w-3" /> : <Trophy className="h-3 w-3" />}
              <span>Rank #{rank}</span>
            </div>
          )}
        </div>

        {/* Bottom image overlay details */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <span className="block text-[10px] font-semibold text-[#C9A84C] truncate mb-0.5">
            {categoryName}
          </span>
          <h3 className="text-lg font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#D4B86A] transition-colors duration-180">
            {nominee.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {/* Vote Count */}
          <div className="flex items-center justify-between rounded-xl bg-[#111111] px-3.5 py-2.5 border border-white/[0.06]">
            <span className="text-xs font-medium text-neutral-400">
              Verified Votes
            </span>
            <div className="flex items-center gap-1.5 font-bold text-sm text-white">
              <span>{voteCount.toLocaleString()}</span>
            </div>
          </div>

          {nominee.description && (
            <p className="mt-3 line-clamp-2 text-xs text-slate-500 leading-relaxed">
              {nominee.description}
            </p>
          )}
        </div>

        {/* Actions Bar */}
        <div className="mt-4 pt-1 grid grid-cols-2 gap-2">
          <Link
            href={`/nominees/${nominee.public_id}`}
            className="flex items-center justify-center gap-1 rounded-full border border-white/[0.07] bg-[#0e1018] py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:border-white/[0.14] hover:bg-[#161824] transition-all"
          >
            <span>Profile</span>
            <ExternalLink className="h-3 w-3 text-slate-600" />
          </Link>

          <button
            type="button"
            disabled={isVotingClosed}
            onClick={() => onVoteClick && onVoteClick(nominee)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full py-2.5 text-xs font-extrabold transition-all duration-200 shadow-md cursor-pointer overflow-hidden relative",
              isVotingClosed
                ? "bg-[#0e1018] text-slate-500 cursor-not-allowed opacity-60 border border-white/[0.05]"
                : "bg-[#C9A84C] text-[#0a0c14] hover:bg-[#D4B86A] shadow-[#C9A84C]/20 active:scale-98 btn-shimmer"
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
