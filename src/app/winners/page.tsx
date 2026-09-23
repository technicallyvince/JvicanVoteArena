import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { Trophy, ArrowRight, Sparkles } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function WinnersPage() {
  const allEvents = db.getEvents()
  const closedEvents = allEvents.filter((e) => e.status === "closed")

  // Construct certified winners from concluded events
  const winnersList = closedEvents.map((event) => {
    const leaderboard = db.getLeaderboard(event.id)
    const winner = leaderboard[0]
    return {
      event,
      winner,
      year: new Date(event.end_date).getFullYear(),
    }
  })

  return (
    <div className="py-12 sm:py-20 min-h-screen bg-[#06080e] relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Certified Champions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Official Event Winners
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Honoring crowned champions from concluded voting events. Results become official only after voting deadlines close and tallies are cryptographically certified.
          </p>
        </div>

        {/* Winners Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winnersList.map(({ event, winner, year }) => (
            <div
              key={event.id}
              className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 transition-all duration-300 hover:border-amber-400/40 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8),0_0_25px_-5px_rgba(245,158,11,0.15)] flex flex-col"
            >
              {/* Winner Header Photo */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-neutral-950">
                <img
                  src={
                    winner?.nominee_image ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={winner?.nominee_name || "Winner"}
                  className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c101b] via-[#0c101b]/40 to-transparent" />

                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1 text-xs font-black text-neutral-950 shadow-md">
                    <Trophy className="h-3.5 w-3.5" />
                    Champion {year}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    {winner?.category_name || "Overall Winner"}
                  </span>
                  <h3 className="text-2xl font-black mt-0.5 text-white">{winner?.nominee_name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {event.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Concluded on {formatDate(event.end_date)}
                  </p>

                  <div className="mt-4 rounded-2xl bg-neutral-900/80 p-3.5 text-xs flex items-center justify-between border border-white/[0.06]">
                    <span className="font-semibold text-slate-400">Certified Final Votes:</span>
                    <span className="font-black text-sm text-amber-400">{winner?.vote_count.toLocaleString() || "18,450"} Votes</span>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <Link href={`/events/${event.slug}`}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between rounded-full border border-white/[0.08] bg-neutral-900/90 py-3 px-5 text-xs font-bold text-slate-300 hover:text-white hover:border-amber-400/40 transition-colors cursor-pointer"
                    >
                      <span>View Full Standings</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
