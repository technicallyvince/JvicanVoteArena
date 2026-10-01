"use client"

import React, { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Modal } from "@/components/ui/Modal"
import { uploadImageFile } from "@/lib/upload"
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
  UserCheck,
  XCircle,
  Clock,
  Mail,
  Phone,
  AtSign,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import Papa from "papaparse"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

export default function EventStudioPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params?.id as string

  const [event, setEvent] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [nominees, setNominees] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [isLoadingEvent, setIsLoadingEvent] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteEvent = async () => {
    if (!confirm(`Are you sure you want to delete "${event.name}"? This action is permanent and will remove all categories and nominees.`)) {
      return
    }
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/events?eventId=${encodeURIComponent(event.id)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete event.")
      router.push("/dashboard/events")
    } catch (err: any) {
      alert(err?.message || "Failed to delete event.")
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    fetch(`/api/events/details?id=${encodeURIComponent(eventId)}&slug=${encodeURIComponent(eventId)}`, { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.event) {
          setEvent(data.event)
          if (Array.isArray(data.categories)) setCategories(data.categories)
          if (Array.isArray(data.nominees)) setNominees(data.nominees)
          if (Array.isArray(data.votes)) setVotes(data.votes)
          if (Array.isArray(data.applications)) setApplications(data.applications)
        } else {
          setEvent(null)
        }
      })
      .catch((err) => {
        console.error("Error loading studio event from database:", err)
        setEvent(null)
      })
      .finally(() => setIsLoadingEvent(false))
  }, [eventId])

  const [activeTab, setActiveTab] = useState<"overview" | "nominees" | "applications" | "categories" | "votes" | "settings">("overview")

  const handleApproveApplication = (appId: string) => {
    if (!event) return
    db.updateNomineeApplicationStatus(appId, "approved")
    setApplications([...db.getNomineeApplications(event.id)])
    setNominees([...db.getNominees(event.id)])
  }

  const handleRejectApplication = (appId: string) => {
    if (!event) return
    db.updateNomineeApplicationStatus(appId, "rejected")
    setApplications([...db.getNomineeApplications(event.id)])
  }

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
    name: event?.name || "",
    description: event?.description || "",
    votePrice: (event?.vote_price || 100).toString(),
    startDate: event?.start_date ? event.start_date.split("T")[0] : "",
    endDate: event?.end_date ? event.end_date.split("T")[0] : "",
    bannerUrl: event?.cover_image_url || "",
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

  // Sync settings form when event is loaded
  useEffect(() => {
    if (event) {
      setSettingsData({
        name: event.name || "",
        description: event.description || "",
        votePrice: (event.vote_price || 100).toString(),
        startDate: event.start_date ? event.start_date.split("T")[0] : "",
        endDate: event.end_date ? event.end_date.split("T")[0] : "",
        bannerUrl: event.cover_image_url || "",
      })
    }
  }, [event?.id, event?.name, event?.description, event?.vote_price, event?.start_date, event?.end_date, event?.cover_image_url])

  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsError, setSettingsError] = useState("")

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsError("")

    const parsedPrice = parseFloat(settingsData.votePrice)
    if (isNaN(parsedPrice) || parsedPrice < 100) {
      setSettingsError("The minimum amount per vote that an organizer can set is ₦100 (NGN).")
      return
    }

    const payload = {
      name: settingsData.name.trim(),
      description: settingsData.description.trim(),
      vote_price: parsedPrice,
      start_date: settingsData.startDate ? new Date(settingsData.startDate).toISOString() : event.start_date,
      end_date: settingsData.endDate ? new Date(settingsData.endDate).toISOString() : event.end_date,
    }

    setIsSavingSettings(true)
    try {
      // 1. Call API to persist to Supabase
      const res = await fetch("/api/events/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...payload,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update event.")
      }

      // 2. Update local state
      db.updateEvent(event.id, payload)
      setEvent((prev: any) => ({ ...prev, ...payload }))

      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 2500)
    } catch (err: any) {
      setSettingsError(err.message || "Failed to save settings.")
    } finally {
      setIsSavingSettings(false)
    }
  }

  const confirmedVotes = Array.isArray(votes) ? votes.filter((v) => v.status === "confirmed") : []
  const totalVotesCount = confirmedVotes.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
  const totalRevenue = confirmedVotes.reduce((acc, v) => acc + (Number(v.total_amount) || 0), 0)
  const isLive = event && (event.status === "published" || event.status === "approved") && new Date(event.end_date) > new Date()

  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-[#050608] text-white flex flex-col items-center justify-center gap-4 pt-24">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#C9A84C] border-t-transparent shadow-lg shadow-[#C9A84C]/20" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Event Studio...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#050608] text-white flex flex-col items-center justify-center px-4 pt-24">
        <div className="max-w-md w-full rounded-3xl border border-white/[0.08] bg-[#0a0c14] p-8 text-center shadow-2xl">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-white">Event Not Found</h2>
          <p className="text-xs text-slate-400 mt-2 mb-6">
            The event you are looking for does not exist or may have been removed.
          </p>
          <Link href="/dashboard/events">
            <Button variant="primary" size="md" className="rounded-full w-full font-bold">
              Return to Events Portfolio
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 sm:py-12 bg-[#050608] min-h-screen text-white relative overflow-hidden pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Context-Aware Breadcrumbs & Back Navigation */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Link href="/dashboard" className="hover:text-[#C9A84C] transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <Link href="/dashboard/events" className="hover:text-[#C9A84C] transition-colors">
              Events
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            <span className="text-white font-bold truncate max-w-[200px]">
              {event.name}
            </span>
          </nav>

          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#C9A84C] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Events</span>
          </Link>
        </div>

        {/* Event Header & Performance Bar */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] backdrop-blur-xl p-5 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={event.logo_url || event.cover_image_url || undefined}
                alt={event.name}
                className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl object-cover ring-2 ring-[#C9A84C]/30 shadow-md shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-white truncate">
                    {event.name}
                  </h1>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                    {isLive ? "LIVE" : event.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
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
                  className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2 text-xs font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Public Event</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-6">
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

        {/* Persistent Event-Level Navigation: Overview | Nominees | Applications | Categories | Votes | Settings */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "overview"
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
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
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Nominees ({nominees.length})
          </button>

          <button
            onClick={() => setActiveTab("applications")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "applications"
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
            )}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Applications ({applications.length})</span>
            {applications.filter((a) => a.status === "pending").length > 0 && (
              <span className="rounded-full bg-amber-400 text-black px-1.5 py-0.2 text-[10px] font-black">
                {applications.filter((a) => a.status === "pending").length} new
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "categories"
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
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
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
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
                ? "bg-[#C9A84C] text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 font-black"
                : "bg-[#0e1018] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-[#161824]"
            )}
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Public Share Link
                </span>
                <p className="text-xs text-[#C9A84C] font-mono break-all mb-4">
                  {typeof window !== "undefined" ? `${window.location.origin}/events/${event.slug}` : `/events/${event.slug}`}
                </p>
                <Link href={`/events/${event.slug}`} target="_blank">
                  <Button variant="primary" size="sm" className="w-full justify-center rounded-full font-bold">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open Public Event
                  </Button>
                </Link>
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Status &amp; Integrity
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="text-sm font-bold text-white">Authoritative Ledger</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Votes are cryptographically anchored and audited for zero duplicates.
                </p>
              </div>

              <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 shadow-xl">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Quick Actions
                </span>
                <div className="space-y-2 mt-2">
                  <button
                    onClick={() => setActiveTab("nominees")}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#0e1018] hover:bg-[#161824] text-xs font-bold text-white flex items-center justify-between"
                  >
                    <span>Add / Manage Nominees</span>
                    <Plus className="h-3.5 w-3.5 text-[#C9A84C]" />
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#0e1018] hover:bg-[#161824] text-xs font-bold text-white flex items-center justify-between"
                  >
                    <span>Export Transaction Ledger</span>
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent transactions stream */}
            <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-6 shadow-xl">
              <h3 className="text-base font-extrabold text-white mb-4">
                Recent Event Transactions
              </h3>
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full min-w-[550px] text-left text-xs">
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
                          <td className="py-3 px-3 font-bold text-[#C9A84C]">+{v.quantity}</td>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0c14] p-5 rounded-3xl border border-white/[0.07]">
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
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-2.5 text-xs font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Add Nominee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {nominees.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const nomineeVotes = db.getNomineeVoteCount(c.id)

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-3xl border border-white/[0.07] bg-[#0a0c14] backdrop-blur-xl shadow-xl hover:border-[#C9A84C]/30 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={c.image_url || undefined}
                        alt={c.name}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#C9A84C]/20 shadow-sm shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-black/80 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#C9A84C]">
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
                        <span className="text-xs font-black text-[#C9A84C] ml-1">
                          {nomineeVotes.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyLink(c.public_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-[#C9A84C] cursor-pointer transition-colors"
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

        {/* TAB: NOMINEE APPLICATIONS (Organizer Approval Queue) */}
        {activeTab === "applications" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0c14] p-5 sm:p-6 rounded-3xl border border-white/[0.07]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Contestant Applications &amp; Approvals
                  </h3>
                  <span className="rounded-full bg-[#C9A84C]/15 border border-[#C9A84C]/30 px-2.5 py-0.5 text-xs font-black text-[#D4B86A]">
                    {applications.length} Received
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  People applying to contest as nominees. Only approved candidates receive a public voting ID and appear on the live leaderboard.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {applications.filter((a) => a.status === "pending").length} Pending Review
                </span>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center bg-[#0a0c14]">
                <UserCheck className="mx-auto h-12 w-12 text-neutral-500 mb-3" />
                <h4 className="text-base font-bold text-white">No Applications Received Yet</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                  When contestants apply from the public event page, their submissions will appear here for your review and approval.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => {
                  const category = categories.find((c) => c.id === app.category_id)
                  const isPending = app.status === "pending"
                  const isApproved = app.status === "approved"
                  const isRejected = app.status === "rejected"

                  return (
                    <div
                      key={app.id}
                      className={cn(
                        "rounded-3xl border p-5 sm:p-6 transition-all duration-200 bg-[#0a0c14] backdrop-blur-xl shadow-xl",
                        isPending
                          ? "border-[#C9A84C]/35 ring-1 ring-[#C9A84C]/10"
                          : isApproved
                          ? "border-emerald-500/20 bg-emerald-950/05"
                          : "border-white/[0.06] opacity-75"
                      )}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Candidate Details */}
                        <div className="flex items-start gap-4">
                          <img
                            src={
                              app.image_url ||
                              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80"
                            }
                            alt={app.full_name}
                            className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover ring-2 ring-white/10 shadow-md shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h4 className="text-base sm:text-lg font-black text-white">
                                {app.full_name}
                              </h4>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-400">
                                  <Clock className="h-3 w-3" />
                                  Pending Review
                                </span>
                              )}
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Approved &amp; Live Nominee
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-rose-400">
                                  <XCircle className="h-3 w-3" />
                                  Declined
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                              <span className="font-semibold text-[#C9A84C]">
                                Category: {category?.name || "Official Category"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 text-neutral-500" />
                                {app.email}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-neutral-500" />
                                {app.phone}
                              </span>
                              {app.instagram_handle && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <AtSign className="h-3 w-3 text-[#C9A84C]" />
                                    {app.instagram_handle}
                                  </span>
                                </>
                              )}
                            </div>

                            {app.bio && (
                              <p className="text-xs text-slate-300 leading-relaxed pt-1 line-clamp-2">
                                <strong className="text-white font-semibold">Bio:</strong> {app.bio}
                              </p>
                            )}

                            {app.reason_to_win && (
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                <strong className="text-neutral-300 font-semibold">Vision:</strong> {app.reason_to_win}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2.5 self-end lg:self-center shrink-0">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveApplication(app.id)}
                                className="flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-98"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>Approve Nominee</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectApplication(app.id)}
                                className="flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
                              >
                                <XCircle className="h-4 w-4" />
                                <span>Decline</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Added to Nominees List
                              </span>
                              <button
                                type="button"
                                onClick={() => setActiveTab("nominees")}
                                className="text-xs text-[#C9A84C] hover:underline cursor-pointer ml-2"
                              >
                                View Nominee
                              </button>
                            </div>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              onClick={() => handleApproveApplication(app.id)}
                              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
                            >
                              Reconsider &amp; Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a0c14] p-5 rounded-3xl border border-white/[0.07]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Event Categories
                </h3>
                <p className="text-xs text-slate-400">Group your nominees into distinct competition titles.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A84C] px-6 py-2.5 text-xs font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
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
                    className="p-5 rounded-3xl border border-white/[0.07] bg-[#0a0c14] backdrop-blur-xl shadow-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{cat.description || "Official category"}</p>
                      <span className="text-[11px] font-bold text-[#C9A84C] mt-2 block">
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
          <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
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
                <thead className="border-b border-white/10 bg-[#0e1018]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
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
                      <tr key={v.id} className="hover:bg-[#161824]/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">
                          {formatDateTime(v.created_at)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {nom?.name || "Nominee"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {cat?.name || "Category"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#C9A84C]">
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
          <div className="max-w-2xl rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-8 shadow-2xl">
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
                  className="w-full rounded-2xl border border-white/[0.08] bg-[#0e1018] p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div>
                <Input
                  label="Vote Price (NGN)"
                  type="number"
                  min="100"
                  value={settingsData.votePrice}
                  onChange={(e) => {
                    setSettingsData({ ...settingsData, votePrice: e.target.value })
                    if (settingsError) setSettingsError("")
                  }}
                  required
                />
                <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                  * Minimum allowed price per vote is ₦100.
                </p>
              </div>

              {settingsError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{settingsError}</span>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between">
                {settingsSaved ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Changes Saved
                  </span>
                ) : <div />}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSavingSettings}
                  className="rounded-full font-bold"
                >
                  {isSavingSettings ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>

            {/* Danger Zone: Delete Event */}
            <div className="mt-8 rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                    <Trash2 className="h-4 w-4" />
                    Danger Zone
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Permanently delete this event, its categories, and its nominees from the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteEvent}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-full border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center justify-center gap-2 shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete Event"}</span>
                </button>
              </div>
            </div>
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
              className="w-full rounded-2xl border border-white/[0.08] bg-[#0e1018] p-3 text-xs sm:text-sm text-white focus:outline-none"
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
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-[#0e1018]">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                {nomineeImage ? (
                  <img src={nomineeImage} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <Users className="h-6 w-6 text-slate-600" />
                )}
              </div>
              <label className="flex-1 flex items-center justify-center px-4 py-2.5 rounded-full border border-dashed border-[#C9A84C]/40 bg-[#C9A84C]/10 text-xs font-bold text-white hover:bg-[#C9A84C]/20 cursor-pointer">
                <span>{nomineeImage ? "Replace Photo" : "Upload Photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      try {
                        const url = await uploadImageFile(file, "nominees")
                        setNomineeImage(url)
                      } catch {
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          if (typeof reader.result === "string") {
                            setNomineeImage(reader.result)
                          }
                        }
                        reader.readAsDataURL(file)
                      }
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
              className="w-full rounded-2xl border border-white/[0.08] bg-[#0e1018] p-3 text-xs sm:text-sm text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddNomineeOpen(false)}
              className="px-5 py-2 text-xs font-bold rounded-full border border-white/10 bg-[#0e1018] text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-black rounded-full bg-[#C9A84C] text-[#0a0c14] hover:bg-[#D4B86A]"
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
              className="px-5 py-2 text-xs font-bold rounded-full border border-white/10 bg-[#0e1018] text-slate-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-xs font-black rounded-full bg-[#C9A84C] text-[#0a0c14] hover:bg-[#D4B86A]"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
