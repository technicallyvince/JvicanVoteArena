"use client"

import React, { useState } from "react"
import { Nominee, Event, Category, VotePackage } from "@/types/database"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { formatCurrency } from "@/lib/utils"
import { ShieldCheck, Mail, Check, AlertCircle, Lock, Vote, Gift } from "lucide-react"
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
    { id: "1", label: "1 Vote", quantity: 1, tag: "" },
    { id: "5", label: "5 Votes", quantity: 5, tag: "" },
    { id: "10", label: "10 Votes", quantity: 10, tag: "Popular" },
    { id: "20", label: "20 Votes", quantity: 20, tag: "" },
    { id: "50", label: "50 Votes", quantity: 50, tag: "Best Value" },
    { id: "100", label: "100 Votes", quantity: 100, tag: "VIP" },
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

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")
    setErrorMsg("")

    if (!email.trim() || !validateEmail(email)) {
      setEmailError("Please enter a valid email address to receive your verified receipt.")
      return
    }

    if (finalQuantity <= 0) {
      setErrorMsg("Please select at least 1 vote.")
      return
    }

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

      // Redirect to TransactPay standard checkout page or sandbox simulation
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cast Verified Votes"
      description={`Support ${nominee.name} in ${event.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleProceedToPayment} className="space-y-5">
        {/* Nominee Mini Card */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-neutral-900/90 p-3.5 border border-white/[0.08]">
          <img
            src={nominee.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
            alt={nominee.name}
            className="h-14 w-14 rounded-xl object-cover shadow-sm"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white truncate">
                {nominee.name}
              </h4>
              <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#ff8c42] border border-white/10">
                #{nominee.public_id}
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate mt-0.5">
              {category?.name || "Competition Category"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              {isFreeVoting ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <Gift className="h-3 w-3" />
                  Free Community Voting
                </span>
              ) : (
                <span className="text-xs font-bold text-[#ff8c42]">
                  {formatCurrency(unitPrice, currency)} <span className="text-[10px] font-normal text-neutral-400">/ vote</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Free vs Paid Vote Indicator Banner */}
        <div className={cn(
          "flex items-center justify-between rounded-2xl px-3.5 py-2.5 text-xs font-semibold border",
          isFreeVoting
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            : "bg-[#ff5500]/10 text-[#ff8c42] border-[#ff5500]/20"
        )}>
          <div className="flex items-center gap-1.5 font-bold">
            {isFreeVoting ? <Gift className="h-4 w-4 text-emerald-400" /> : <Lock className="h-4 w-4 text-[#ff5500]" />}
            <span>{isFreeVoting ? "FREE VOTE MODE" : "OFFICIAL PAID VOTE"}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-white">
            {isFreeVoting ? "0.00 NGN" : `1 Vote = ${formatCurrency(unitPrice, currency)}`}
          </span>
        </div>

        {/* Step 1: Select Vote Package */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold uppercase tracking-wider text-neutral-300">
              1. Choose Vote Package
            </label>
            <span className="text-[11px] text-neutral-400">Select bundle or type custom</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {defaultPackages.map((pkg: any) => {
              const isSelected = !isCustom && selectedQuantity === pkg.quantity
              return (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => handlePackageSelect(pkg.quantity)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-[#ff5500] bg-[#ff5500]/15 text-white font-bold shadow-lg shadow-[#ff5500]/20 ring-1 ring-[#ff5500]/40"
                      : "border-white/[0.08] bg-neutral-900/80 hover:border-white/20 text-neutral-300 hover:text-white"
                  )}
                >
                  {pkg.tag && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-[#ff5500] px-2 py-0.2 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                      {pkg.tag}
                    </span>
                  )}
                  <span className="text-sm font-extrabold">{pkg.label}</span>
                  <span className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                    {isFreeVoting ? "Free" : formatCurrency(pkg.quantity * unitPrice, currency)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Custom Quantity Input */}
          <div className="mt-3">
            <input
              type="number"
              min="1"
              placeholder="Or enter custom number of votes..."
              value={customQuantity}
              onChange={handleCustomChange}
              className={cn(
                "w-full rounded-2xl border px-4 py-2.5 text-sm transition-all focus:outline-none bg-neutral-900/90 text-white placeholder:text-neutral-500",
                isCustom && customQuantity
                  ? "border-[#ff5500] ring-2 ring-[#ff5500]/20 bg-[#ff5500]/10 font-bold"
                  : "border-white/[0.08] hover:border-white/20 focus:border-[#ff5500]"
              )}
            />
          </div>
        </div>

        {/* Step 2: Voter Email */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-neutral-300 mb-1">
            2. Voter Email (For Instant Receipt)
          </label>
          <Input
            type="email"
            placeholder="supporter@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) setEmailError("")
            }}
            error={emailError}
            helperText="Your cryptographically signed receipt and vote verification link will be delivered here."
            required
          />
        </div>

        {/* Order Summary Box */}
        <div className="rounded-2xl border border-white/[0.08] bg-neutral-900/80 p-4">
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Votes to Cast:</span>
            <span className="font-extrabold text-white">
              {finalQuantity.toLocaleString()} vote{finalQuantity > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mb-2 pb-2 border-b border-white/[0.06]">
            <span>Payment Processor:</span>
            <span className="font-semibold text-neutral-200">TransactPay Direct Gateway</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-sm font-bold text-white">Total Amount Due</span>
            <span className="text-2xl font-black text-[#ff5500]">
              {isFreeVoting ? "₦0.00 (Free)" : formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="space-y-2.5 pt-1">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full justify-center text-base font-extrabold shadow-lg shadow-[#ff5500]/25 rounded-full py-3.5"
          >
            <Vote className="h-5 w-5 mr-2" />
            {isFreeVoting ? "Cast Free Vote Now" : `Continue to Payment (${formatCurrency(totalAmount, currency)})`}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-[#ff5500]" />
            <span>Bank-grade 256-bit encryption • Zero voter registration required</span>
          </div>
        </div>
      </form>
    </Modal>
  )
}
