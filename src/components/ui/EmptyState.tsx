import React from "react"
import Link from "next/link"
import { Button } from "./Button"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 mb-5 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && (
        <div className="mt-6">
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="primary" size="md" className="rounded-full px-6 text-xs font-black">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={onAction}
              className="rounded-full px-6 text-xs font-black"
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
