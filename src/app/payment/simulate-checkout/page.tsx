"use client"

import React, { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { formatCurrency } from "@/lib/utils"
import { ShieldCheck, CreditCard, Lock, Clock } from "lucide-react"

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
    router.push("/contests")
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              TP
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Transact<span className="text-blue-600">Pay</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Sandbox Payment Gateway
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            <Lock className="h-3 w-3" />
            256-Bit SSL
          </div>
        </div>

        <div className="my-6 space-y-4">
          <div className="text-center py-2">
            <span className="text-xs text-slate-400">Amount to Pay</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white mt-0.5">
              {formatCurrency(amount, "NGN")}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800 text-xs space-y-2 border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between text-slate-500">
              <span>Customer:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{email}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Order Reference:</span>
              <span className="font-mono text-slate-900 dark:text-white">{reference}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Integration Mode:</span>
              <span className="font-semibold text-blue-600">Standard Hosted Checkout</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            isLoading={isProcessing}
            onClick={handleSimulateSuccess}
            className="w-full justify-center font-bold text-base shadow-md shadow-blue-500/20"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Simulate Successful Payment
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleSimulateCancel}
            className="w-full justify-center text-xs"
          >
            Cancel and Return
          </Button>
        </div>

        <div className="mt-6 text-center text-[11px] text-slate-400">
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <Clock className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <SimulateCheckoutContent />
    </Suspense>
  )
}
