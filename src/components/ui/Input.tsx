import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || React.useId()

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-2xl border border-white/[0.08] bg-neutral-900/90 px-4 py-3 text-sm text-white transition-all duration-150 placeholder:text-neutral-500 focus:border-[#ff5500] focus:outline-none focus:ring-2 focus:ring-[#ff5500]/20",
            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-neutral-400">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

