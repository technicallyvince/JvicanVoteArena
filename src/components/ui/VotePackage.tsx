"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, Zap } from "lucide-react"

export interface VotePackageProps {
  quantity: number
  unitPrice: number
  currency?: string
  tag?: string
  isSelected?: boolean
  isPopular?: boolean
  disabled?: boolean
  onSelect: (quantity: number) => void
  className?: string
}

export function VotePackage({
  quantity,
  unitPrice,
  currency = "NGN",
  tag,
  isSelected = false,
  isPopular = false,
  disabled = false,
  onSelect,
  className,
}: VotePackageProps) {
  const isFree = unitPrice === 0
  const totalPrice = isFree ? 0 : quantity * unitPrice

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(quantity)}
      className={cn(
        "group relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none text-center",
        isSelected
          ? "border-amber-500 bg-amber-500/10 shadow-md shadow-amber-500/15 scale-[1.02] dark:bg-amber-500/15"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Badge Tag (Popular / VIP / Savings) */}
      {tag && (
        <span
          className={cn(
            "absolute -top-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-xs",
            isSelected
              ? "bg-amber-500 text-slate-950"
              : isPopular
              ? "bg-sky-600 text-white"
              : "bg-slate-800 text-white"
          )}
        >
          {tag}
        </span>
      )}

      {/* Check Indicator */}
      <div className="w-full flex justify-end">
        <div
          className={cn(
            "h-4 w-4 rounded-full flex items-center justify-center transition-colors",
            isSelected ? "bg-amber-500 text-slate-950" : "border border-slate-300 dark:border-slate-700"
          )}
        >
          {isSelected && <CheckCircle2 className="h-4 w-4" />}
        </div>
      </div>

      {/* Quantity & Votes */}
      <div className="my-1">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white block">
          {quantity}
        </span>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Vote{quantity > 1 ? "s" : ""}
        </span>
      </div>

      {/* Price Label */}
      <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <span
          className={cn(
            "text-xs font-black block",
            isSelected ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"
          )}
        >
          {isFree ? "Free" : formatCurrency(totalPrice, currency)}
        </span>
      </div>
    </button>
  )
}
