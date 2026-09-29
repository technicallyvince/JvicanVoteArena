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
    payoutBank: "Automated Settlement",
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
      // Auto-commit any category typed in the input field
      let currentCategories = [...categories]
      if (newCategoryName.trim()) {
        const autoCat = {
          id: nanoid(),
          name: newCategoryName.trim(),
          description: newCategoryDesc.trim(),
        }
        currentCategories.push(autoCat)
        setCategories(currentCategories)
        setNewCategoryName("")
        setNewCategoryDesc("")
      }

      // Auto-commit any nominee typed in the input field
      if (newNomineeName.trim()) {
        const targetCatId = newNomineeCategoryId || currentCategories[0]?.id
        if (targetCatId) {
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
      }

      if (currentCategories.length === 0) {
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

  const handlePublishEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const price = parseFloat(votingConfig.votePrice)
    if (isNaN(price) || price < 100) {
      setErrorMsg("The minimum amount per vote that an organizer can set is ₦100 (NGN).")
      return
    }

    setIsLoading(true)

    const baseSlug = eventDetails.slug.trim() || slugify(eventDetails.name)
    const uniqueSlug = `${baseSlug}-${nanoid(4).toLowerCase()}`

    try {
      const res = await fetch("/api/events/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: eventDetails.name.trim(),
          slug: uniqueSlug,
          description: eventDetails.description.trim(),
          logoUrl: eventDetails.logoUrl,
          bannerImageUrl: eventDetails.bannerImageUrl,
          startDate: eventDetails.startDate,
          endDate: eventDetails.endDate,
          votePrice: price,
          currency: votingConfig.currency,
          showLiveResults: votingConfig.showLiveResults,
          payoutBank: votingConfig.payoutBank,
          categories: categories.map((cat) => ({
            id: cat.id,
            name: cat.name.trim(),
            description: cat.description || "Official title bracket",
          })),
          nominees: nominees.map((nom) => ({
            name: nom.name.trim(),
            categoryId: nom.categoryId,
            bio: nom.bio || "Official contestant in competition",
            imageUrl: nom.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to create event in database.")
      }

      if (data.supabaseError) {
        console.warn("[Supabase Event Creation Warning]:", data.supabaseError)
      }

      setPublishedEvent({
        id: data.event.id,
        slug: data.event.slug,
        name: data.event.name,
      })
    } catch (err: any) {
      console.error("Event creation error:", err)
      setErrorMsg(err?.message || "Failed to create event. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
      <div className="py-16 sm:py-24 bg-[#050608] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="relative rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#0e1017] to-[#07080c] p-6 sm:p-10 shadow-2xl shadow-black/80 backdrop-blur-2xl text-center overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Success Icon */}
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/5 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/10">
              <CheckCircle2 className="h-8 w-8 stroke-[2.5]" />
            </div>

            {/* Header Badge */}
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
              Submission Received
            </span>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Event Submitted for Review
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mt-3 max-w-md mx-auto">
              Your contest <span className="font-bold text-amber-400">"{publishedEvent.name}"</span> has been submitted for platform vetting. Once approved by Super Admin, it will automatically go live on the public voting arena.
            </p>

            {/* Quick Status Box */}
            <div className="mt-6 p-3.5 rounded-2xl bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs text-left">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Current Status
                </span>
                <span className="font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  Pending Administrative Approval
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">
                ID: {publishedEvent.id.substring(0, 8)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <Link href={`/dashboard/events/${publishedEvent.id}`} className="w-full">
                <button
                  type="button"
                  className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#C9A84C] to-[#D4B86A] hover:from-[#D4B86A] hover:to-[#C9A84C] text-[#050608] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#C9A84C]/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 stroke-[2.5]" />
                  <span>Open Event Studio</span>
                </button>
              </Link>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="w-full h-12 flex items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/[0.20] text-xs font-bold text-white transition-all cursor-pointer"
              >
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <Copy className="h-4 w-4 text-amber-400" />
                )}
                <span>{copied ? "Public URL Copied to Clipboard!" : "Copy Public Event Link"}</span>
              </button>

              <Link href="/dashboard" className="w-full pt-1">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer">
                  Return to Dashboard Overview &rarr;
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-10 sm:py-16 bg-[#050608] min-h-screen text-white pt-24 sm:pt-28 selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        {/* Context Breadcrumbs */}
        <div className="mb-6 flex items-center gap-1.5 text-xs text-slate-400">
          <Link href="/dashboard" className="hover:text-[#C9A84C] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/dashboard/events" className="hover:text-[#C9A84C] transition-colors">
            Events
          </Link>
          <span>/</span>
          <span className="text-white font-bold">New Event</span>
        </div>

        {/* Wizard Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/25 bg-[#C9A84C]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#C9A84C] mb-3 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A84C]" />
            <span>Event Creation Studio</span>
          </div>
          <h1 className="text-2xl min-[420px]:text-3xl sm:text-4xl font-black text-white tracking-tight">
            Create an Event
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            Set up your categories, enroll nominees, and launch authoritative voting in minutes.
          </p>
        </div>

        {/* 3-Step Wizard Navigation Indicator */}
        <div className="mb-8 grid grid-cols-3 gap-1.5 sm:gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all text-left",
                currentStep === s.num
                  ? "border-[#C9A84C] bg-[#C9A84C]/15 text-white font-bold ring-1 ring-[#C9A84C]/30"
                  : currentStep > s.num
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.07] bg-[#0e1018] text-neutral-500"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full text-[10px] sm:text-xs font-black",
                  currentStep === s.num
                    ? "bg-[#C9A84C] text-[#0a0c14]"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-neutral-950"
                    : "bg-neutral-800 text-neutral-500"
                )}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-[10px] min-[420px]:text-xs font-bold truncate">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Form Container */}
        <div className="rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-5 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handlePublishEvent} className="space-y-6">
            {/* STEP 1: EVENT DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <Input
                  label="Event Name"
                  placeholder="e.g. National Music Awards 2026 or Campus Innovators Summit"
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
                  placeholder="national-music-awards-2026"
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
                  <div>
                    <Input
                      label="Price per Vote (NGN)"
                      type="number"
                      min="100"
                      placeholder="e.g. 100 (Minimum ₦100)"
                      value={votingConfig.votePrice}
                      onChange={(e) => setVotingConfig({ ...votingConfig, votePrice: e.target.value })}
                      required
                    />
                    <p className="text-[10px] text-amber-400 mt-1 font-semibold">
                      * Minimum allowed price per vote is ₦100.
                    </p>
                  </div>

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
                <div className="rounded-2xl bg-[#0e1018] p-4 sm:p-5 border border-white/[0.06] space-y-2.5 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A84C] pb-1 border-b border-white/[0.06]">
                    Review Configuration
                  </h4>

                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Event Name:</span>
                    <span className="font-bold text-white">{eventDetails.name}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Canonical Slug:</span>
                    <span className="font-mono text-[#C9A84C]">/events/{eventDetails.slug || slugify(eventDetails.name)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Categories:</span>
                    <span className="font-semibold text-white">{categories.map((c) => c.name).join(", ")}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Nominees Enrolled:</span>
                    <span className="font-bold text-emerald-400">{nominees.length} Nominees</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Vote Price:</span>
                    <span className="font-bold text-[#C9A84C]">
                      {formatCurrency(Number(votingConfig.votePrice) || 0, votingConfig.currency)} / vote
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-1 gap-0.5">
                    <span className="text-slate-400">Voting Window:</span>
                    <span className="font-medium text-slate-300">{eventDetails.startDate} → {eventDetails.endDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 p-3.5 sm:p-4 text-xs text-emerald-300 border border-emerald-500/20">
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
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-3">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#0e1018] px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A84C] px-6 py-2.5 text-xs font-black text-[#0a0c14] shadow-md shadow-[#C9A84C]/20 hover:bg-[#D4B86A] transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-8 py-3 text-xs sm:text-sm font-black text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 hover:bg-[#D4B86A] transition-all cursor-pointer"
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
