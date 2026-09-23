"use client"

import React from "react"
import Link from "next/link"
import { Event } from "@/types/database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Trophy, ArrowRight, Clock, CheckCircle2, Flame, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface EventCardProps {
  event: Event
  categoriesCount?: number
  nomineesCount?: number
  totalVotesCount?: number
  variant?: "default" | "featured" | "compact"
  className?: string
}

export function EventCard({
  event,
  categoriesCount = 1,
  nomineesCount = 4,
  totalVotesCount,
  variant = "default",
  className,
}: EventCardProps) {
  const isLive = event.status === "published" && new Date(event.end_date) > new Date()
  const isUpcoming = event.status === "published" && new Date(event.start_date) > new Date()
  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const isFeatured = variant === "featured"

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(245,158,11,0.15)] text-white shadow-xl shadow-black/60",
        isFeatured && "md:col-span-2 md:row-span-2",
        className
      )}
    >
      {/* Visual Cover Photo */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-neutral-950",
          isFeatured ? "aspect-16/10 sm:aspect-16/9" : "aspect-16/10"
        )}
      >
        <img
          src={
            event.cover_image_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
          }
          alt={event.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out brightness-[0.88] group-hover:brightness-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c101b] via-[#0c101b]/30 to-black/30" />

        {/* Top Status & Price Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                Live Now
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md backdrop-blur-md">
                <Clock className="h-3 w-3" />
                Upcoming
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800/90 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-300 shadow-md backdrop-blur-md border border-white/10">
                <CheckCircle2 className="h-3 w-3 text-amber-400" />
                Concluded
              </span>
            )}
            {event.is_featured && !isFeatured && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-md border border-amber-500/30">
                <Flame className="h-3 w-3 text-amber-400" />
                Featured
              </span>
            )}
          </div>

          <div className="rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/20 shadow-sm">
            {formatCurrency(event.vote_price, event.currency)}
            <span className="text-[10px] text-slate-400 font-normal"> / vote</span>
          </div>
        </div>

        {/* Floating title overlay on image */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
            <span>{categoriesCount} {categoriesCount === 1 ? 'Category' : 'Categories'}</span>
            <span className="text-white/30">•</span>
            <span>{nomineesCount} Nominees</span>
          </div>
          <h3
            className={cn(
              "font-extrabold tracking-tight text-white line-clamp-1 group-hover:text-amber-400 transition-colors",
              isFeatured ? "text-2xl sm:text-3xl" : "text-xl"
            )}
          >
            {event.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p className="line-clamp-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
            {event.description || "Discover verified nominees, cast your vote securely, and follow live cryptographic standings."}
          </p>

          {/* Metadata Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-3.5 text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="truncate text-[11px]">
                {isClosed ? "Concluded " + formatDate(event.end_date) : `${daysLeft} days remaining`}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 font-semibold text-slate-300">
              <Trophy className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <span className="text-[11px]">{event.show_live_results ? "Live Standings" : "Certified"}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-5 pt-1">
          <Link href={`/events/${event.slug}`}>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-neutral-900/90 py-3 text-xs font-bold text-white transition-all duration-200 hover:border-amber-400/40 hover:bg-amber-500 hover:text-neutral-950 cursor-pointer shadow-md active:scale-98"
            >
              <span>{isClosed ? "View Results & Certified Tallies" : "Explore Nominees & Vote"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
