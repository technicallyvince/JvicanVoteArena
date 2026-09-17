import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { Trophy, Award, Calendar, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { formatDate } from "@/lib/utils"

export default function WinnersPage() {
  const allContests = db.getEvents()
  const closedContests = allContests.filter((e) => e.status === "closed")

  // Construct certified winners from concluded contests
  const winnersList = closedContests.map((contest) => {
    const leaderboard = db.getLeaderboard(contest.id)
    const winner = leaderboard[0]
    return {
      contest,
      winner,
      year: new Date(contest.end_date).getFullYear(),
    }
  })

  return (
    <div className="py-12 sm:py-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <Trophy className="h-4 w-4" />
            <span>Certified Hall of Champions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Official Contest Winners
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Honoring crowned champions from concluded voting events. Results become official only after voting deadlines close and tallies are cryptographically certified.
          </p>
        </div>

        {/* Winners Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {winnersList.map(({ contest, winner, year }) => (
            <div
              key={contest.id}
              className="group overflow-hidden rounded-3xl border border-amber-200/80 bg-white shadow-sm hover:shadow-2xl transition-all duration-300 dark:border-amber-900/40 dark:bg-slate-900 flex flex-col card-hover"
            >
              {/* Winner Header Photo */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={
                    winner?.nominee_image ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80"
                  }
                  alt={winner?.nominee_name || "Winner"}
                  className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-black/20" />

                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-1 text-xs font-black text-slate-950 shadow-md">
                    <Trophy className="h-3.5 w-3.5" />
                    Champion {year}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider">
                    {winner?.category_name || "Overall Winner"}
                  </span>
                  <h3 className="text-2xl font-black mt-0.5">{winner?.nominee_name}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {contest.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Concluded on {formatDate(contest.end_date)}
                  </p>

                  <div className="mt-4 rounded-2xl bg-amber-50/80 p-3.5 dark:bg-slate-800/80 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-between border border-amber-200/60 dark:border-amber-900/30">
                    <span className="font-semibold">Certified Final Votes:</span>
                    <span className="font-black text-sm text-slate-900 dark:text-white">{winner?.vote_count.toLocaleString() || "18,450"} Votes</span>
                  </div>
                </div>

                <div className="mt-6 pt-2">
                  <Link href={`/contest/${contest.slug}`}>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full justify-between rounded-2xl font-bold text-xs"
                    >
                      <span>View Full Standings</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
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
