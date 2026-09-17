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

export default function ContestStudioPage() {
  const params = useParams()
  const eventId = params?.id as string

  const contest = db.getEventById(eventId)
  if (!contest) {
    notFound()
  }

  const [activeTab, setActiveTab] = useState<"contestants" | "categories" | "transactions" | "settings">("contestants")
  const [categories, setCategories] = useState(db.getCategories(contest.id))
  const [contestants, setContestants] = useState(db.getNominees(contest.id))
  const [votes, setVotes] = useState(db.getVotes(contest.id))

  // Modal states
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDesc, setNewCategoryDesc] = useState("")

  const [isAddContestantOpen, setIsAddContestantOpen] = useState(false)
  const [contestantName, setContestantName] = useState("")
  const [contestantBio, setContestantBio] = useState("")
  const [contestantImage, setContestantImage] = useState("")
  const [contestantCategoryId, setContestantCategoryId] = useState(categories[0]?.id || "")

  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyLink = (publicId: string) => {
    const url = `${window.location.origin}/contestant/${publicId}`
    navigator.clipboard.writeText(url)
    setCopiedId(publicId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    db.createCategory({
      id: nanoid(),
      event_id: contest.id,
      name: newCategoryName.trim(),
      slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCategoryDesc.trim(),
      display_order: categories.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setCategories([...db.getCategories(contest.id)])
    setIsAddCategoryOpen(false)
    setNewCategoryName("")
    setNewCategoryDesc("")
  }

  const handleCreateContestant = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contestantName.trim()) return

    db.createNominee({
      id: nanoid(),
      event_id: contest.id,
      category_id: contestantCategoryId || categories[0]?.id || "",
      name: contestantName.trim(),
      slug: contestantName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: contestantBio.trim(),
      image_url: contestantImage.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      public_id: `CON-${nanoid(4).toUpperCase()}`,
      display_order: contestants.length + 1,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setContestants([...db.getNominees(contest.id)])
    setIsAddContestantOpen(false)
    setContestantName("")
    setContestantBio("")
    setContestantImage("")
  }

  const handleDeleteContestant = (id: string) => {
    if (confirm("Are you sure you want to remove this candidate?")) {
      db.deleteNominee(id)
      setContestants([...db.getNominees(contest.id)])
    }
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      db.deleteCategory(id)
      setCategories([...db.getCategories(contest.id)])
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
    link.setAttribute("download", `${contest.slug}-votes-export.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const confirmedVotes = votes.filter((v) => v.status === "confirmed")
  const totalVotesCount = confirmedVotes.reduce((acc, v) => acc + v.quantity, 0)
  const totalRevenue = confirmedVotes.reduce((acc, v) => acc + Number(v.total_amount), 0)

  return (
    <div className="py-8 sm:py-12 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Contest Title & Quick Stats */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs dark:border-slate-800 dark:bg-slate-900 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={contest.logo_url || contest.cover_image_url || undefined}
                alt={contest.name}
                className="h-16 w-16 rounded-2xl object-cover shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {contest.name}
                  </h1>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                    {contest.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Slug: /{contest.slug} • Vote Price: {formatCurrency(contest.vote_price, contest.currency)}
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
              <Link href={`/contest/${contest.slug}`} target="_blank">
                <Button
                  variant="primary"
                  size="md"
                  className="rounded-full text-xs font-bold gap-2 shadow-md shadow-blue-500/20"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatCurrency(totalRevenue, contest.currency)}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed Votes</span>
              <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                {totalVotesCount.toLocaleString()}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contestants</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {contestants.length}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Categories</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {categories.length}
              </div>
            </div>
          </div>
        </div>

        {/* Studio Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-4 dark:border-slate-800 mb-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("contestants")}
            className={cn(
              "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "contestants"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Contestants ({contestants.length})
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={cn(
              "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "categories"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            Categories ({categories.length})
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={cn(
              "px-5 py-2 text-xs font-extrabold rounded-full transition-all cursor-pointer whitespace-nowrap flex items-center gap-2",
              activeTab === "transactions"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400"
            )}
          >
            <Vote className="h-3.5 w-3.5" />
            Votes Ledger ({votes.length})
          </button>
        </div>

        {/* TAB 1: CONTESTANTS */}
        {activeTab === "contestants" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Enrolled Nominees
                </h3>
                <p className="text-xs text-slate-500">Add or manage candidates competing in this event.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddContestantOpen(true)}
                className="rounded-full text-xs font-bold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Contestant
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contestants.map((c) => {
                const category = categories.find((cat) => cat.id === c.category_id)
                const candidateVotes = db.getNomineeVoteCount(c.id)

                return (
                  <div
                    key={c.id}
                    className="flex flex-col justify-between p-5 rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={c.image_url || undefined}
                        alt={c.name}
                        className="h-16 w-16 rounded-2xl object-cover shadow-xs"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono font-bold text-white">
                            #{c.public_id}
                          </span>
                          <button
                            onClick={() => handleDeleteContestant(c.id)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Remove candidate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900 dark:text-white truncate mt-1">
                          {c.name}
                        </h4>
                        <span className="text-xs text-slate-500 truncate block">
                          {category?.name || "General Category"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400">Votes:</span>
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400 ml-1">
                          {candidateVotes.toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyLink(c.public_id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 cursor-pointer"
                      >
                        {copiedId === c.public_id ? <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
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
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Contest Categories
                </h3>
                <p className="text-xs text-slate-500">Group your candidates into distinct competition titles.</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddCategoryOpen(true)}
                className="rounded-full text-xs font-bold gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Category
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const count = contestants.filter((c) => c.category_id === cat.id).length

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-3xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">{cat.description || "Official title"}</p>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-2 block">
                        {count} Candidate{count === 1 ? "" : "s"} Assigned
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-red-600 p-2"
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
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Event Votes Ledger
                </h3>
                <p className="text-xs text-slate-500">Auditable transaction log for this event.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportCSV} className="rounded-full text-xs font-bold gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download CSV
              </Button>
            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-850">
                  <tr>
                    <th className="py-3 px-4">Voter</th>
                    <th className="py-3 px-4">Nominee</th>
                    <th className="py-3 px-4">Votes</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {votes.map((v) => {
                    const nom = db.getNomineeById(v.nominee_id)
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50">
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {v.voter_email}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {nom?.name || "Candidate"}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                          +{v.quantity}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          {formatCurrency(v.total_amount, v.currency)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {v.payment_reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-emerald-600 font-bold uppercase text-[10px]">
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

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isAddContestantOpen}
        onClose={() => setIsAddContestantOpen(false)}
        title="Add Contestant"
        description="Register a new candidate in this contest."
      >
        <form onSubmit={handleCreateContestant} className="space-y-4">
          <Input
            label="Contestant Full Name"
            placeholder="e.g. Adebisi Folashade"
            value={contestantName}
            onChange={(e) => setContestantName(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              value={contestantCategoryId}
              onChange={(e) => setContestantCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Photo URL"
            placeholder="https://images.unsplash.com/..."
            value={contestantImage}
            onChange={(e) => setContestantImage(e.target.value)}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Biography / Manifesto
            </label>
            <textarea
              rows={3}
              placeholder="Short description of achievements or platform..."
              value={contestantBio}
              onChange={(e) => setContestantBio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-900"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddContestantOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Contestant
            </Button>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
