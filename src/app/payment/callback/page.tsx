"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import confetti from "canvas-confetti"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
  ArrowRight,
  ShieldCheck,
  Mail,
} from "lucide-react"

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reference = searchParams?.get("ref")

  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying")
  const [data, setData] = useState<any>(null)
  const [errorMsg, setErrorMsg] = useState<string>("")

  useEffect(() => {
    if (!reference) {
      setStatus("failed")
      setErrorMsg("No transaction reference provided.")
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/voting/verify-payment?ref=${encodeURIComponent(reference)}`)
        const json = await res.json()

        if (json.success) {
          setData(json)
          setStatus("success")
          // Fire celebration confetti
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          })
        } else {
          setStatus("failed")
          setErrorMsg(json.error || "Payment verification failed.")
        }
      } catch (err: any) {
        setStatus("failed")
        setErrorMsg(err.message || "Network error occurred during verification.")
      }
    }

    verify()
  }, [reference])

  if (status === "verifying") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-slate-800 animate-pulse">
          <Clock className="h-8 w-8 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">
          Verifying Payment with TransactPay...
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-sm">
          Please do not close this window. We are confirming your transaction and recording your votes on the official ledger.
        </p>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40">
          <XCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">
          Payment Verification Failed
        </h2>
        <p className="text-sm text-red-600 mt-2 max-w-sm font-medium">{errorMsg}</p>
        <div className="mt-8 flex gap-3">
          <Link href="/events">
            <Button variant="primary">Return to Events</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { vote, receipt } = data || {}

  return (
    <div className="py-10 sm:py-16 pt-24 sm:pt-28 bg-[#050608] min-h-screen text-white selection:bg-[#C9A84C] selection:text-[#0a0c14]">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-[#0a0c14] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 mb-4 shadow-md border border-emerald-500/30">
              <CheckCircle2 className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              Payment &amp; Votes Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Thank You For Voting!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your votes have been authoritatively recorded on the ledger.
            </p>
          </div>

          {/* Receipt Preview Box */}
          <div className="mt-8 rounded-2xl bg-[#0e1018] p-5 sm:p-6 border border-white/[0.06] space-y-3">
            <div className="flex justify-between text-xs text-slate-400 pb-2 border-b border-white/[0.06]">
              <span>Receipt Number</span>
              <span className="font-mono font-bold text-white">
                {receipt?.receipt_number || "REC-2026-XXXX"}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Votes Cast</span>
              <span className="font-bold text-[#C9A84C]">
                {vote?.quantity} Vote{vote?.quantity > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Total Paid</span>
              <span className="font-bold text-white">
                {formatCurrency(vote?.total_amount, vote?.currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>Voter Email</span>
              <span className="font-medium text-white">
                {vote?.voter_email}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-white/[0.06]">
              <span>Payment Ref</span>
              <span className="font-mono text-slate-300">
                {vote?.payment_reference}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
            <Mail className="h-4 w-4 text-[#C9A84C]" />
            <span>A verified receipt has been dispatched to {vote?.voter_email}.</span>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            {receipt?.public_id && (
              <Link href={`/receipt/${receipt.public_id}`} className="block">
                <Button variant="primary" size="lg" className="w-full justify-center font-bold">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Public Receipt Verification
                </Button>
              </Link>
            )}

            <Link href="/events" className="block">
              <Button variant="outline" size="md" className="w-full justify-center border-white/10 hover:border-[#C9A84C]/40 text-slate-300 hover:text-white">
                Return to Events
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Clock className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  )
}
