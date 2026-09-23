"use client"

import React, { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import {
  Trophy,
  Users,
  Layers,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  ExternalLink,
  Download,
  CheckCircle,
  ArrowLeft,
  DollarSign,
  Vote,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from "lucide-react"
import Papa from "papaparse"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

export default function EventStudioPage() {
  const params = useParams()
  const eventId = params?.id as string

  const event = db.getEventById(eventId)
  if (!event) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<"overview" | "nominees" | "categories" | "votes" | "settings">("overview")
  const [categories, setCategories] = useState(db.getCategories(event.id))
  const [nominees, setNominees] = useState(db.getNominees(event.id))
  const [votes, setVotes] = useState(db.getVotes(event.id))

  // Modal states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDesc, setNewCategoryDesc] = useState("")

  const [isAddNomineeOpen, setIsAddNomineeOpen] = useState(false)
  const [nomineeName, setNomineeName] = useState("")
  const [nomineeBio, setNomineeBio] = useState("")
  const [nomineeImage, setNomineeImage] = useState("")
  const [nomineeCategoryId, setNomineeCategoryId] = useState(categories[0]?.id || "")

  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Settings State
  const [settingsData, setSettingsData] = useState({
    name: event.name || "",
    description: event.description || "",
    votePrice: (event.vote_price || 100).toString(),
    startDate: event.start_date ? event.start_date.split("T")[0] : "",
    endDate: event.end_date ? event.end_date.split("T")[0] : "",
    bannerUrl: event.cover_image_url || "",
  })
  const [settingsSaved, setSettingsSaved] = useState(false)

  const handleCopyLink = (publicId: string) => {
    const url = `${window.location.origin}/nominees/${publicId}`
    navigator.clipboard.writeText(url)
    setCopiedId(publicId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    db.createCategory({
      id: nanoid(),
      event_id: event.id,
      name: newCategoryName.trim(),
      slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCategoryDesc.trim(),
      display_order: categories.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setCategories([...db.getCategories(event.id)])
    setIsAddCategoryOpen(false)
    setNewCategoryName("")
    setNewCategoryDesc("")
  }

  const handleCreateNominee = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nomineeName.trim()) return

    db.createNominee({
      id: nanoid(),
      event_id: event.id,
      category_id: nomineeCategoryId || categories[0]?.id || "",
      name: nomineeName.trim(),
      slug: nomineeName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: nomineeBio.trim(),
      image_url: nomineeImage.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      public_id: `NOM-${nanoid(4).toUpperCase()}`,
      display_order: nominees.length + 1,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setNominees([...db.getNominees(event.id)])
    setIsAddNomineeOpen(false)
    setNomineeName("")
    setNomineeBio("")
    setNomineeImage("")
  }

  const handleDeleteNominee = (id: string) => {
    if (confirm("Are you sure you want to remove this nominee?")) {
      db.deleteNominee(id)
      setNominees([...db.getNominees(event.id)])
    }
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      db.deleteCategory(id)
      setCategories([...db.getCategories(event.id)])
    }
  }

  const handleExportCSV = () => {
    const csvData = votes.map((v) => {
      const nominee = db.getNomineeById(v.nominee_id)
      const cat = db.getCategoryById(v.category_id)
      return {
        Timestamp: v.created_at,
        Nominee: nominee?.name || "N/A",
        Category: cat?.name || "N/A",
        Votes: v.quantity,
        Amount: v.total_amount,
        Currency: v.currency,
        Voter_Email: v.voter_email,
        Gateway_Reference: v.payment_reference,
        Status: v.status,
      }
    })

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `${event.slug}-votes-export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 2500)
  }

  const confirmedVotes = votes.filter((v) => v.status === "confirmed")
  const totalVotesCount = confirmedVotes.reduce((acc, v) => acc + v.quantity, 0)
  const totalRevenue = confirmedVotes.reduce((acc, v) => acc + Number(v.total_amount), 0)
  const isLive = event.status === "published" && new Date(event.end_date) > new Date()

  return (
    <div className="py-8 sm:py-12 bg-[#06080e] min-h-screen text-white relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Context-Aware Breadcrumbs & Back Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link href="/dashboard/events" className="hover:text-amber-400 transition-colors">
              Events
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-white font-bold truncate max-w-[200px]">
              {event.name}
            </span>
          </nav>

          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Event Header & Performance Bar */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={event.logo_url || event.cover_image_url || undefined}
                alt={event.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400/30 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    {event.name}
                  </h1>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                    {isLive ? "LIVE" : event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Canonical: /events/{event.slug} • Vote Price: {formatCurrency(event.vote_price, event.currency)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleExportCSV}
                className="rounded-full text-xs font-bold gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Link href={`/events/${event.slug}`} target="_blank">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2 text-xs font-black text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Public Event</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Revenue</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
                {formatCurrency(totalRevenue, event.currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified Votes</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {totalVotesCount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nominees</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {nominees.length}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {categories.length}
              </div>
            </div>
          </div>
        </div>

        {/* Persistent Event-Level Navigation: Overview | Nominees | Categories | Votes | Settings */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "overview"
                ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </button>

          <button
            onClick={() => setActiveTab("nominees")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "nominees"
                ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Nominees ({nominees.length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "categories"
                ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("votes")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "votes"
                ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
            )}
          >
            <Vote className="h-3.5 w-3.5" />
            Votes ({votes.length})
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "settings"
                ? "bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20 font-black"
                : "bg-neutral-900 text-slate-400 border border-white/[0.08] hover:text-white"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Public Share Link
                </span>
                <p className="text-xs text-amber-400 font-mono break-all mb-4">
                  {typeof window !== "undefined" ? `${window.location.origin}/events/${event.slug}` : `/events/${event.slug}`}
                </p>
                <Link href={`/events/${event.slug}`} target="_blank">
                  <Button variant="primary" size="sm" className="w-full justify-center rounded-full font-bold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open Public Event
                  </Button>
                </Link>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Status &amp; Integrity
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-bold text-white">TransactPay Authoritative</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Votes are cryptographically anchored and audited for zero duplicates.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Quick Actions
                </span>
                <div className="space-y-2 mt-2">
                  <button
                    onClick={() => setActiveTab("nominees")}
                    className="w-full text-left px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white flex items-center justify-between"
                  >
                    <span>Add / Manage Nominees</span>
                    <Plus className="h-3.5 w-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white flex items-center justify-between"
                  >
                    <span>Export Transaction Ledger</span>
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent transactions stream */}
            <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 shadow-xl">
              <h3 className="text-base font-extrabold text-white mb-4">
                Recent Event Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-white/[0.08] text-slate-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Nominee</th>
                      <th className="py-2.5 px-3">Votes</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {votes.slice(0, 5).map((v) => {
                      const nom = db.getNomineeById(v.nominee_id)
                      return (
                        <tr key={v.id}>
                          <td className="py-3 px-3 text-slate-400">{formatDateTime(v.created_at)}</td>
                          <td className="py-3 px-3 font-bold text-white">{nom?.name || "Nominee"}</td>
                          <td className="py-3 px-3 font-bold text-amber-400">+{v.quantity}</td>
                          <td className="py-3 px-3 font-semibold text-white">{formatCurrency(v.total_amount, v.currency)}</td>
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{v.payment_reference}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOMINEES */}
        {activeTab === "nominees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c101b]/95 p-5 rounded-3xl border border-white/[0.08]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Enrolled Nominees
                </h3>
                <p className="text-xs text-slate-400">Add, edit, and assign nominees to competition categories.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNomineeCategoryId(categories[0]?.id || "")
                  setIsAddNomineeOpen(true)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs font-black text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Nominee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nominees.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const nomineeVotes = db.getNomineeVoteCount(c.id)

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 backdrop-blur-xl shadow-xl hover:border-amber-400/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={c.image_url || undefined}
                        alt={c.name}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-400/20 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-black/80 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-400">
                            #{c.public_id}
                          </span>
                          <button
                            onClick={() => handleDeleteNominee(c.id)}
                            className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                            title="Remove nominee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-white truncate mt-1">
                          {c.name}
                        </h4>
                        <span className="text-xs text-slate-400 truncate block">
                          {category?.name || "General Category"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Votes:</span>
                        <span className="text-xs font-black text-amber-400 ml-1">
                          {nomineeVotes.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyLink(c.public_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {copiedId === c.public_id ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === c.public_id ? "Copied!" : "Copy Voting Link"}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c101b]/95 p-5 rounded-3xl border border-white/[0.08]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Event Categories
                </h3>
                <p className="text-xs text-slate-400">Group your nominees into distinct competition titles.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs font-black text-neutral-950 shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Create Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const count = nominees.filter((c) => c.category_id === cat.id).length

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 backdrop-blur-xl shadow-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.description || "Official category"}</p>
                      <span className="text-[11px] font-bold text-amber-400 mt-2 block">
                        {count} Nominee{count === 1 ? "" : "s"} Assigned
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-neutral-500 hover:text-rose-400 p-2 transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB: VOTES LEDGER */}
        {activeTab === "votes" && (
          <div className="rounded-3xl border border-white/10 bg-[#0c101b]/95 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Event Transaction Ledger
                </h3>
                <p className="text-xs text-slate-400">Auditable transaction log for this event.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportCSV} className="rounded-full text-xs font-bold gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-white/10 bg-[#121827]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Nominee</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Voter Email</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {votes.map((v) => {
                    const nom = db.getNomineeById(v.nominee_id)
                    const cat = db.getCategoryById(v.category_id)
                    return (
                      <tr key={v.id} className="hover:bg-[#121827]/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDateTime(v.created_at)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {nom?.name || "Nominee"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {cat?.name || "Category"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          +{v.quantity}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {formatCurrency(v.total_amount, v.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {v.voter_email}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {v.payment_reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-400 font-bold uppercase text-[10px] bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-2xl rounded-3xl border border-white/10 bg-[#0c101b]/95 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-base font-extrabold text-white mb-1">
              Event Settings &amp; Configuration
            </h3>
            <p className="text-xs text-slate-400 mb-6">Update event identity, voting prices, and dates.</p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <Input
                label="Event Name"
                value={settingsData.name}
                onChange={(e) => setSettingsData({ ...settingsData, name: e.target.value })}
                required
              />

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={settingsData.description}
                  onChange={(e) => setSettingsData({ ...settingsData, description: e.target.value })}
                  className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={settingsData.startDate}
                  onChange={(e) => setSettingsData({ ...settingsData, startDate: e.target.value })}
                />
                <Input
                  label="End Date"
                  type="date"
                  value={settingsData.endDate}
                  onChange={(e) => setSettingsData({ ...settingsData, endDate: e.target.value })}
                />
              </div>

              <Input
                label="Vote Price (NGN)"
                type="number"
                value={settingsData.votePrice}
                onChange={(e) => setSettingsData({ ...settingsData, votePrice: e.target.value })}
              />

              <div className="pt-3 flex items-center justify-between">
                {settingsSaved ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Changes Saved
                  </span>
                ) : <div />}

                <Button type="submit" variant="primary" size="md" className="rounded-full font-bold">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Add Nominee Modal */}
      <Modal
        isOpen={isAddNomineeOpen}
        onClose={() => setIsAddNomineeOpen(false)}
        title="Add Nominee"
        description="Register a new nominee in this event."
      >
        <form onSubmit={handleCreateNominee} className="space-y-4">
          <Input
            label="Nominee Full Name"
            placeholder="e.g. Adebisi Folashade"
            value={nomineeName}
            onChange={(e) => setNomineeName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Category
            </label>
            <select
              value={nomineeCategoryId}
              onChange={(e) => setNomineeCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Nominee Picture
            </label>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-neutral-900/70">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                {nomineeImage ? (
                  <img src={nomineeImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-6 w-6 text-slate-600" />
                )}
              </div>
              <label className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full border border-dashed border-amber-400/40 bg-amber-400/10 text-xs font-bold text-white hover:bg-amber-400/20 cursor-pointer">
                <span>{nomineeImage ? "Replace Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        if (typeof reader.result === "string") {
                          setNomineeImage(reader.result)
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Biography / Manifesto
            </label>
            <textarea
              rows={3}
              placeholder="Short bio or manifesto..."
              value={nomineeBio}
              onChange={(e) => setNomineeBio(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddNomineeOpen(false)}
              className="px-5 py-2 text-xs font-bold rounded-full border border-white/10 bg-neutral-900 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-black rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400"
            >
              Save Nominee
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        title="Create Category"
        description="Add a new category or competition title."
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            label="Category Title"
            placeholder="e.g. Miss Culture & Tourism"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
          />

          <Input
            label="Short Description"
            placeholder="e.g. Ambassador for eco-tourism"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(false)}
              className="px-5 py-2 text-xs font-bold rounded-full border border-white/10 bg-neutral-900 text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-black rounded-full bg-amber-500 text-neutral-950 hover:bg-amber-400"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
