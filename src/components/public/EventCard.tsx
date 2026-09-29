"use client"

import React from "react"
import Link from "next/link"
import { Event } from "@/types/database"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Calendar, Trophy, ArrowRight, Clock, CheckCircle2, Flame, Crown } from "lucide-react"
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
  const isLive = (event.status === "published" || event.status === "approved") && new Date(event.end_date) > new Date()
  const isUpcoming = (event.status === "published" || event.status === "approved") && new Date(event.start_date) > new Date()
  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  const isFeatured = variant === "featured"

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] transition-colors duration-180 hover:border-[#C9A84C]/40 text-white",
        isFeatured && "md:col-span-2 md:row-span-2",
        className
      )}
    >
      {/* Visual Cover Photo */}
      <div
        className={cn(
          "relative w-full overflow-hidden bg-[#040404]",
          isFeatured ? "aspect-16/10 sm:aspect-16/9" : "aspect-16/10"
        )}
      >
        <img
          src={
            event.cover_image_url ||
            "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80"
          }
          alt={event.name}
          className="h-full w-full object-cover transition-opacity duration-300 brightness-[0.80] group-hover:brightness-90"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />

        {/* Top Status & Price Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                Live Now
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300 border border-white/10">
                <Clock className="h-3 w-3" />
                Upcoming
              </span>
            )}
            {isClosed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border border-white/10">
                <CheckCircle2 className="h-3 w-3 text-[#C9A84C]" />
                Concluded
              </span>
            )}
            {event.is_featured && !isFeatured && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-[#C9A84C]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#C9A84C] border border-[#C9A84C]/25">
                <Crown className="h-3 w-3 text-[#C9A84C]" />
                Featured
              </span>
            )}
          </div>

          <div className="rounded-full bg-black/80 px-3 py-1 text-xs font-bold text-[#C9A84C] border border-white/10">
            {formatCurrency(event.vote_price, event.currency)}
            <span className="text-[10px] text-neutral-400 font-normal"> / vote</span>
          </div>
        </div>

        {/* Title overlay on image */}
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-[#C9A84C] mb-1">
            <span>{categoriesCount} {categoriesCount === 1 ? "Category" : "Categories"}</span>
            <span className="text-white/20">•</span>
            <span>{nomineesCount} Nominees</span>
          </div>
          <h3
            className={cn(
              "font-bold tracking-tight text-white line-clamp-1 group-hover:text-[#D4B86A] transition-colors duration-180",
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
          <p className="line-clamp-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
            {event.description || "Discover verified nominees, cast your vote securely, and follow live cryptographic standings."}
          </p>

          {/* Metadata Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-3.5 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-500">
              <Calendar className="h-3.5 w-3.5 text-[#C9A84C]/70 shrink-0" />
              <span className="truncate text-[11px]">
                {isClosed ? "Ended " + formatDate(event.end_date) : `${daysLeft} days remaining`}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 font-semibold text-neutral-400">
              <Trophy className="h-3.5 w-3.5 text-[#C9A84C]/70 shrink-0" />
              <span className="text-[11px]">{event.show_live_results ? "Live Standings" : "Certified"}</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-5 pt-1">
          <Link href={`/events/${event.slug}`}>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-full border border-white/[0.07] bg-[#121212] py-3 text-xs font-bold text-white/80 transition-all duration-200 hover:border-[#C9A84C]/35 hover:bg-[#C9A84C] hover:text-[#050505] cursor-pointer shadow-md active:scale-98"
            >
              <span>{isClosed ? "View Results & Certified Tallies" : "Explore Categories & Nominees"}</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
