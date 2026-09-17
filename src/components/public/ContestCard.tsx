"use client"

import React from "react"
import Link from "next/link"
import { Event } from "@/types/database"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Users, Trophy, ArrowRight, Clock, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ContestCardProps {
  contest: Event
  categoriesCount?: number
  contestantsCount?: number
  totalVotesCount?: number
  variant?: "default" | "featured" | "compact"
  className?: string
}

export function ContestCard({
  contest,
  categoriesCount = 1,
  contestantsCount = 4,
  totalVotesCount,
  variant = "default",
  className,
}: ContestCardProps) {
  const isLive = contest.status === "published" && new Date(contest.end_date) > new Date()
  const isUpcoming = contest.status === "published" && new Date(contest.start_date) > new Date()
  const isClosed = contest.status === "closed" || new Date(contest.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(contest.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const isFeatured = variant === "featured"

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition-all duration-300 card-hover dark:border-slate-800 dark:bg-slate-900/90",
        isFeatured && "md:col-span-2 md:row-span-2 shadow-lg dark:shadow-blue-950/20",
        className
      )}
    >
      {/* Visual Cover Photo */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-slate-100 dark:bg-slate-800",
          isFeatured ? "aspect-16/10 sm:aspect-16/9" : "aspect-16/10"
        )}
      >
        <img
          src={
            contest.cover_image_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
          }
          alt={contest.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                Live
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                <Clock className="h-3 w-3" />
                Upcoming
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-200 shadow-md backdrop-blur-md">
                <CheckCircle2 className="h-3 w-3 text-amber-400" />
                Concluded
              </span>
            )}
            {contest.is_featured && !isFeatured && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md border border-amber-500/30">
                Featured
              </span>
            )}
          </div>

          <div className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold text-white border border-white/10 shadow-sm">
            {formatCurrency(contest.vote_price, contest.currency)}
            <span className="text-[10px] text-slate-300 font-normal"> / vote</span>
          </div>
        </div>

        {/* Floating title overlay on image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1">
            <span>{categoriesCount} {categoriesCount === 1 ? 'Category' : 'Categories'}</span>
            <span>•</span>
            <span>{contestantsCount} Contestants</span>
          </div>
          <h3
            className={cn(
              "font-extrabold tracking-tight text-white line-clamp-1",
              isFeatured ? "text-2xl sm:text-3xl" : "text-xl"
            )}
          >
            {contest.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <p className="line-clamp-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {contest.description || "Discover verified contestants, cast your vote securely, and follow live standings."}
          </p>

          {/* Metadata Grid */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {isClosed ? "Ended " + formatDate(contest.end_date) : `${daysLeft} days left`}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Trophy className="h-4 w-4 text-amber-500 shrink-0" />
              <span>{contest.show_live_results ? "Live Standings" : "Certified"}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-2">
          <Link href={`/contest/${contest.slug}`}>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-slate-900 py-3 text-xs font-extrabold text-white transition-all duration-200 hover:bg-amber-500 hover:text-slate-950 dark:bg-slate-800 dark:hover:bg-amber-500 dark:hover:text-slate-950 cursor-pointer shadow-xs active:scale-98"
            >
              <span>{isClosed ? "View Results & Winners" : "View Contestants & Vote"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
