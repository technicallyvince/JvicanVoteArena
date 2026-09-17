"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/db"
import { slugify, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Trophy,
  Layers,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Vote,
} from "lucide-react"
import { nanoid } from "nanoid"
import { cn } from "@/lib/utils"

export default function CreateContestPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryName: "Overall Crown Champion",
    votePrice: "100",
    currency: "NGN",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    coverImageUrl: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&auto=format&fit=crop&q=80",
    logoUrl: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=300&auto=format&fit=crop&q=80",
    showLiveResults: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleNext = () => {
    setErrorMsg("")
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        setErrorMsg("Contest title is required.")
        return
      }
      if (!formData.description.trim()) {
        setErrorMsg("Please provide a brief description for voters.")
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

    // Create initial category
    db.createCategory({
      id: nanoid(),
      event_id: newEvent.id,
      name: formData.categoryName.trim() || "General Title",
      slug: slugify(formData.categoryName.trim() || "general-title"),
      description: "Primary competition bracket",
      display_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    setTimeout(() => {
      router.push(`/dashboard/events/${newEvent.id}`)
    }, 600)
  }

  const steps = [
    { num: 1, title: "Contest Details" },
    { num: 2, title: "Pricing & Dates" },
    { num: 3, title: "Review & Launch" },
  ]

  return (
    <div className="py-12 sm:py-20 bg-[#fafafa] dark:bg-[#090d16] min-h-screen">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Step Indicator Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
            <span>Contest Studio Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Create a New Contest
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Launch your voting competition in under 3 minutes with automated TransactPay checkout.
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
                  ? "border-blue-600 bg-blue-50/50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-500 font-bold"
                  : currentStep > s.num
                  ? "border-emerald-200 bg-emerald-50/40 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : "border-slate-200 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900"
              )}
            >
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold",
                  currentStep === s.num
                    ? "bg-blue-600 text-white"
                    : currentStep > s.num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                )}
              >
                {currentStep > s.num ? "✓" : s.num}
              </div>
              <span className="text-xs font-extrabold truncate">{s.title}</span>
            </div>
          ))}
        </div>

        {/* Wizard Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: CONTEST DETAILS */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <Input
                  label="Contest Title"
                  placeholder="e.g. Miss Igbeti 2026 or Best Tech Innovator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Description &amp; Purpose
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe what this competition celebrates, who is eligible, and why supporters should vote..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                    required
                  />
                </div>

                <Input
                  label="Initial Category Name"
                  placeholder="e.g. Overall Crown Queen"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  helperText="You can add additional categories and nominees after creating the contest."
                />
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
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-xs sm:text-sm dark:border-slate-800 dark:bg-slate-850"
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

                <Input
                  label="Cover Banner Image URL"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  helperText="High resolution landscape banner for contest header."
                />
              </div>
            )}

            {/* STEP 3: REVIEW & LAUNCH */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="rounded-2xl bg-slate-50 p-4 sm:p-5 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 space-y-2.5 text-xs">
                  {[
                    { label: "Contest Name", value: formData.name, bold: true },
                    { label: "Price per Vote", value: formatCurrency(Number(formData.votePrice), formData.currency), color: true },
                    { label: "Voting Window", value: `${formData.startDate} → ${formData.endDate}` },
                    { label: "Initial Category", value: formData.categoryName },
                    { label: "Payment Gateway", value: "TransactPay Direct", green: true },
                  ].map((row, i, arr) => (
                    <div
                      key={row.label}
                      className={`flex flex-wrap items-start gap-x-4 gap-y-0.5 ${
                        i < arr.length - 1 ? "pb-2.5 border-b border-slate-200 dark:border-slate-700" : ""
                      }`}
                    >
                      <span className="shrink-0 min-w-[120px] text-slate-500">{row.label}:</span>
                      <span
                        className={[
                          "flex-1 min-w-0 break-words text-right sm:text-left",
                          row.bold ? "font-extrabold text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-200",
                          row.color ? "text-blue-600 dark:text-blue-400 font-bold" : "",
                          row.green ? "text-emerald-600 font-extrabold" : "",
                        ].filter(Boolean).join(" ")}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-blue-50/50 p-4 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200 border border-blue-200/80 dark:border-blue-900">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
                  <span>
                    Your event will be created in live published state with authoritative pricing rules.
                  </span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Step Navigation Buttons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={handleBack}
                  className="rounded-full text-xs font-bold gap-1.5"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleNext}
                  className="rounded-full text-xs font-extrabold gap-1.5 px-6 shadow-md shadow-blue-500/20"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="rounded-full text-sm font-extrabold gap-2 px-8 shadow-lg shadow-blue-500/25"
                >
                  <Trophy className="h-4 w-4" />
                  Launch Competition
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
