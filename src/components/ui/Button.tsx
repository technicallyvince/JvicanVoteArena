import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger" | "success" | "glass"
  size?: "sm" | "md" | "lg" | "xl"
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "group relative inline-flex items-center justify-center font-bold tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff5500] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none active:scale-[0.98]"

    const variants = {
      // Primary: Warm Ember Orange Action with micro-glow
      primary:
        "bg-[#ff5500] text-white hover:bg-[#ff661a] active:bg-[#e64d00] shadow-lg shadow-[#ff5500]/25 border border-[#ff5500]/30 hover:shadow-xl hover:shadow-[#ff5500]/35 hover:-translate-y-0.5",
      // Secondary: Deep Pure Charcoal with subtle border
      secondary:
        "bg-neutral-900 text-white hover:bg-neutral-800 active:bg-black shadow-md border border-white/[0.08] hover:border-white/20",
      // Accent: Vibrant Orange Gradient
      accent:
        "bg-gradient-to-r from-[#ff5500] to-[#ff8c42] text-white hover:from-[#ff661a] hover:to-[#ff9e5e] shadow-lg shadow-[#ff5500]/25 border border-white/10 hover:-translate-y-0.5",
      // Outline: Structured Obsidian glass border
      outline:
        "border border-white/[0.12] bg-white/[0.03] text-white hover:bg-white/[0.08] hover:border-white/25 backdrop-blur-md active:bg-white/[0.05]",
      // Glass: Semi-transparent modern glass
      glass:
        "border border-white/[0.14] bg-neutral-900/80 text-white hover:bg-neutral-800 backdrop-blur-xl shadow-lg hover:border-[#ff5500]/40",
      // Ghost: Subtle flat obsidian
      ghost:
        "text-neutral-300 hover:bg-white/[0.06] hover:text-white active:bg-white/[0.1]",
      // Danger / Destructive
      danger:
        "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-md shadow-rose-600/20 border border-rose-500/30",
      // Success / Verified
      success:
        "bg-emerald-500 text-neutral-950 hover:bg-emerald-400 active:bg-emerald-600 shadow-md shadow-emerald-500/20 border border-emerald-400/30",
    }

    const sizes = {
      sm: "text-xs px-4 py-1.5 h-9 gap-1.5 rounded-full font-semibold",
      md: "text-xs sm:text-sm px-5 py-2.5 h-11 gap-2 rounded-full font-bold",
      lg: "text-sm sm:text-base px-7 py-3.5 h-12.5 gap-2.5 font-bold rounded-full",
      xl: "text-base sm:text-lg px-9 py-4 h-14 gap-3 font-extrabold rounded-full shadow-xl",
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon && <span className="shrink-0 transition-transform group-hover:-translate-x-0.5">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 transition-transform group-hover:translate-x-0.5">{rightIcon}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"
