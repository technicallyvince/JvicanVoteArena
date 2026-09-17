"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

export interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showName?: boolean
  showSubtitle?: boolean
  className?: string
  priority?: boolean
  variant?: "dark" | "light" | "auto"
}

export function BrandLogo({
  size = "md",
  showName = false,
  showSubtitle = false,
  className,
  priority = false,
  variant = "auto",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { img: 32, box: "h-8 w-8", text: "text-base", sub: "text-[9px]" },
    md: { img: 42, box: "h-10 w-10 sm:h-11 sm:w-11", text: "text-lg sm:text-xl", sub: "text-[10px]" },
    lg: { img: 56, box: "h-14 w-14", text: "text-2xl", sub: "text-xs" },
    xl: { img: 80, box: "h-20 w-20", text: "text-3xl sm:text-4xl", sub: "text-sm" },
  }

  const { img, box, text, sub } = sizeMap[size]

  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Official Mascot Logo Container */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105 shadow-md shadow-amber-500/20 border border-amber-400/40 bg-black",
          box
        )}
      >
        <Image
          src="/brand/jvican-vote-arena-logo.png"
          alt="JVican Vote Arena Official Brand Logo"
          width={img}
          height={img}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Brand Lockup Wordmark */}
      {showName && (
        <div className="flex flex-col leading-tight">
          <div className={cn("font-black tracking-tight flex items-center gap-1", text)}>
            <span className="text-amber-500 dark:text-amber-400">JVican</span>
            <span
              className={cn(
                variant === "dark"
                  ? "text-white"
                  : variant === "light"
                  ? "text-slate-900"
                  : "text-slate-900 dark:text-white"
              )}
            >
              Vote Arena
            </span>
          </div>
          {showSubtitle && (
            <span
              className={cn(
                "font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                sub
              )}
            >
              Verified Voting Platform
            </span>
          )}
        </div>
      )}
    </div>
  )
}
