import React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { db } from "@/lib/db"
import { Trophy, ArrowRight, Sparkles } from "lucide-react"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Official Winners & Certified Champions",
  description:
    "Honoring crowned winners and champions from concluded voting events on JVican Vote Arena. Transparent, tamper-proof certified results.",
  openGraph: {
    title: "Official Winners & Certified Champions | JVican Vote Arena",
    description: "Certified champions from concluded pageants, awards, and recognitions.",
  },
}

export default function WinnersPage() {
  const allEvents = db.getEvents()
  const closedEvents = allEvents.filter((e) => e.status === "closed")

  // Construct certified winners from concluded events adhering to Management Qualification Rules:
  // 1. Minimum 1,000 votes required to qualify for awards
  // 2. If a category has exactly 2 contestants, both must pull 1,000+ votes to avoid void votes
  const MIN_QUALIFICATION_VOTES = 1000

  const winnersList = closedEvents.flatMap((event) => {
    const categories = db.getCategories(event.id)
    const year = new Date(event.end_date).getFullYear()

    // Process per category to accurately handle 2-contestant rule & 1,000 vote threshold
    return categories.map((cat) => {
      const catNominees = db.getNominees(event.id).filter((n) => n.category_id === cat.id)
      const leaderboard = catNominees.map((n) => ({
        ...n,
        nominee_id: n.id,
        nominee_name: n.name,
        nominee_image: n.image_url,
        category_name: cat.name,
        vote_count: db.getNomineeVoteCount(n.id),
      })).sort((a, b) => b.vote_count - a.vote_count)

      const topContender = leaderboard[0]
      const contestantCount = leaderboard.length

      // Category Void Check: In a 2-contestant category, both must pull 1,000+ votes
      const isTwoContestantVoid =
        contestantCount === 2 && leaderboard.some((c) => c.vote_count < MIN_QUALIFICATION_VOTES)

      // General Qualification Check: Winner must have at least 1,000 votes
      const isQualified =
        !isTwoContestantVoid && topContender && topContender.vote_count >= MIN_QUALIFICATION_VOTES

      return {
        event,
        category: cat,
        winner: topContender,
        isQualified,
        isTwoContestantVoid,
        contestantCount,
        year,
      }
    })
  })

  return (
    <div className="py-10 sm:py-16 min-h-screen bg-[#040404] text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#040404]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="max-w-3xl border-b border-white/[0.08] pb-6 sm:pb-8 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0c0c0c] px-3.5 py-1 text-xs font-semibold text-neutral-300 mb-3">
            <Trophy className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Certified Champions</span>
          </div>
          <h1 className="text-3xl min-[420px]:text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Official Event Winners
          </h1>
          <p className="mt-3 text-xs sm:text-base text-neutral-400 leading-relaxed">
            Honoring crowned champions from concluded voting events. Results become official only after voting deadlines close, 1,000+ vote qualification thresholds are met, and tallies are certified.
          </p>
        </div>

        {/* Management Qualification Rules Banner */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0a] p-5 sm:p-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D4B86A]">
                Official Award Qualification Rules
              </h3>
              <p className="text-xs text-neutral-300">
                Contestants must pull up to one thousand (<strong>1,000 votes or above</strong>) to qualify for awards. If a category has two contestants, both must pull 1,000+ votes to avoid void votes.
              </p>
            </div>
            <div className="shrink-0 text-[11px] font-semibold text-neutral-400 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
              By Management: <span className="text-white font-bold">JVICAN MASCOT INFLATABLE ENTERTAINMENT</span>
            </div>
          </div>
        </div>

        {/* Winners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {winnersList.map(({ event, category, winner, isQualified, isTwoContestantVoid, contestantCount, year }) => (
            <div
              key={`${event.id}-${category.id}`}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0a] transition-colors duration-200 hover:border-[#C9A84C]/40 flex flex-col"
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14] via-[#0a0c14]/40 to-transparent" />

                <div className="absolute top-3.5 left-3.5">
                  {isQualified ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C] px-3.5 py-1 text-xs font-black text-[#0a0c14] shadow-md">
                      <Trophy className="h-3.5 w-3.5" />
                      Champion {year}
                    </span>
                  ) : isTwoContestantVoid ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-3.5 py-1 text-xs font-black text-white shadow-md">
                      Votes Voided (Rule: &lt;1,000)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 px-3.5 py-1 text-xs font-black text-white shadow-md">
                      Under 1,000 Threshold
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3.5 left-4 right-4 text-white">
                  <span className="text-[11px] font-bold text-[#C9A84C] uppercase tracking-wider">
                    {category.name}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black mt-0.5 text-white">
                    {winner?.nominee_name || "No Contestant"}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">
                    {event.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Concluded on {formatDate(event.end_date)}
                  </p>

                  <div className="mt-4 rounded-2xl bg-[#0e1018] p-3.5 text-xs flex items-center justify-between border border-white/[0.05]">
                    <span className="font-semibold text-slate-400">Final Tallied Votes:</span>
                    <span className="font-black text-sm text-[#C9A84C]">
                      {winner ? `${winner.vote_count.toLocaleString()} Votes` : "0 Votes"}
                    </span>
                  </div>

                  {isTwoContestantVoid && (
                    <p className="mt-2 text-[11px] text-rose-400 font-medium">
                      Notice: Category had 2 contestants and did not meet the mandatory 1,000-vote threshold per contestant.
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-2">
                  <Link href={`/events/${event.slug}`}>
                    <button
                      type="button"
                      className="w-full flex items-center justify-between rounded-full border border-white/[0.07] bg-[#0e1018] py-3 px-5 text-xs font-bold text-slate-300 hover:text-white hover:border-[#C9A84C]/40 hover:bg-[#161824] transition-all cursor-pointer"
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
