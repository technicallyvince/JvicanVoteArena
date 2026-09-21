"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
} from "lucide-react"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

function AsteriskStar({ className = "h-4 w-4", color = "#ff5500" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M12 2V22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 4.93L19.07 19.07" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M2 12H22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.93 19.07L19.07 4.93" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

interface CategoryInputItem {
  id: string
  name: string
  description?: string
}

export default function CreateEventPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      setIsAuthModalOpen(true)
    }
  }, [isAuthLoading, isAuthenticated])

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    votePrice: "100",
    currency: "NGN",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&auto=format&fit=crop&q=80",
    showLiveResults: true,
  })

  // Multiple categories list state
  const [categoriesList, setCategoriesList] = useState<CategoryInputItem[]>([
    { id: nanoid(), name: "Overall Crown Champion", description: "Flagship title" },
  ])
  const [newCatName, setNewCatName] = useState("")
  const [newCatDesc, setNewCatDesc] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleAddCategory = () => {
    if (!newCatName.trim()) return
    setCategoriesList((prev) => [
      ...prev,
      { id: nanoid(), name: newCatName.trim(), description: newCatDesc.trim() },
    ])
    setNewCatName("")
    setNewCatDesc("")
  }

  const handleRemoveCategory = (id: string) => {
    if (categoriesList.length <= 1) {
      setErrorMsg("An event must have at least one category.")
      return
    }
    setCategoriesList((prev) => prev.filter((c) => c.id !== id))
  }

  const handleNext = () => {
    setErrorMsg("")
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Name of event is required.")
        return
      }
      if (!formData.description.trim()) {
        setErrorMsg("Please provide a brief description for voters.")
        return
      }
      if (categoriesList.length === 0) {
        setErrorMsg("Please add at least one category.")
        return
      }
    } else if (currentStep === 2) {
      const price = parseFloat(formData.votePrice)
      if (isNaN(price) || price <= 0) {
        setErrorMsg("Vote price must be greater than zero.")
        return
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const handleBack = () => {
    setErrorMsg("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    const price = parseFloat(formData.votePrice)
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    if (end <= start) {
      setErrorMsg("Voting end date must be after start date.")
      return
    }

    setIsLoading(true)

    const baseSlug = slugify(formData.name)
    const uniqueSlug = `${baseSlug}-${nanoid(4).toLowerCase()}`

    const newEvent = db.createEvent({
      id: nanoid(),
      organizer_id: "11111111-1111-1111-1111-111111111111",
      name: formData.name.trim(),
      slug: uniqueSlug,
      description: formData.description.trim(),
      logo_url: formData.logoUrl,
      cover_image_url: formData.coverImageUrl,
      status: "published",
      start_date: new Date(formData.startDate).toISOString(),
      end_date: new Date(formData.endDate).toISOString(),
      vote_price: price,
      currency: formData.currency,
      allow_multiple_votes: true,
      show_live_results: formData.showLiveResults,
      is_featured: false,
      display_order: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    // Create all user-specified categories
    categoriesList.forEach((cat, index) => {
      db.createCategory({
        id: nanoid(),
        event_id: newEvent.id,
        name: cat.name.trim(),
        slug: slugify(`${cat.name.trim()}-${nanoid(3)}`),
        description: cat.description || "Official title bracket",
        display_order: index + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    })

    setTimeout(() => {
      router.push(`/dashboard/events/${newEvent.id}`)
    }, 600)
  }

  const steps = [
    { num: 1, title: "Event & Categories" },
    { num: 2, title: "Pricing & Dates" },
    { num: 3, title: "Review & Launch" },
  ]

  return (
    <div className="py-12 sm:py-20 bg-[#080808] min-h-screen text-white pt-24 sm:pt-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#ff5500]/30 bg-[#ff5500]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff5500] mb-3 backdrop-blur-md">
            <AsteriskStar className="h-3.5 w-3.5" color="#ff5500" />
            <span>Event Studio Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Create a New Event
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400">
            Launch your voting competition with multiple categories and automated TransactPay checkout.
          </p>
        </div>

        {/* Steps Progress Bar */}
        <div className="mb-8 grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <div
              key={s.num}
              className={cn(
                "flex items-center gap-2 p-3 rounded-2xl border transition-all text-left",
                currentStep === s.num
                  ? "border-[#ff5500] bg-[#ff5500]/15 text-white font-bold ring-1 ring-[#ff5500]/30"
                  : currentStep > s.num
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-white/[0.08] bg-neutral-900/80 text-neutral-500"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                  currentStep === s.num
                    ? "bg-[#ff5500] text-white font-bold"
                    : currentStep > s.num
                    ? "bg-emerald-500 text-neutral-950 font-black"
                    : "bg-neutral-800 text-neutral-500"
                )}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-xs font-bold truncate">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Form Card */}
        <div className="rounded-[28px] border border-white/[0.08] bg-[#121212] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: EVENT & MULTIPLE CATEGORIES */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <Input
                  label="Name of Event"
                  placeholder="e.g. Miss Igbeti 2026 or Annual Leadership Awards"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                    Event Description &amp; Purpose
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what this event celebrates, eligibility, and voting guidelines..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:border-[#ff5500] focus:outline-none focus:ring-2 focus:ring-[#ff5500]/20"
                    required
                  />
                </div>

                {/* Multiple Categories Manager */}
                <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/60 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[#ff5500]" />
                        <span>Competition Categories ({categoriesList.length})</span>
                      </h3>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Define one or multiple titles (e.g. Overall Queen, Miss Culture, Best Dressed).
                      </p>
                    </div>
                  </div>

                  {/* List of currently added categories */}
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {categoriesList.map((cat, idx) => (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-neutral-900 p-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#ff5500] font-mono">
                              #{idx + 1}
                            </span>
                            <span className="text-xs font-bold text-white truncate">
                              {cat.name}
                            </span>
                          </div>
                          {cat.description && (
                            <p className="text-[10px] text-neutral-400 truncate mt-0.5 pl-5">
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

                  {/* Add category inline input form */}
                  <div className="pt-2 border-t border-white/[0.06] space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Add another category (e.g. Best Dressed)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddCategory()
                          }
                        }}
                        className="sm:col-span-7 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-[#ff5500] focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Short description (optional)"
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddCategory()
                          }
                        }}
                        className="sm:col-span-5 rounded-xl border border-white/[0.08] bg-black/60 px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-[#ff5500] focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={!newCatName.trim()}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] py-2.5 text-xs font-bold text-neutral-300 hover:text-white hover:border-[#ff5500]/50 hover:bg-[#ff5500]/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-3.5 w-3.5 text-[#ff5500]" />
                      <span>+ Add Category to Event</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PRICING & DATES */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Price per Vote (NGN)"
                    type="number"
                    min="1"
                    value={formData.votePrice}
                    onChange={(e) => setFormData({ ...formData, votePrice: e.target.value })}
                    required
                  />

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-3 text-xs sm:text-sm text-white focus:border-[#ff5500] focus:outline-none"
                    >
                      <option value="NGN">NGN (Nigerian Naira)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Voting Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />

                  <Input
                    label="Voting End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>

                {/* Cover Banner Image with File Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1.5">
                    Cover Banner Image
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl border border-white/[0.08] bg-neutral-900/70">
                    <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-neutral-950 flex items-center justify-center">
                      {formData.coverImageUrl ? (
                        <img
                          src={formData.coverImageUrl}
                          alt="Banner Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-neutral-600">No Banner</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2 w-full">
                      <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-full border border-dashed border-[#ff5500]/40 bg-[#ff5500]/10 text-xs font-bold text-white hover:bg-[#ff5500]/20 hover:border-[#ff5500] cursor-pointer transition-all shadow-md">
                        <span>{formData.coverImageUrl ? "Replace Banner Image" : "Upload Banner from Device"}</span>
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
                                  setFormData({ ...formData, coverImageUrl: reader.result })
                                }
                              }
                              reader.readAsDataURL(file)
                            }
                          }}
                        />
                      </label>
                      {formData.coverImageUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImageUrl: "" })}
                          className="text-[11px] text-neutral-400 hover:text-rose-400 transition-colors block text-center w-full cursor-pointer"
                        >
                          Remove banner image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW & LAUNCH */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="rounded-2xl bg-neutral-900/90 p-4 sm:p-5 border border-white/[0.08] space-y-2.5 text-xs">
                  {[
                    { label: "Name of Event", value: formData.name, bold: true },
                    {
                      label: "Categories",
                      value: categoriesList.map((c) => c.name).join(", "),
                      bold: true,
                    },
                    {
                      label: "Price per Vote",
                      value: formatCurrency(Number(formData.votePrice), formData.currency),
                      color: true,
                    },
                    { label: "Voting Window", value: `${formData.startDate} → ${formData.endDate}` },
                    { label: "Payment Gateway", value: "TransactPay Direct", green: true },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      className={`flex flex-wrap items-start gap-x-4 gap-y-0.5 ${
                        i < arr.length - 1 ? "pb-2.5 border-b border-white/[0.06]" : ""
                      }`}
                    >
                      <span className="shrink-0 min-w-[120px] text-neutral-400">{row.label}:</span>
                      <span
                        className={[
                          "flex-1 min-w-0 break-words text-right sm:text-left",
                          row.bold ? "font-bold text-white" : "text-neutral-300",
                          row.color ? "text-[#ff5500] font-bold" : "",
                          row.green ? "text-emerald-400 font-bold" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-[#ff5500]/10 p-4 text-xs text-[#ff8c42] border border-[#ff5500]/20">
                  <ShieldCheck className="h-5 w-5 text-[#ff5500] shrink-0" />
                  <span>
                    Your event will be created with {categoriesList.length} distinct categories, authoritative pricing, and instant TransactPay checkout.
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-red-950/40 p-3 text-xs font-semibold text-red-300 border border-red-900">
                {errorMsg}
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-neutral-900 px-5 py-2.5 text-xs font-bold text-neutral-300 hover:text-white transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#ff5500] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff5500] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#ff5500]/25 hover:bg-[#ff661a] transition-all cursor-pointer"
                >
                  <Trophy className="h-4 w-4" />
                  <span>{isLoading ? "Launching..." : "Launch Competition"}</span>
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
        redirectTo="/create-event"
      />
    </div>
  )
}
