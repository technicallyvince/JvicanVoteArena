"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface TradingCardProps {
  imageUrl: string
  rank?: number | string
  badgeText?: string
  title: string
  subtitle?: string | null
  footerText?: string | null
  className?: string
  onClick?: () => void
  children?: React.ReactNode
}

export function ObsidianTradingCard({
  imageUrl,
  rank,
  badgeText,
  title,
  subtitle,
  footerText,
  className,
  onClick,
  children,
}: TradingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const xd = (mx - rect.width / 2) / 14
    const yd = (rect.height / 2 - my) / 14
    cardRef.current.style.transform = `perspective(1000px) rotateY(${xd}deg) rotateX(${yd}deg) scale3d(1.02, 1.02, 1.02)`
  }

  const onMouseEnter = () => {
    setIsHovered(true)
  }

  const onMouseLeave = () => {
    setIsHovered(false)
    if (cardRef.current) {
      cardRef.current.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)`
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{ transition: "transform 0.15s ease-out, box-shadow 0.3s ease" }}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl transition-all cursor-pointer will-change-transform",
        className
      )}
    >
      {/* Background Image with smooth zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
        />
        {/* Holographic Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-500/15 via-transparent to-sky-500/15 opacity-0 transition-opacity duration-500",
            isHovered && "opacity-100"
          )}
        />
      </div>

      {/* Top Badges */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between gap-2">
        {badgeText && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold text-emerald-400 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {badgeText}
          </span>
        )}
        {rank !== undefined && (
          <div className="ml-auto rounded-full border border-white/20 bg-black/70 px-3 py-1 font-mono text-xs font-black text-amber-300 backdrop-blur-md shadow-sm">
            #{rank}
          </div>
        )}
      </div>

      {/* Content details at bottom */}
      <div className="relative z-10 p-6 flex flex-col justify-end text-white">
        {subtitle && (
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
            {subtitle}
          </span>
        )}
        <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-amber-300 transition-colors leading-tight">
          {title}
        </h3>
        {footerText && (
          <p className="mt-1 text-xs font-light text-slate-300 line-clamp-1">
            {footerText}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
