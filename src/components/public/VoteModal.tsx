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
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>("")

  if (!nominee || !event) return null

  const unitPrice = Math.max(100, Number(event.vote_price) || 100)
  const currency = event.currency || "NGN"
  const isFreeVoting = unitPrice === 0

  const finalQuantity = isCustom
    ? Math.max(10, parseInt(customQuantity, 10) || 10)
    : selectedQuantity

  const totalAmount = isFreeVoting ? 0 : finalQuantity * unitPrice

  const defaultPackages = packages.length > 0 ? packages : [
    { id: "10", label: "10 Votes", quantity: 10, tag: "Starter" },
    { id: "25", label: "25 Votes", quantity: 25, tag: "Popular" },
    { id: "50", label: "50 Votes", quantity: 50, tag: "Value" },
    { id: "100", label: "100 Votes", quantity: 100, tag: "Bronze" },
    { id: "250", label: "250 Votes", quantity: 250, tag: "Silver" },
    { id: "500", label: "500 Votes", quantity: 500, tag: "Gold VIP" },
  ]

  const handlePackageSelect = (qty: number) => {
    setIsCustom(false)
    setSelectedQuantity(Math.max(10, qty))
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

    const parsedQty = isCustom ? parseInt(customQuantity, 10) : selectedQuantity

    if (!parsedQty || isNaN(parsedQty) || parsedQty < 10) {
      setErrorMsg("The minimum vote quantity is 10 votes (₦1,000 minimum).")
      return
    }

    setStep("review")
  }

  const handleProceedToPayment = async () => {
    setErrorMsg("")

    try {
      setIsLoading(true)

      // If user voluntarily opted into newsletter, register their email
      if (newsletterOptIn && email.trim()) {
        fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), source: 'VOTING_FLOW' }),
        }).catch((err) => console.warn('Newsletter subscription during voting non-fatal error:', err))
      }

      // 1. Authoritative server initialization: creates pending payment and generates safe checkout config
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

      const { checkoutConfig, useStandardKit, simulationUrl, reference } = data

      // 2. If Standard Kit is configured and window.CheckoutNS is available
      if (useStandardKit && typeof window !== "undefined") {
        const checkoutNS = (window as any).CheckoutNS

        if (!checkoutNS || !checkoutNS.PaymentCheckout) {
          // If the script hasn't loaded yet, try dynamically loading it or fallback
          console.warn("[TransactPay] CheckoutNS not found on window, attempting dynamic load...")
          await new Promise<void>((resolve, reject) => {
            const existingScript = document.querySelector('script[src="https://payment-web-sdk.transactpay.ai/v1/checkout"]')
            if (existingScript) {
              existingScript.addEventListener('load', () => resolve())
              existingScript.addEventListener('error', () => reject(new Error('Failed to load TransactPay Checkout SDK.')))
              // If already loaded
              if ((window as any).CheckoutNS) return resolve()
            } else {
              const script = document.createElement('script')
              script.src = 'https://payment-web-sdk.transactpay.ai/v1/checkout'
              script.onload = () => resolve()
              script.onerror = () => reject(new Error('Failed to load TransactPay Checkout SDK.'))
              document.body.appendChild(script)
            }
          })
        }

        const ActiveCheckoutNS = (window as any).CheckoutNS
        if (ActiveCheckoutNS && ActiveCheckoutNS.PaymentCheckout) {
          const Checkout = new ActiveCheckoutNS.PaymentCheckout({
            firstName: checkoutConfig.firstName || "Voter",
            lastName: checkoutConfig.lastName || "Supporter",
            mobile: checkoutConfig.mobile || "08000000000",
            country: checkoutConfig.country || "NG",
            email: checkoutConfig.email,
            currency: checkoutConfig.currency || "NGN",
            amount: checkoutConfig.amount,
            reference: checkoutConfig.reference,
            merchantReference: checkoutConfig.merchantReference,
            description: checkoutConfig.description,
            apiKey: checkoutConfig.apiKey,
            encryptionKey: checkoutConfig.encryptionKey,
            onCompleted: (paymentData: any) => {
              console.log("[TransactPay] onCompleted event:", paymentData)
              setIsLoading(false)
              // Close modal and redirect to official server verification page
              handleClose()
              window.location.href = `/payment/callback?ref=${encodeURIComponent(reference)}`
            },
            onClose: () => {
              console.log("[TransactPay] Checkout closed by user")
              setIsLoading(false)
            },
            onError: (error: any) => {
              console.error("[TransactPay] Checkout error:", error)
              setIsLoading(false)
              setErrorMsg(typeof error === 'string' ? error : error?.message || 'Payment gateway encountered an error.')
            },
          })

          Checkout.init()
          return
        }
      }

      // Fallback: Sandbox simulation URL
      if (simulationUrl) {
        window.location.href = simulationUrl
      } else {
        throw new Error("Unable to open checkout. Please check gateway configuration.")
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
    setIsLoading(false)
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
          <div className="flex items-center gap-3 sm:gap-3.5 rounded-2xl bg-[#0e1018] p-3 sm:p-3.5 border border-white/[0.08]">
            <img
              src={nominee.image_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
              alt={nominee.name}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl object-cover shadow-sm ring-1 ring-white/10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {nominee.name}
                </h4>
                <span className="rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono font-bold text-[#C9A84C] border border-white/10 shrink-0">
                  #{nominee.public_id}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate mt-0.5">
                {category?.name || "Official Category"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {isFreeVoting ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <Gift className="h-3 w-3" />
                    Free Community Voting
                  </span>
                ) : (
                  <span className="text-xs font-bold text-[#C9A84C]">
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

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {defaultPackages.map((pkg: any) => {
                const isSelected = !isCustom && selectedQuantity === pkg.quantity
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handlePackageSelect(pkg.quantity)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer active:scale-98",
                      isSelected
                        ? "border-[#C9A84C] bg-[#C9A84C]/15 text-white font-bold ring-1 ring-[#C9A84C]/40 shadow-sm"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-neutral-400">
                  Or enter custom quantity:
                </label>
                <span className="text-[10px] text-[#C9A84C] font-semibold">Min 10 votes (₦1,000)</span>
              </div>
              <input
                type="number"
                min="10"
                placeholder="e.g. 25 (minimum 10)"
                value={customQuantity}
                onChange={handleCustomChange}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-2 text-xs sm:text-sm transition-all focus:outline-none bg-neutral-900/90 text-white placeholder:text-neutral-500",
                  isCustom && customQuantity
                    ? "border-[#C9A84C] ring-1 ring-[#C9A84C]/30 bg-[#C9A84C]/10 font-bold"
                    : "border-white/[0.08] hover:border-white/20 focus:border-[#C9A84C]"
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

          {/* Optional Newsletter Opt-In (Unchecked by default) */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <input
              id="newsletter-opt-in"
              type="checkbox"
              checked={newsletterOptIn}
              onChange={(e) => setNewsletterOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/20 bg-neutral-900 text-[#C9A84C] focus:ring-[#C9A84C] focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="newsletter-opt-in" className="text-[11px] text-neutral-300 cursor-pointer leading-tight">
              Receive updates about new events, featured nominees, and JVican announcements (optional)
            </label>
          </div>

          {/* Dynamic Total */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e1018] p-3.5 sm:p-4 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-neutral-400 block">Total</span>
              <span className="text-[11px] text-neutral-500">{finalQuantity} vote{finalQuantity > 1 ? "s" : ""} selected</span>
            </div>
            <span className="text-xl sm:text-2xl font-black text-[#C9A84C]">
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
              className="w-full justify-center text-xs sm:text-sm font-extrabold shadow-lg shadow-[#C9A84C]/20 rounded-full py-3 sm:py-3.5 btn-shimmer"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Server-Authoritative Pricing • Instant Verified Proof</span>
            </div>
          </div>
        </form>
      ) : (
        /* STEP 2: VOTE REVIEW STEP */
        <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0e1018] p-4 sm:p-5 divide-y divide-white/[0.06] text-xs">
            <div className="flex items-center justify-between pb-2.5 sm:pb-3">
              <span className="text-neutral-400">Nominee</span>
              <span className="font-extrabold text-white text-xs sm:text-sm">{nominee.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-2.5">
              <span className="text-neutral-400">Event</span>
              <span className="font-semibold text-neutral-200 truncate max-w-[200px]">{event.name}</span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-2.5">
              <span className="text-neutral-400">Category</span>
              <span className="font-semibold text-neutral-200 truncate max-w-[200px]">{category?.name || "Official Category"}</span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-2.5">
              <span className="text-neutral-400">Votes</span>
              <span className="font-bold text-[#C9A84C]">{finalQuantity}</span>
            </div>

            <div className="flex items-center justify-between py-2 sm:py-2.5">
              <span className="text-neutral-400">Price</span>
              <span className="font-medium text-neutral-300">
                {isFreeVoting ? "Free" : `${formatCurrency(unitPrice, currency)} / vote`}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5 sm:py-3">
              <span className="text-neutral-400">Receipt email</span>
              <span className="font-mono text-neutral-200 truncate max-w-[180px]">{email}</span>
            </div>

            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="font-bold text-white">Total</span>
              <span className="text-xl sm:text-2xl font-black text-[#C9A84C]">
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
          <div className="flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setStep("select")}
              disabled={isLoading}
              className="w-full sm:flex-1 justify-center rounded-full text-xs font-bold"
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
              className="w-full sm:flex-2 justify-center rounded-full text-xs sm:text-sm font-extrabold shadow-lg shadow-[#C9A84C]/20 btn-shimmer"
            >
              <Lock className="h-4 w-4 mr-1.5" />
              Proceed to Secure Payment
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-neutral-400 text-center">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Bank-grade 256-bit encryption • Zero duplicate webhooks</span>
          </div>
        </div>
      )}
    </Modal>
  )
}
