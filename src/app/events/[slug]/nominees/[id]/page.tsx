"use client"

import React, { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { VoteModal } from "@/components/public/VoteModal"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import {
  Share2,
  ArrowLeft,
  Trophy,
  ShieldCheck,
  CheckCircle,
  Copy,
  Vote,
  ChevronRight,
  Sparkles,
} from "lucide-react"

export default function CanonicalNomineeDetailPage() {
  const params = useParams()
  const slug = params?.slug as string
  const nomineeId = params?.id as string

  const [event, setEvent] = useState<any>(null)
  const [nominee, setNominee] = useState<any>(null)
  const [category, setCategory] = useState<any>(null)
  const [packages, setPackages] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`/api/events/details?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.event) {
          setEvent(data.event)
          const foundNom = (data.nominees || []).find(
            (n: any) => n.id === nomineeId || n.public_id === nomineeId || n.slug === nomineeId
          )
          setNominee(foundNom || null)
          if (foundNom) {
            const foundCat = (data.categories || []).find((c: any) => c.id === foundNom.category_id)
            setCategory(foundCat || null)
          }
          if (Array.isArray(data.packages)) {
            setPackages(data.packages)
          }
        } else {
          setEvent(null)
          setNominee(null)
        }
      })
      .catch((err) => {
        console.error("Failed to load nominee details:", err)
        setEvent(null)
        setNominee(null)
      })
      .finally(() => setIsLoading(false))
  }, [slug, nomineeId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#06080e] text-white flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C9A84C] border-t-transparent" />
      </div>
    )
  }

  if (!event || !nominee) {
    notFound()
  }

  const voteCount = db.getNomineeVoteCount(nominee.id)
  const leaderboard = db.getLeaderboard(event.id, nominee.category_id)
  const rank = leaderboard.findIndex((item) => item.nominee_id === nominee.id) + 1

  const isClosed = event.status === "closed" || new Date(event.end_date) <= new Date()

  const handleShare = async () => {
    // Share short-share link if available or current canonical URL
    const shortUrl = `${window.location.origin}/nominees/${nominee.public_id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vote for ${nominee.name} - ${event.name}`,
          text: `Support ${nominee.name} in ${event.name}! Cast your verified vote online.`,
          url: shortUrl,
        })
      } catch {}
    } else {
      navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="py-8 sm:py-16 pb-28 sm:pb-20 bg-[#06080e] min-h-screen text-white pt-20 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#06080e]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Context-Aware Breadcrumbs & Back Navigation */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium overflow-x-auto no-scrollbar max-w-full">
            <Link href="/events" className="hover:text-[#C9A84C] transition-colors shrink-0">
              Events
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <Link href={`/events/${event.slug}`} className="hover:text-[#C9A84C] transition-colors truncate max-w-[140px] sm:max-w-[200px]">
              {event.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
            <span className="text-white font-bold truncate max-w-[130px] sm:max-w-[180px]">
              {nominee.name}
            </span>
          </nav>

          {/* Context-aware Back button */}
          <Link
            href={`/events/${event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#C9A84C] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {event.name}</span>
          </Link>
        </div>

        {/* Profile Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 rounded-3xl border border-white/[0.08] bg-[#0a0c14]/95 p-5 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Left Column: Portrait & Quick Share */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-3/4 w-full overflow-hidden rounded-3xl bg-neutral-900 shadow-xl border border-white/[0.06]">
              <img
                src={nominee.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"}
                alt={nominee.name}
                className="h-full w-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c14]/90 via-transparent to-black/30" />

              <div className="absolute top-3.5 left-3.5 rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1 text-xs font-mono font-bold text-[#C9A84C] border border-white/10 shadow-sm">
                #{nominee.public_id}
              </div>

              {rank > 0 && (
                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 rounded-full bg-[#C9A84C] px-3.5 py-1 text-xs font-black text-[#0a0c14] shadow-md shadow-[#C9A84C]/20">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Rank #{rank}</span>
                </div>
              )}
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="w-full text-xs font-bold gap-1.5 rounded-2xl"
              >
                {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                {copied ? "Link Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                className="w-full text-xs font-bold gap-1.5 rounded-2xl"
              >
                <Share2 className="h-4 w-4 text-[#C9A84C]" />
                Share Nominee
              </Button>
            </div>
          </div>

          {/* Right Column: Bio, Stats & Voting Trigger */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-[#C9A84C]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#D4B86A] border border-[#C9A84C]/20">
                    JVican Vote Arena
                  </span>
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-slate-400 truncate">
                    {category?.name || "Official Category"}
                  </span>
                </div>
                <h1 className="text-2xl min-[480px]:text-3xl sm:text-4xl font-black tracking-tight text-white">
                  {nominee.name}
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  Nominee in <Link href={`/events/${event.slug}`} className="text-[#C9A84C] hover:underline">{event.name}</Link>
                </p>
              </div>

              {/* Bio / Manifesto */}
              <div className="rounded-2xl bg-neutral-900/80 p-4 sm:p-5 border border-white/[0.06] text-xs sm:text-sm text-slate-300 leading-relaxed">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Biography &amp; Manifesto
                </div>
                {nominee.description || "Dedicated contender competing in the prestigious annual recognition showcase."}
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-2.5 sm:p-3.5 text-center shadow-xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Verified Votes</span>
                  <div className="text-base sm:text-xl font-black text-white mt-0.5 truncate">
                    {voteCount.toLocaleString()}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-2.5 sm:p-3.5 text-center shadow-xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Standings</span>
                  <div className="text-base sm:text-xl font-black text-[#C9A84C] mt-0.5 truncate">
                    #{rank || "1"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-neutral-900/80 p-2.5 sm:p-3.5 text-center shadow-xs">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">Vote Price</span>
                  <div className="text-base sm:text-xl font-black text-[#C9A84C] mt-0.5 truncate">
                    {formatCurrency(event.vote_price, event.currency)}
                  </div>
                </div>
              </div>

              {/* Fast Vote Bundles Preview */}
              {!isClosed && (
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block">
                      Quick Vote Packages
                    </label>
                    <span className="text-[10px] text-[#C9A84C] font-semibold">Min 10 Votes (₦1,000)</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[10, 25, 50, 100, 250, 500].map((qty) => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setIsVoteModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-2xl border border-white/[0.08] bg-neutral-900/80 hover:bg-neutral-800 hover:border-[#C9A84C]/30 transition-all cursor-pointer"
                      >
                        <span className="text-xs font-black text-white">{qty} Votes</span>
                        <span className="text-[10px] font-bold text-[#C9A84C] mt-0.5">
                          {formatCurrency(qty * Math.max(100, Number(event.vote_price) || 100), event.currency)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voting CTA */}
            <div className="pt-4 border-t border-white/[0.08]">
              <Button
                variant="primary"
                size="xl"
                disabled={isClosed}
                onClick={() => setIsVoteModalOpen(true)}
                className="w-full justify-center text-sm sm:text-base font-extrabold rounded-2xl shadow-lg shadow-[#C9A84C]/20 py-3.5 sm:py-4 btn-shimmer"
              >
                <Vote className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
                {isClosed ? "Voting Closed" : `Vote for ${nominee.name}`}
              </Button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                Processed securely with TransactPay • Cryptographic public receipt generated instantly
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action on Mobile */}
      {!isClosed && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#050608]/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] backdrop-blur-xl shadow-2xl">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsVoteModalOpen(true)}
            className="w-full justify-center text-xs sm:text-sm font-extrabold rounded-full shadow-md shadow-[#C9A84C]/20 btn-shimmer"
          >
            <Vote className="h-4 w-4 mr-2" />
            <span>Vote for {nominee.name} — {formatCurrency(event.vote_price, event.currency)}</span>
          </Button>
        </div>
      )}

      {/* Vote Modal */}
      {isVoteModalOpen && (
        <VoteModal
          isOpen={isVoteModalOpen}
          onClose={() => setIsVoteModalOpen(false)}
          nominee={nominee}
          event={event}
          category={category || null}
          packages={packages}
        />
      )}
    </div>
  )
}
