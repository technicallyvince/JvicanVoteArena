"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { slugify, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { AuthModal } from "@/components/auth/AuthModal"
import { useAuth } from "@/lib/auth"
import {
  Trophy,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Plus,
  Trash2,
  Layers,
  Users,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

interface CategoryDraft {
  id: string
  name: string
  description?: string
}

interface NomineeDraft {
  id: string
  name: string
  categoryId: string
  bio?: string
  imageUrl?: string
}

export default function EventCreationWizardPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setIsAuthModalOpen(true)
    }
  }, [isAuthLoading, isAuthenticated])

  // Step 1: Event Details
  const [eventDetails, setEventDetails] = useState({
    name: "",
    description: "",
    slug: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    bannerImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&auto=format&fit=crop&q=80",
  })

  // Step 2: Categories & Nominees
  const [categories, setCategories] = useState<CategoryDraft[]>([
    { id: nanoid(), name: "Main Title", description: "Official competition category" },
  ])
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryDesc, setNewCategoryDesc] = useState("")

  const [nominees, setNominees] = useState<NomineeDraft[]>([])
  const [newNomineeName, setNewNomineeName] = useState("")
  const [newNomineeCategoryId, setNewNomineeCategoryId] = useState("")
  const [newNomineeBio, setNewNomineeBio] = useState("")
  const [newNomineeImage, setNewNomineeImage] = useState("")

  // Step 3: Voting & Review
  const [votingConfig, setVotingConfig] = useState({
    votePrice: "100",
    currency: "NGN",
    payoutBank: "TransactPay Automated Settlement",
    showLiveResults: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [publishedEvent, setPublishedEvent] = useState<{ id: string; slug: string; name: string } | null>(null)
  const [copied, setCopied] = useState(false)

  // Sync category select when categories change
  useEffect(() => {
    if (categories.length > 0 && !newNomineeCategoryId) {
      setNewNomineeCategoryId(categories[0].id)
    }
  }, [categories, newNomineeCategoryId])

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    const newCat = {
      id: nanoid(),
      name: newCategoryName.trim(),
      description: newCategoryDesc.trim(),
    }
    setCategories((prev) => [...prev, newCat])
    if (!newNomineeCategoryId) {
      setNewNomineeCategoryId(newCat.id)
    }
    setNewCategoryName("")
    setNewCategoryDesc("")
  }

  const handleRemoveCategory = (id: string) => {
    if (categories.length <= 1) {
      setErrorMsg("An event must have at least one category.")
      return
    }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setNominees((prev) => prev.filter((n) => n.categoryId !== id))
  }

  const handleAddNominee = () => {
    if (!newNomineeName.trim()) return
    const targetCatId = newNomineeCategoryId || categories[0]?.id
    if (!targetCatId) {
      setErrorMsg("Please create a category before adding nominees.")
      return
    }

    setNominees((prev) => [
      ...prev,
      {
        id: nanoid(),
        name: newNomineeName.trim(),
        categoryId: targetCatId,
        bio: newNomineeBio.trim(),
        imageUrl: newNomineeImage.trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
      },
    ])

    setNewNomineeName("")
    setNewNomineeBio("")
    setNewNomineeImage("")
  }

  const handleRemoveNominee = (id: string) => {
    setNominees((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNext = () => {
    setErrorMsg("")
    if (currentStep === 1) {
      if (!eventDetails.name.trim()) {
        setErrorMsg("Event name is required.")
        return
      }
      if (!eventDetails.description.trim()) {
        setErrorMsg("Please provide an event description.")
        return
      }
      const start = new Date(eventDetails.startDate)
      const end = new Date(eventDetails.endDate)
      if (end <= start) {
        setErrorMsg("Voting end date must be after start date.")
        return
      }
    } else if (currentStep === 2) {
      if (categories.length === 0) {
        setErrorMsg("Please add at least one category.")
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setErrorMsg("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handlePublishEvent = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const price = parseFloat(votingConfig.votePrice)
    if (isNaN(price) || price < 0) {
      setErrorMsg("Please provide a valid vote price.")
      return
    }

    setIsLoading(true)

    const baseSlug = eventDetails.slug.trim() || slugify(eventDetails.name)
    const uniqueSlug = `${baseSlug}-${nanoid(4).toLowerCase()}`

    const newEvent = db.createEvent({
      id: nanoid(),
      organizer_id: "11111111-1111-1111-1111-111111111111",
      name: eventDetails.name.trim(),
      slug: uniqueSlug,
      description: eventDetails.description.trim(),
      logo_url: eventDetails.logoUrl,
      cover_image_url: eventDetails.bannerImageUrl,
      status: "published",
      start_date: new Date(eventDetails.startDate).toISOString(),
      end_date: new Date(eventDetails.endDate).toISOString(),
      vote_price: price,
      currency: votingConfig.currency,
      allow_multiple_votes: true,
      show_live_results: votingConfig.showLiveResults,
      is_featured: false,
      display_order: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Map for created categories
    const categoryMap: { [draftId: string]: string } = {}

    categories.forEach((cat, index) => {
      const createdCat = db.createCategory({
        id: nanoid(),
        event_id: newEvent.id,
        name: cat.name.trim(),
        slug: slugify(`${cat.name.trim()}-${nanoid(3)}`),
        description: cat.description || "Official title bracket",
        display_order: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      categoryMap[cat.id] = createdCat.id
    })

    // Create all user-specified nominees
    nominees.forEach((nom, index) => {
      const actualCategoryId = categoryMap[nom.categoryId] || Object.values(categoryMap)[0]
      db.createNominee({
        id: nanoid(),
        event_id: newEvent.id,
        category_id: actualCategoryId,
        name: nom.name.trim(),
        slug: slugify(`${nom.name.trim()}-${nanoid(3)}`),
        description: nom.bio || "Official contestant in competition",
        image_url: nom.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
        public_id: `NOM-${nanoid(4).toUpperCase()}`,
        display_order: index + 1,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    setIsLoading(false)
    setPublishedEvent({ id: newEvent.id, slug: newEvent.slug, name: newEvent.name })
  }

  const handleCopyShareLink = () => {
    if (!publishedEvent) return
    const url = `${window.location.origin}/events/${publishedEvent.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    { num: 1, title: "01 Event Details" },
    { num: 2, title: "02 Categories & Nominees" },
    { num: 3, title: "03 Voting & Review" },
  ]

  // Success State
  if (publishedEvent) {
    return (
      <div className="py-16 sm:py-24 bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
        <div className="mx-auto max-w-xl px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-emerald-500/30 bg-[#0c101b]/95 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              ✓ Event Published
            </h1>
            <p className="text-sm text-slate-300 mt-2">
              Your event <span className="font-bold text-amber-400">"{publishedEvent.name}"</span> is now live and ready to receive verified votes.
            </p>

            <div className="mt-8 flex flex-col gap-3">
              <Link href={`/events/${publishedEvent.slug}`}>
                <Button variant="primary" size="lg" className="w-full justify-center rounded-full font-bold shadow-lg shadow-amber-500/20">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Event
                </Button>
              </Link>

              <Button
                variant="outline"
                size="lg"
                onClick={handleCopyShareLink}
                className="w-full justify-center rounded-full font-bold"
              >
                {copied ? <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2 text-amber-400" />}
                {copied ? "Share Link Copied!" : "Copy Share Link"}
              </Button>

              <Link href="/dashboard">
                <button
                  type="button"
                  className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Go to Dashboard →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 sm:py-20 bg-[#06080e] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#f59e0b] selection:text-black">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Context Breadcrumbs */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-amber-400 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/events" className="hover:text-amber-400 transition-colors">
            Events
          </Link>
          <span>/</span>
          <span className="text-white font-bold">New Event</span>
        </div>

        {/* Wizard Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Event Creation Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create an Event
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Set up your categories, enroll nominees, and launch authoritative voting with TransactPay in minutes.
          </p>
        </div>

        {/* 3-Step Wizard Navigation Indicator */}
        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex items-center gap-2 p-3 rounded-2xl border transition-all text-left",
                currentStep === s.num
                  ? "border-amber-400 bg-amber-400/15 text-white font-bold ring-1 ring-amber-400/30"
                  : currentStep > s.num
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] bg-neutral-900/80 text-neutral-500"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black",
                  currentStep === s.num
                    ? "bg-amber-400 text-neutral-950"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-500"
                )}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-xs font-bold truncate">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Form Container */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0c101b]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handlePublishEvent} className="space-y-6">
            {/* STEP 1: EVENT DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <Input
                  label="Event Name"
                  placeholder="e.g. Miss Igbeti 2026 or Annual Leadership Awards"
                  value={eventDetails.name}
                  onChange={(e) => {
                    const name = e.target.value
                    setEventDetails({
                      ...eventDetails,
                      name,
                      slug: eventDetails.slug || slugify(name),
                    })
                  }}
                  required
                />

                <Input
                  label="Custom URL Slug (optional)"
                  placeholder="miss-igbeti-2026"
                  value={eventDetails.slug}
                  onChange={(e) => setEventDetails({ ...eventDetails, slug: slugify(e.target.value) })}
                  helperText="Your event will be live at /events/[slug]"
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Description &amp; Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what this event celebrates, rules, and background..."
                    value={eventDetails.description}
                    onChange={(e) => setEventDetails({ ...eventDetails, description: e.target.value })}
                    className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={eventDetails.startDate}
                    onChange={(e) => setEventDetails({ ...eventDetails, startDate: e.target.value })}
                    required
                  />

                  <Input
                    label="End Date"
                    type="date"
                    value={eventDetails.endDate}
                    onChange={(e) => setEventDetails({ ...eventDetails, endDate: e.target.value })}
                    required
                  />
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    Banner Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-neutral-900/70">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                      {eventDetails.bannerImageUrl ? (
                        <img
                          src={eventDetails.bannerImageUrl}
                          alt="Banner Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-600">No Banner</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-dashed border-amber-400/40 bg-amber-400/10 text-xs font-bold text-white hover:bg-amber-400/20 hover:border-amber-400 cursor-pointer transition-all">
                        <span>{eventDetails.bannerImageUrl ? "Replace Banner Image" : "Upload Banner"}</span>
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
                                  setEventDetails({ ...eventDetails, bannerImageUrl: reader.result })
                                }
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CATEGORIES & NOMINEES */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 1. Category Creation & Management */}
                <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="h-4 w-4 text-amber-400" />
                        <span>Categories ({categories.length})</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Define competition titles (e.g. Miss Culture &amp; Tourism, Best Actor).
                      </p>
                    </div>
                  </div>

                  {/* Existing categories list */}
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-neutral-900 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 font-mono">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white truncate">
                              {cat.name}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 pl-5">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat.id)}
                          className="text-neutral-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                          title="Remove category"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add category inputs */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Add Category Title (e.g. Miss Photogenic)"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="sm:col-span-7 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Short description"
                        value={newCategoryDesc}
                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                        className="sm:col-span-5 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!newCategoryName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-amber-400/30 bg-amber-400/5 py-2 text-xs font-bold text-amber-400 hover:bg-amber-400/10 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Category</span>
                    </button>
                  </div>
                </div>

                {/* 2. Nominees Manager */}
                <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-400" />
                        <span>Enrolled Nominees ({nominees.length})</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Register nominees and assign them to categories. (You can also add more later in Event Studio).
                      </p>
                    </div>
                  </div>

                  {/* Existing nominees list */}
                  {nominees.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
                      {nominees.map((nom) => {
                        const cat = categories.find((c) => c.id === nom.categoryId)
                        return (
                          <div
                            key={nom.id}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl border border-white/[0.06] bg-neutral-900"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img
                                src={nom.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                                alt={nom.name}
                                className="h-9 w-9 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <span className="text-xs font-bold text-white truncate block">
                                  {nom.name}
                                </span>
                                <span className="text-[10px] text-amber-400 truncate block">
                                  {cat?.name || "Category"}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveNominee(nom.id)}
                              className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Add nominee form */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Nominee Name (e.g. Ada Adeyemi)"
                        value={newNomineeName}
                        onChange={(e) => setNewNomineeName(e.target.value)}
                        className="sm:col-span-7 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none"
                      />
                      <select
                        value={newNomineeCategoryId}
                        onChange={(e) => setNewNomineeCategoryId(e.target.value)}
                        className="sm:col-span-5 rounded-xl border border-white/[0.08] bg-neutral-900 px-3 py-2 text-xs text-white focus:outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Nominee Bio / Manifesto"
                        value={newNomineeBio}
                        onChange={(e) => setNewNomineeBio(e.target.value)}
                        className="sm:col-span-8 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2 text-xs text-white placeholder:text-neutral-500 focus:border-emerald-400 focus:outline-none"
                      />
                      <label className="sm:col-span-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer">
                        <span>{newNomineeImage ? "Photo Chosen" : "Upload Photo"}</span>
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
                                  setNewNomineeImage(reader.result)
                                }
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNominee}
                      disabled={!newNomineeName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 py-2.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 cursor-pointer disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Nominee to Event</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: VOTING & REVIEW */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Price per Vote (NGN)"
                    type="number"
                    min="0"
                    value={votingConfig.votePrice}
                    onChange={(e) => setVotingConfig({ ...votingConfig, votePrice: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={votingConfig.currency}
                      onChange={(e) => setVotingConfig({ ...votingConfig, currency: e.target.value })}
                      className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:outline-none"
                    >
                      <option value="NGN">NGN (Nigerian Naira)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>

                {/* Review Summary Box */}
                <div className="rounded-2xl bg-neutral-900/90 p-5 border border-white/[0.08] space-y-2.5 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 pb-1 border-b border-white/[0.06]">
                    Review Configuration
                  </h4>

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Event Name:</span>
                    <span className="font-bold text-white">{eventDetails.name}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Canonical Slug:</span>
                    <span className="font-mono text-amber-400">/events/{eventDetails.slug || slugify(eventDetails.name)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Categories:</span>
                    <span className="font-semibold text-white">{categories.map((c) => c.name).join(", ")}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Nominees Enrolled:</span>
                    <span className="font-bold text-emerald-400">{nominees.length} Nominees</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Vote Price:</span>
                    <span className="font-bold text-amber-400">
                      {formatCurrency(Number(votingConfig.votePrice) || 0, votingConfig.currency)} / vote
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Voting Window:</span>
                    <span className="font-medium text-slate-300">{eventDetails.startDate} → {eventDetails.endDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 p-4 text-xs text-emerald-300 border border-emerald-500/20">
                  <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>
                    Server-authoritative pricing and instant cryptographic receipt generation are pre-configured for this event.
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-red-950/40 p-3 text-xs font-semibold text-red-300 border border-red-900">
                {errorMsg}
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-neutral-900 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-6 py-2.5 text-xs font-black text-neutral-950 shadow-md shadow-amber-500/20 hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-3 text-sm font-black text-neutral-950 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-all cursor-pointer"
                >
                  <Trophy className="h-4 w-4" />
                  <span>{isLoading ? "Publishing..." : "Publish Event"}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Auth Modal for unauthenticated access */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false)
          if (!isAuthenticated) {
            router.push("/")
          }
        }}
        redirectTo="/dashboard/events/new"
      />
    </div>
  )
}
