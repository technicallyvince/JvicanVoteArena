import React from "react"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { ArrowUpRight, ArrowRight, Trophy, Users, Zap, ShieldCheck } from "lucide-react"

export default function HomePage() {
  const allEvents = db.getEvents()
  const activeEvents = allEvents.filter((e) => e.status === "published")
  const closedEvents = allEvents.filter((e) => e.status === "closed")

  // Primary spotlight
  const heroContest = activeEvents.find((e) => e.slug === "miss-igbeti-2026") || activeEvents[0] || allEvents[0]
  const heroLeaderboard = heroContest ? db.getLeaderboard(heroContest.id) : []

  // Featured grid contests
  const mrIgbeti = allEvents.find((e) => e.slug === "mr-igbeti-2026")
  const mcIcon = allEvents.find((e) => e.slug === "mc-icon-igbeti-2026")
  const bestTeacher = allEvents.find((e) => e.slug === "best-teacher-igbeti-2026")
  const bestPhotographer = allEvents.find((e) => e.slug === "best-photographer-igbeti-2026")

  // Contestants gallery — use public_id for routing
  const allNominees = db.getNominees().filter((n) => n.status === "active")
  const galleryContestants = allNominees.slice(0, 4)

  // Champions section
  const closedContest = closedEvents[0] || allEvents[allEvents.length - 1]
  const winnerLeaderboard = closedContest ? db.getLeaderboard(closedContest.id) : []
  const champion = winnerLeaderboard[0]

  // Live platform stats
  const totalVotes = db.getVotes().filter((v) => v.status === "confirmed").reduce((a, v) => a + v.quantity, 0)
  const totalContests = allEvents.length

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#090d16]">

      {/* ═══════════════════════════════════════════════════════════════════
          1. HERO — Dark editorial, dominant headline, contest poster
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06080e] text-white">
        {/* Atmospheric glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-amber-500/10 via-sky-500/6 to-transparent blur-[120px]" />
          <div className="absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-amber-400/8 blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pb-32 lg:pt-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">

            {/* Left: Text block */}
            <div className="flex flex-col items-start lg:col-span-7">
              {/* Brand pill */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-500/10 px-3.5 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  JVican Vote Arena — Live
                </span>
              </div>

              {/* Dominant headline */}
              <h1 className="text-fluid-marklab-hero font-extrabold tracking-tight text-white">
                Every vote
                <br />
                <span className="font-serif italic font-normal bg-gradient-to-r from-amber-300 via-amber-100 to-sky-200 bg-clip-text text-transparent">
                  has a moment.
                </span>
              </h1>

              <p className="mt-6 max-w-[540px] text-base font-light leading-relaxed text-slate-300 sm:text-lg">
                Discover contests, meet the people competing, and make your vote count — with instant cryptographic verification.
              </p>

              {/* CTA row */}
              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
                <Link href="/contests">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center gap-2 rounded-full px-7 font-extrabold shadow-lg shadow-amber-500/20 sm:w-auto"
                  >
                    Explore Contests
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/create-contest">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full justify-center gap-2 rounded-full border-white/20 bg-white/5 px-7 font-semibold text-slate-200 hover:bg-white/10 hover:text-white sm:w-auto"
                  >
                    Create a Contest
                  </Button>
                </Link>
              </div>

              {/* Trust stats strip */}
              <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-white/10 pt-8">
                <div>
                  <div className="text-2xl font-black text-white">{totalVotes.toLocaleString()}+</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Verified Votes Cast</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-black text-white">{totalContests}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Active Contests</div>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <div>
                  <div className="text-2xl font-black text-white">100%</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">Auditable Receipts</div>
                </div>
              </div>
            </div>

            {/* Right: Hero poster */}
            {heroContest && (
              <div className="w-full lg:col-span-5">
                <Link
                  href={`/contest/${heroContest.slug}`}
                  className="group relative block overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl transition-all duration-500 hover:border-amber-400/40 hover:scale-[1.01] sm:rounded-[32px]"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[3/4]">
                    <img
                      src={heroContest.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80"}
                      alt={heroContest.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                    {/* Live badge */}
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE ARENA
                      </span>
                    </div>

                    {/* Price badge */}
                    <div className="absolute right-4 top-4">
                      <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                        {formatCurrency(heroContest.vote_price, heroContest.currency)} / vote
                      </span>
                    </div>

                    {/* Bottom info */}
                    <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                      <div>
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-amber-300 mb-1">
                          Featured Competition
                        </span>
                        <h3 className="text-2xl font-extrabold leading-tight group-hover:text-amber-300 transition-colors sm:text-3xl">
                          {heroContest.name}
                        </h3>
                        <p className="mt-1 line-clamp-1 text-xs font-light text-slate-300">
                          {heroContest.description}
                        </p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          2. DISCOVERY STRIP — Quick-scroll event list
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-b border-slate-200/80 bg-white py-5 dark:border-slate-800 dark:bg-[#070a10]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
            <div className="flex shrink-0 items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                In the Arena
              </span>
            </div>
            <div className="flex items-center gap-6 overflow-x-auto py-1 no-scrollbar sm:gap-8">
              {allEvents.map((evt) => (
                <Link
                  key={evt.id}
                  href={`/contest/${evt.slug}`}
                  className="group flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 sm:text-sm"
                >
                  <span>{evt.name}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                    evt.status === "closed"
                      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
                      : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                  }`}>
                    {evt.status === "closed" ? "Concluded" : "Live"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          3. FEATURED CONTESTS — Asymmetric editorial bento grid
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#fafafa] dark:bg-[#090d16]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:mb-12">
            <div className="max-w-xl">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Featured Contests
              </span>
              <h2 className="text-fluid-editorial-h2 font-black tracking-tight text-slate-900 dark:text-white">
                Something worth voting for.
              </h2>
            </div>
            <Link href="/contests" className="shrink-0">
              <Button variant="outline" size="sm" className="rounded-full px-5 text-xs font-bold gap-2">
                All Contests
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-6">

            {/* Primary large card (full width → sm:full → lg:7cols) */}
            {heroContest && (
              <Link
                href={`/contest/${heroContest.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:col-span-2 lg:col-span-7 lg:rounded-[28px]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800 lg:aspect-[16/9]">
                  <img
                    src={heroContest.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80"}
                    alt={heroContest.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-amber-300 mb-0.5">Primary Stage</span>
                    <h3 className="text-xl font-black sm:text-2xl lg:text-3xl">{heroContest.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5">
                  <p className="line-clamp-1 text-xs font-light text-slate-500 dark:text-slate-400 sm:text-sm">
                    {heroContest.description}
                  </p>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-amber-600 transition-transform group-hover:translate-x-1 dark:text-amber-400">
                    Vote <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            )}

            {/* Companion card (lg:5cols) */}
            {mrIgbeti && (
              <Link
                href={`/contest/${mrIgbeti.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:col-span-5 lg:rounded-[28px]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                  <img
                    src={mrIgbeti.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80"}
                    alt={mrIgbeti.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-black sm:text-xl">{mrIgbeti.name}</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{mrIgbeti.description}</p>
                  <ArrowRight className="h-4 w-4 shrink-0 text-amber-500 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            )}

            {/* Small cards row — each 4cols on lg */}
            {[mcIcon, bestTeacher, bestPhotographer].filter(Boolean).map((contest, i) => (
              <Link
                key={contest!.id}
                href={`/contest/${contest!.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:col-span-4 lg:rounded-[24px]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-800">
                  <img
                    src={contest!.cover_image_url || "https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&auto=format&fit=crop&q=80"}
                    alt={contest!.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {contest!.status === "closed" ? (
                    <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                      Concluded
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                      Live
                    </span>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="text-sm font-extrabold leading-snug sm:text-base">{contest!.name}</h4>
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-[11px] font-mono text-slate-400">
                    {contest!.status === "closed" ? "Certified Results" : `${formatCurrency(contest!.vote_price, contest!.currency)} / vote`}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform dark:text-amber-400">
                    {contest!.status === "closed" ? "View" : "Vote"} <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          4. CONTESTANTS GALLERY — Portrait editorial grid
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="border-y border-slate-200/80 bg-white py-16 dark:border-slate-800 dark:bg-[#070a10] sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-lg">
              <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                The Contestants
              </span>
              <h2 className="text-fluid-editorial-h2 font-black tracking-tight text-slate-900 dark:text-white">
                Meet the people in the arena.
              </h2>
            </div>
            <Link href="/contestants" className="shrink-0">
              <Button variant="outline" size="sm" className="rounded-full px-5 text-xs font-bold gap-2">
                All Contestants <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Portrait grid — stacks on mobile, 2-col sm, asymmetric lg */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-12 lg:gap-6">

            {/* Large hero portrait (lg: 7 cols) */}
            {galleryContestants[0] && (
              <Link
                href={`/contestant/${galleryContestants[0].public_id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800 sm:col-span-2 lg:col-span-7 lg:rounded-[28px]"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[16/11]">
                  <img
                    src={galleryContestants[0].image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=80"}
                    alt={galleryContestants[0].name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] font-bold text-amber-300 backdrop-blur-md">
                      #{galleryContestants[0].public_id}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                    <div>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-300">
                        Miss Igbeti 2026
                      </span>
                      <h3 className="mt-0.5 text-xl font-black sm:text-2xl lg:text-3xl">{galleryContestants[0].name}</h3>
                      <p className="mt-1 max-w-xs line-clamp-1 text-xs font-light text-slate-300">
                        {galleryContestants[0].description}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-md transition-transform duration-300 group-hover:scale-110">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Portrait 2 (lg: 5 cols) */}
            {galleryContestants[1] && (
              <Link
                href={`/contestant/${galleryContestants[1].public_id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800 lg:col-span-5 lg:rounded-[28px]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-[4/5]">
                  <img
                    src={galleryContestants[1].image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"}
                    alt={galleryContestants[1].name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute left-4 top-4">
                    <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 font-mono text-[11px] font-bold text-amber-300 backdrop-blur-md">
                      #{galleryContestants[1].public_id}
                    </span>
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <h3 className="text-lg font-black sm:text-xl">{galleryContestants[1].name}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs font-light text-slate-300">{galleryContestants[1].description}</p>
                  </div>
                </div>
              </Link>
            )}

            {/* Portraits 3 & 4 (lg: 6 cols each) */}
            {[galleryContestants[2], galleryContestants[3]].filter(Boolean).map((c) => (
              <Link
                key={c!.id}
                href={`/contestant/${c!.public_id}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-md transition-all duration-300 hover:shadow-xl dark:border-slate-800 lg:col-span-6 lg:rounded-[24px]"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <img
                    src={c!.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80"}
                    alt={c!.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-300">#{c!.public_id}</span>
                    <h3 className="mt-0.5 text-base font-black sm:text-lg">{c!.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          5. LIVE TALLY — Dark section with real-time standings
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#06080e] py-16 text-white sm:py-24 lg:py-32">
        <div className="pointer-events-none absolute left-1/4 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">

            {/* Left: headline */}
            <div className="space-y-5 lg:col-span-5">
              <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Live Tally Momentum
              </div>
              <h2 className="text-fluid-editorial-h2 font-extrabold tracking-tight text-white">
                The arena is live.
              </h2>
              <p className="text-base font-light leading-relaxed text-slate-300">
                Votes recorded server-side with instant receipts. Watch verified standings evolve in real time.
              </p>
              <Link href="/contest/miss-igbeti-2026">
                <Button
                  variant="primary"
                  size="md"
                  className="mt-2 rounded-full px-7 font-bold text-xs"
                >
                  View Live Leaderboard
                </Button>
              </Link>
            </div>

            {/* Right: standings */}
            <div className="space-y-3 lg:col-span-7">
              {heroLeaderboard.slice(0, 3).map((item, idx) => (
                <div
                  key={item.nominee_id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:border-amber-400/30 sm:p-5"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="w-8 shrink-0 font-mono text-base font-black text-amber-400 sm:text-lg">
                      #{String(idx + 1).padStart(2, "0")}
                    </span>
                    <img
                      src={item.nominee_image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                      alt={item.nominee_name}
                      className="h-11 w-11 rounded-full border border-white/20 object-cover shrink-0 sm:h-13 sm:w-13"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white sm:text-base">{item.nominee_name}</h4>
                      <span className="font-mono text-[11px] text-slate-400">#{item.public_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono text-base font-black text-amber-300 sm:text-xl">
                      {item.vote_count.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-light text-slate-400 sm:text-xs">verified votes</span>
                  </div>
                </div>
              ))}
              {heroLeaderboard.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                  Voting is live — cast the first vote!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          6. HOW IT WORKS — 4 editorial steps
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16 dark:bg-[#070a10] sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-xl sm:mb-16">
            <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              How It Works
            </span>
            <h2 className="text-fluid-editorial-h2 font-black tracking-tight text-slate-900 dark:text-white">
              Your vote is only four steps away.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
            {[
              {
                num: "01", title: "Discover",
                desc: "Explore active contests — beauty pageants, leadership honours, and creative arts competitions.",
              },
              {
                num: "02", title: "Choose",
                desc: "Meet the contestants, read their profiles, and decide who deserves your support.",
              },
              {
                num: "03", title: "Vote",
                desc: "Select a vote package and pay securely with TransactPay. No account required.",
              },
              {
                num: "04", title: "Confirm",
                desc: "Receive your instant cryptographic receipt and watch the live leaderboard update.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="flex flex-col border-t-2 border-slate-200 pt-6 dark:border-slate-800"
              >
                <span className="mb-4 font-mono text-3xl font-extrabold text-amber-500 sm:text-4xl">
                  {step.num}
                </span>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{step.title}</h3>
                <p className="text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          7. CHAMPIONS — Winner spotlight (only if concluded contest exists)
         ═══════════════════════════════════════════════════════════════════ */}
      {champion && (
        <section className="border-t border-slate-800 bg-[#090d16] py-16 text-white sm:py-24 lg:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">

              {/* Winner poster */}
              <div className="lg:col-span-6">
                <div className="relative w-full overflow-hidden rounded-2xl border border-amber-400/25 bg-slate-900 shadow-2xl lg:rounded-[28px]">
                  <div className="relative aspect-[4/3] sm:aspect-[16/10]">
                    <img
                      src={champion.nominee_image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&auto=format&fit=crop&q=80"}
                      alt={champion.nominee_name}
                      className="h-full w-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-1 text-xs font-black text-slate-950">
                        <Trophy className="h-3.5 w-3.5" />
                        Crowned Champion
                      </span>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-300">
                        {closedContest?.name}
                      </span>
                      <h3 className="mt-0.5 text-2xl font-black sm:text-3xl">{champion.nominee_name}</h3>
                      <p className="mt-1 text-xs font-light text-slate-300">
                        {champion.vote_count.toLocaleString()} certified votes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Narrative */}
              <div className="space-y-5 lg:col-span-6">
                <span className="block text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
                  The Winners
                </span>
                <h2 className="text-fluid-editorial-h2 font-black tracking-tight text-white">
                  Some votes become history.
                </h2>
                <p className="text-base font-light leading-relaxed text-slate-300">
                  When voting closes, certified champions earn their recognition through transparent, fully auditable results.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link href="/winners">
                    <Button
                      variant="outline"
                      size="md"
                      className="rounded-full border-amber-400/40 px-6 text-xs font-semibold text-amber-300 hover:bg-amber-400 hover:text-slate-950"
                    >
                      Explore All Champions
                    </Button>
                  </Link>
                  {closedContest && (
                    <Link href={`/contest/${closedContest.slug}`}>
                      <Button
                        variant="outline"
                        size="md"
                        className="rounded-full border-white/15 px-6 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
                      >
                        View Full Results
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          8. TRUST / PLATFORM PILLARS
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-[#fafafa] py-16 dark:bg-[#090d16] sm:py-20 border-t border-slate-200/80 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[
              {
                icon: <ShieldCheck className="h-5 w-5 text-emerald-600" />,
                bg: "bg-emerald-50 dark:bg-emerald-950/40",
                title: "Server-Authoritative",
                desc: "All vote pricing is enforced server-side. No client manipulation possible.",
              },
              {
                icon: <Zap className="h-5 w-5 text-amber-600" />,
                bg: "bg-amber-50 dark:bg-amber-950/40",
                title: "Instant Receipts",
                desc: "Every payment generates a cryptographic, publicly verifiable vote receipt.",
              },
              {
                icon: <Users className="h-5 w-5 text-blue-600" />,
                bg: "bg-blue-50 dark:bg-blue-950/40",
                title: "Zero Registration",
                desc: "Voters never create accounts. Just pick a package, pay, and vote.",
              },
            ].map((pillar) => (
              <div
                key={pillar.title}
                className="flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${pillar.bg}`}>
                  {pillar.icon}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{pillar.title}</h4>
                  <p className="mt-1 text-xs font-light leading-relaxed text-slate-500 dark:text-slate-400">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          9. FINAL CTA — "Bring your contest to the arena"
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-t border-white/5 bg-[#06080e] py-20 text-center text-white sm:py-28 lg:py-36">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-fluid-editorial-h2 font-extrabold tracking-tight text-white">
            Bring your contest
            <br />
            <span className="font-serif italic font-normal bg-gradient-to-r from-amber-300 to-sky-200 bg-clip-text text-transparent">
              to the arena.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base font-light leading-relaxed text-slate-300 sm:text-lg">
            Create your contest, enroll contestants, manage voting, and follow results — all from one place.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/create-contest">
              <Button
                variant="primary"
                size="xl"
                className="w-full rounded-full px-9 font-bold shadow-xl shadow-amber-500/20 gap-2 sm:w-auto"
              >
                Create a Contest <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contests">
              <Button
                variant="outline"
                size="xl"
                className="w-full rounded-full border-white/20 bg-white/5 px-9 font-semibold text-slate-200 hover:bg-white/10 hover:text-white sm:w-auto"
              >
                Explore Contests
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
