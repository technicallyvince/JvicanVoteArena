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
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-150 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:bg-slate-900 dark:text-slate-100",
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-800 dark:focus:border-blue-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"
