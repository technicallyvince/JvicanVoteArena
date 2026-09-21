"use client"

import React, { useState } from "react"
import { notFound, useParams } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
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

  const [activeTab, setActiveTab] = useState<"nominees" | "categories" | "transactions" | "settings">("nominees")
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

  const handleCopyLink = (publicId: string) => {
    const url = `${window.location.origin}/nominee/${publicId}`
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
    if (confirm("Are you sure you want to remove this candidate?")) {
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
      return {
        Reference: v.payment_reference,
        Voter_Email: v.voter_email,
        Nominee: nominee?.name || "N/A",
        Nominee_ID: nominee?.public_id || "N/A",
        Votes: v.quantity,
        Amount: v.total_amount,
        Currency: v.currency,
        Status: v.status,
        Date: v.created_at,
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

  const confirmedVotes = votes.filter((v) => v.status === "confirmed")
  const totalVotesCount = confirmedVotes.reduce((acc, v) => acc + v.quantity, 0)
  const totalRevenue = confirmedVotes.reduce((acc, v) => acc + Number(v.total_amount), 0)

  return (
    <div className="py-8 sm:py-12 bg-[#080808] min-h-screen text-white relative overflow-hidden pt-24 sm:pt-28">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/3 w-[600px] h-[350px] bg-[#ff5500]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[#ff5500] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Event Title & Quick Stats */}
        <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] backdrop-blur-xl p-6 sm:p-8 shadow-2xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={event.logo_url || event.cover_image_url || undefined}
                alt={event.name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#ff5500]/30 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {event.name}
                  </h1>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
                    {event.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">
                  Slug: /{event.slug} • Vote Price: {formatCurrency(event.vote_price, event.currency)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleExportCSV}
                className="rounded-full text-xs font-bold gap-2 border-white/10 hover:border-[#ff5500]/40 text-neutral-300 hover:text-white"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Link href={`/event/${event.slug}`} target="_blank">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-5 py-2 text-xs font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>View Public Page</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] pt-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total Revenue</span>
              <div className="text-xl sm:text-2xl font-bold text-[#ff5500] mt-0.5">
                {formatCurrency(totalRevenue, event.currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Confirmed Votes</span>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {totalVotesCount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Nominees</span>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {nominees.length}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Categories</span>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                {categories.length}
              </div>
            </div>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("nominees")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "nominees"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25 font-extrabold"
                : "bg-neutral-900 text-neutral-400 border border-white/[0.08] hover:border-white/20 hover:text-white"
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
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25 font-extrabold"
                : "bg-neutral-900 text-neutral-400 border border-white/[0.08] hover:border-white/20 hover:text-white"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-5 py-2.5 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "transactions"
                ? "bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25 font-extrabold"
                : "bg-neutral-900 text-neutral-400 border border-white/[0.08] hover:border-white/20 hover:text-white"
            )}
          >
            <Vote className="h-3.5 w-3.5" />
            Votes Ledger ({votes.length})
          </button>
        </div>

        {/* TAB 1: NOMINEES */}
        {activeTab === "nominees" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-5 rounded-[24px] border border-white/[0.08]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Enrolled Nominees
                </h3>
                <p className="text-xs text-neutral-400">Add or manage candidates competing in this event.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNomineeCategoryId(categories[0]?.id || "")
                  setIsAddNomineeOpen(true)
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add Nominee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nominees.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const candidateVotes = db.getNomineeVoteCount(c.id)

                return (
                  <div
                    key={c.id}
                    className="group flex flex-col justify-between p-5 rounded-[24px] border border-white/[0.08] bg-[#121212] backdrop-blur-xl shadow-xl transition-all duration-200 hover:border-[#ff5500]/30"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={c.image_url || undefined}
                        alt={c.name}
                        className="h-16 w-16 rounded-2xl object-cover ring-2 ring-[#ff5500]/20 shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-black/80 border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#ff8c42]">
                            #{c.public_id}
                          </span>
                          <button
                            onClick={() => handleDeleteNominee(c.id)}
                            className="text-neutral-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                            title="Remove candidate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-bold text-white truncate mt-1 group-hover:text-[#ff8c42] transition-colors">
                          {c.name}
                        </h4>
                        <span className="text-xs text-neutral-400 truncate block">
                          {category?.name || "General Category"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-neutral-400">Votes:</span>
                        <span className="text-xs font-black text-[#ff5500] ml-1">
                          {candidateVotes.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyLink(c.public_id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-[#ff8c42] cursor-pointer transition-colors"
                      >
                        {copiedId === c.public_id ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedId === c.public_id ? "Copied!" : "Direct Link"}</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#121212] p-5 rounded-[24px] border border-white/[0.08]">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Event Categories
                </h3>
                <p className="text-xs text-neutral-400">Group your candidates into distinct competition titles.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff5500] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const count = nominees.filter((c) => c.category_id === cat.id).length

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-[24px] border border-white/[0.08] bg-[#121212] backdrop-blur-xl shadow-xl flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-0.5">{cat.description || "Official title"}</p>
                      <span className="text-[11px] font-bold text-[#ff8c42] mt-2 block">
                        {count} Candidate{count === 1 ? "" : "s"} Assigned
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

        {/* TAB 3: TRANSACTIONS LEDGER */}
        {activeTab === "transactions" && (
          <div className="rounded-3xl border border-white/10 bg-[#0c101b]/95 backdrop-blur-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Event Votes Ledger
                </h3>
                <p className="text-xs text-slate-400">Auditable transaction log for this event.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportCSV} className="rounded-full text-xs font-bold gap-1.5 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white">
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-white/10 bg-[#121827]/60 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="py-3 px-4">Voter</th>
                    <th className="py-3 px-4">Nominee</th>
                    <th className="py-3 px-4">Votes</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {votes.map((v) => {
                    const nom = db.getNomineeById(v.nominee_id)
                    return (
                      <tr key={v.id} className="hover:bg-[#121827]/40 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-white">
                          {v.voter_email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          {nom?.name || "Candidate"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-amber-400">
                          +{v.quantity}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">
                          {formatCurrency(v.total_amount, v.currency)}
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
      </div>

      {/* Add Candidate Modal with File Upload */}
      <Modal
        isOpen={isAddNomineeOpen}
        onClose={() => setIsAddNomineeOpen(false)}
        title="Add Nominee"
        description="Register a new candidate in this event."
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
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Category
            </label>
            <select
              value={nomineeCategoryId}
              onChange={(e) => setNomineeCategoryId(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff5500]"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nominee Picture Upload Component */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
              Nominee Picture
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-neutral-900/70">
              {/* Picture Preview */}
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                {nomineeImage ? (
                  <img
                    src={nomineeImage}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Users className="h-8 w-8 text-neutral-600" />
                )}
              </div>

              {/* Upload input button */}
              <div className="flex-1 space-y-2 w-full">
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-dashed border-[#ff5500]/40 bg-[#ff5500]/10 text-xs font-bold text-white hover:bg-[#ff5500]/20 hover:border-[#ff5500] cursor-pointer transition-all shadow-md">
                  <span>{nomineeImage ? "Replace Photo" : "Upload Photo from Device"}</span>
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
                {nomineeImage && (
                  <button
                    type="button"
                    onClick={() => setNomineeImage("")}
                    className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors block text-center w-full cursor-pointer"
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Biography / Manifesto
            </label>
            <textarea
              rows={3}
              placeholder="Short description of achievements or platform..."
              value={nomineeBio}
              onChange={(e) => setNomineeBio(e.target.value)}
              className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#ff5500]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddNomineeOpen(false)}
              className="px-5 py-2.5 text-xs font-bold rounded-full border border-white/10 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-full bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
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
        description="Add a new category or competition bracket."
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
            placeholder="e.g. Ambassador for eco-tourism and preservation"
            value={newCategoryDesc}
            onChange={(e) => setNewCategoryDesc(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddCategoryOpen(false)}
              className="px-5 py-2.5 text-xs font-bold rounded-full border border-white/10 bg-neutral-900 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-full bg-[#ff5500] text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
            >
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
