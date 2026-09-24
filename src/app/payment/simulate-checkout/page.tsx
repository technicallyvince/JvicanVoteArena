"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { ShieldCheck, CreditCard, Lock, Clock, CheckCircle2, ArrowLeft } from "lucide-react"

function SimulateCheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const reference = searchParams?.get("ref") || "REF-SAMPLE"
  const amount = Number(searchParams?.get("amount")) || 1000
  const email = searchParams?.get("email") || "voter@example.com"
  const redirectUrl = searchParams?.get("redirectUrl") || "/payment/callback"

  const [isProcessing, setIsProcessing] = useState(false)

  const handleSimulateSuccess = () => {
    setIsProcessing(true)
    setTimeout(() => {
      // Redirect back to return URL
      window.location.href = redirectUrl
    }, 1200)
  }

  const handleSimulateCancel = () => {
    router.push("/events")
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center p-4 bg-[#050608] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[500px] h-[220px] sm:h-[300px] bg-[#C9A84C]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0c14] backdrop-blur-xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Gateway Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A84C] text-[#0a0c14] font-black text-xs shadow-md">
              TP
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight">
                Transact<span className="text-[#C9A84C]">Pay</span> Direct
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Sandbox Gateway
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
            <Lock className="h-3 w-3" />
            256-Bit SSL
          </div>
        </div>

        {/* Payment Summary */}
        <div className="my-6 space-y-4">
          <div className="text-center py-2">
            <span className="text-xs text-slate-400">Total Authorized Amount</span>
            <div className="text-3xl font-black text-[#C9A84C] mt-0.5">
              {formatCurrency(amount, "NGN")}
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e1018] p-4 text-xs space-y-2.5 border border-white/10">
            <div className="flex justify-between text-slate-400">
              <span>Customer Email:</span>
              <span className="font-semibold text-white">{email}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Order Reference:</span>
              <span className="font-mono text-[#C9A84C]">{reference}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Gateway Engine:</span>
              <span className="font-semibold text-emerald-400">TransactPay Direct Hosted</span>
            </div>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            isLoading={isProcessing}
            onClick={handleSimulateSuccess}
            className="w-full justify-center font-black text-xs sm:text-sm shadow-lg shadow-[#C9A84C]/20 py-3.5"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Simulate Successful Payment
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleSimulateCancel}
            className="w-full justify-center text-xs border-white/10 hover:border-[#C9A84C]/30 text-slate-400 hover:text-white"
          >
            Cancel and Return
          </Button>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-500">
          TransactPay Payment Engine • Official Checkout Simulation
        </div>
      </div>
    </div>
  )
}

export default function SimulateCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center bg-[#050608]">
          <Clock className="h-8 w-8 animate-spin text-[#C9A84C]" />
        </div>
      }
    >
      <SimulateCheckoutContent />
    </Suspense>
  )
}
