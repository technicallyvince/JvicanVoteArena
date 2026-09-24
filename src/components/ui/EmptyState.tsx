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
        "flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl border border-dashed border-white/[0.1] bg-[#0a0a0a]/50 backdrop-blur-md",
        className
      )}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#141414] text-[#C9A84C] mb-5 shadow-inner border border-white/[0.05]">
          {icon}
        </div>
      )}
      <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-sm leading-relaxed">
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
