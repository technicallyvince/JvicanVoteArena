"use client"

import React, { useState } from "react"
import { Nominee, Event, Category, VotePackage } from "@/types/database"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { formatCurrency } from "@/lib/utils"
import { ShieldCheck, Mail, Check, AlertCircle, Lock, Vote, Gift, ArrowLeft, ArrowRight, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoteModalProps {
  isOpen: boolean
  onClose: () => void
  nominee: Nominee | null
  event: Event | null
  category: Category | null
  packages?: VotePackage[]
}

export function VoteModal({
  isOpen,
  onClose,
  nominee,
  event,
  category,
  packages = [],
}: VoteModalProps) {
  const [step, setStep] = useState<"select" | "review">("select")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(10)
  const [customQuantity, setCustomQuantity] = useState<string>("")
  const [isCustom, setIsCustom] = useState<boolean>(false)
  const [email, setEmail] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")

  if (!nominee || !event) return null

  const unitPrice = Number(event.vote_price) || 100
  const currency = event.currency || "NGN"
  const isFreeVoting = unitPrice === 0

  const finalQuantity = isCustom
    ? Math.max(1, parseInt(customQuantity, 10) || 1)
    : selectedQuantity

  const totalAmount = isFreeVoting ? 0 : finalQuantity * unitPrice

  const defaultPackages = packages.length > 0 ? packages : [
    { id: "1", label: "1", quantity: 1, tag: "" },
    { id: "5", label: "5", quantity: 5, tag: "" },
    { id: "10", label: "10", quantity: 10, tag: "Popular" },
    { id: "20", label: "20", quantity: 20, tag: "" },
    { id: "50", label: "50", quantity: 50, tag: "Value" },
    { id: "100", label: "100", quantity: 100, tag: "VIP" },
  ]

  const handlePackageSelect = (qty: number) => {
    setIsCustom(false)
    setSelectedQuantity(qty)
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustom(true)
    const val = e.target.value.replace(/\D/g, "")
    setCustomQuantity(val)
  }

  const validateEmail = (mail: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(mail)
  }

  const handleContinueToReview = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setErrorMsg("")

    if (!email.trim() || !validateEmail(email)) {
      setEmailError("Please enter a valid email address to receive your receipt.")
      return
    }

    if (finalQuantity <= 0) {
      setErrorMsg("Please select at least 1 vote.")
      return
    }

    setStep("review")
  }

  const handleProceedToPayment = async () => {
    setErrorMsg("")

    try {
      setIsLoading(true)

      const response = await fetch("/api/voting/initialize-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          nomineeId: nominee.id,
          categoryId: nominee.category_id,
          quantity: finalQuantity,
          voterEmail: email.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to initialize voting order.")
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("No checkout redirect URL returned from payment provider.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep("select")
    setErrorMsg("")
    setEmailError("")
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === "select" ? `Vote for ${nominee.name}` : "Review your vote"}
      description={
        step === "select"
          ? `${category?.name || "Official Category"} • #${nominee.public_id}`
          : "Please verify your vote details before proceeding to secure payment."
      }
      maxWidth="md"
    >
      {step === "select" ? (
        <form onSubmit={handleContinueToReview} className="space-y-5">
          {/* Nominee Info Card */}
          <div className="flex items-center gap-3.5 rounded-2xl bg-neutral-900/90 p-3.5 border border-white/[0.08]">
            <img
              src={nominee.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={nominee.name}
              className="h-14 w-14 rounded-xl object-cover shadow-sm ring-1 ring-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white truncate">
                  {nominee.name}
                </h4>
                <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 border border-white/10">
                  #{nominee.public_id}
                </span>
              </div>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {category?.name || "Official Category"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isFreeVoting ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Gift className="h-3 w-3" />
                    Free Community Voting
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-400">
                    {formatCurrency(unitPrice, currency)} <span className="text-[10px] font-normal text-neutral-400">/ vote</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Choose Votes Packages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
                Choose votes:
              </label>
              <span className="text-[11px] text-neutral-400">Quick packages</span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {defaultPackages.map((pkg: any) => {
                const isSelected = !isCustom && selectedQuantity === pkg.quantity
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePackageSelect(pkg.quantity)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer",
                      isSelected
                        ? "border-amber-400 bg-amber-400/15 text-white font-bold ring-1 ring-amber-400/40 shadow-sm"
                        : "border-white/[0.08] bg-neutral-900/80 hover:border-white/20 text-neutral-300 hover:text-white"
                    )}
                  >
                    <span className="text-xs font-black">{pkg.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Custom Quantity Input */}
            <div className="mt-3">
              <label className="block text-[11px] text-neutral-400 mb-1">
                Or enter custom quantity:
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 25"
                value={customQuantity}
                onChange={handleCustomChange}
                className={cn(
                  "w-full rounded-xl border px-4 py-2 text-sm transition-all focus:outline-none bg-neutral-900/90 text-white placeholder:text-neutral-500",
                  isCustom && customQuantity
                    ? "border-amber-400 ring-1 ring-amber-400/30 bg-amber-400/10 font-bold"
                    : "border-white/[0.08] hover:border-white/20 focus:border-amber-400"
                )}
              />
            </div>
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
              Email (for verified receipt):
            </label>
            <Input
              type="email"
              placeholder="voter@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (emailError) setEmailError("")
              }}
              error={emailError}
              required
            />
          </div>

          {/* Dynamic Total */}
          <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/80 p-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-neutral-400 block">Total</span>
              <span className="text-[11px] text-neutral-500">{finalQuantity} vote{finalQuantity > 1 ? "s" : ""} selected</span>
            </div>
            <span className="text-2xl font-black text-amber-400">
              {isFreeVoting ? "Free" : formatCurrency(totalAmount, currency)}
            </span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Continue CTA */}
          <div className="space-y-2 pt-1">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-sm font-extrabold shadow-lg shadow-amber-500/20 rounded-full py-3.5"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>TransactPay Authoritative Pricing • Instant Verified Proof</span>
            </div>
          </div>
        </form>
      ) : (
        /* STEP 2: VOTE REVIEW STEP */
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/90 p-5 divide-y divide-white/[0.06] text-xs">
            <div className="flex items-center justify-between pb-3">
              <span className="text-neutral-400">Nominee</span>
              <span className="font-extrabold text-white text-sm">{nominee.name}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-neutral-400">Event</span>
              <span className="font-semibold text-neutral-200">{event.name}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-neutral-400">Category</span>
              <span className="font-semibold text-neutral-200">{category?.name || "Official Category"}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-neutral-400">Votes</span>
              <span className="font-bold text-amber-400">{finalQuantity}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-neutral-400">Price</span>
              <span className="font-medium text-neutral-300">
                {isFreeVoting ? "Free" : `${formatCurrency(unitPrice, currency)} / vote`}
              </span>
            </div>

            <div className="flex items-center justify-between py-3">
              <span className="text-neutral-400">Receipt email</span>
              <span className="font-mono text-neutral-200">{email}</span>
            </div>

            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="font-bold text-white">Total</span>
              <span className="text-2xl font-black text-amber-400">
                {isFreeVoting ? "₦0 (Free)" : formatCurrency(totalAmount, currency)}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons: Back & Proceed to Secure Payment */}
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep("select")}
              disabled={isLoading}
              className="flex-1 justify-center rounded-full text-xs font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back
            </Button>

            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleProceedToPayment}
              isLoading={isLoading}
              className="flex-2 justify-center rounded-full text-xs sm:text-sm font-extrabold shadow-lg shadow-amber-500/20"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Proceed to Secure Payment
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Bank-grade 256-bit encryption • Zero duplicate webhooks</span>
          </div>
        </div>
      )}
    </Modal>
  )
}
