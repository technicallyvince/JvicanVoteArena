import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "danger" | "success"
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
      "inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none"

    const variants = {
      // Primary: Golden Amber Brand Action (Create Contest / Submit Vote)
      primary:
        "bg-amber-500 text-slate-950 hover:bg-amber-400 active:bg-amber-600 shadow-md shadow-amber-500/25 border border-amber-400/30",
      // Secondary: Deep Obsidian Charcoal
      secondary:
        "bg-slate-900 text-white hover:bg-slate-800 active:bg-black shadow-sm dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-800 dark:border-slate-700",
      // Accent: Vibrant Cyan/Blue Action
      accent:
        "bg-sky-600 text-white hover:bg-sky-500 active:bg-sky-700 shadow-md shadow-sky-500/20 border border-sky-400/30",
      // Outline: Structured surface border
      outline:
        "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:border-slate-700",
      // Ghost: Subtle flat
      ghost:
        "text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white",
      // Danger / Destructive
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-600/20 border border-rose-500/30",
      // Success / Verified
      success:
        "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm shadow-emerald-600/20 border border-emerald-500/30",
    }

    const sizes = {
      sm: "text-xs px-3 py-1.5 h-8 gap-1.5 rounded-lg",
      md: "text-xs sm:text-sm px-4 py-2.5 h-10 gap-2 rounded-xl",
      lg: "text-sm sm:text-base px-6 py-3 h-12 gap-2.5 font-bold rounded-2xl",
      xl: "text-base sm:text-lg px-8 py-3.5 sm:py-4 h-14 gap-3 font-black rounded-full shadow-lg",
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
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    )
  }
)
Button.displayName = "Button"
