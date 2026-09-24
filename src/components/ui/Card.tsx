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
        "border border-white/[0.08] bg-[#0a0a0a] shadow-xl text-white",
      surface:
        "border border-white/[0.06] bg-[#0a0a0a]/70 backdrop-blur-xl text-white",
      muted:
        "border border-white/[0.05] bg-[#121212] text-white",
      glass:
        "glass-panel shadow-2xl border border-white/[0.08] bg-[#0a0a0a]/80 backdrop-blur-xl text-white",
      highlight:
        "border border-[#C9A84C]/30 bg-gradient-to-br from-[#181818] via-[#0f0f0f] to-[#080808] shadow-2xl text-white",
      interactive:
        "border border-white/[0.08] bg-[#0a0a0a] card-hover cursor-pointer text-white hover:border-[#C9A84C]/30",
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
