import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "muted" | "glass" | "highlight" | "interactive"
  rounded?: "md" | "lg" | "xl" | "2xl" | "3xl"
  noPadding?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      rounded = "3xl",
      noPadding = false,
      children,
      ...props
    },
    ref
  ) => {
    const roundings = {
      md: "rounded-xl",
      lg: "rounded-2xl",
      xl: "rounded-3xl",
      "2xl": "rounded-[28px]",
      "3xl": "rounded-[32px]",
    }

    const variants = {
      default:
        "border border-slate-200/90 bg-white shadow-xs dark:border-slate-800/90 dark:bg-slate-900/90",
      surface:
        "border border-slate-200/80 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50",
      muted:
        "border border-slate-100 bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900/40",
      glass:
        "glass-panel shadow-lg",
      highlight:
        "border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-white to-amber-500/10 dark:from-amber-500/10 dark:via-slate-900 dark:to-slate-900 shadow-md",
      interactive:
        "border border-slate-200/90 bg-white card-hover cursor-pointer dark:border-slate-800/90 dark:bg-slate-900/90",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "overflow-hidden transition-all duration-200",
          roundings[rounded],
          variants[variant],
          !noPadding && "p-5 sm:p-6 lg:p-8",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"
