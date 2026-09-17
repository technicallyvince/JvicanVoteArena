import React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  align?: "left" | "center" | "between"
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
}: SectionHeadingProps) {
  if (align === "between") {
    return (
      <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-12", className)}>
        <div className="space-y-1.5 max-w-2xl">
          {eyebrow && (
            <span className="inline-block text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {eyebrow}
            </span>
          )}
          <h2 className="text-fluid-h2 text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
              {description}
            </p>
          )}
        </div>
        {action && <div className="shrink-0 pt-2 sm:pt-0">{action}</div>}
      </div>
    )
  }

  const isCenter = align === "center"

  return (
    <div
      className={cn(
        "mb-8 sm:mb-14",
        isCenter ? "text-center max-w-3xl mx-auto" : "max-w-2xl",
        className
      )}
    >
      {eyebrow && (
        <span className="inline-block text-[11px] sm:text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-2">
          {eyebrow}
        </span>
      )}
      <h2 className="text-fluid-h2 text-slate-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
