"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  maxWidth?: "sm" | "md" | "lg" | "xl"
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const maxSizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          "relative w-full rounded-3xl bg-[#0a0a0a] p-5 sm:p-7 shadow-2xl transition-all border border-white/[0.1] text-white z-10 animate-in zoom-in-95 duration-150 shadow-black/80 max-h-[calc(100dvh-2rem)] flex flex-col my-auto",
          maxSizes[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between pb-3.5 sm:pb-4 border-b border-white/[0.08] shrink-0">
          <div className="min-w-0 flex-1 pr-3">
            {title && (
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white truncate">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-0.5 sm:mt-1 text-xs text-neutral-400 truncate">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 sm:p-2 text-neutral-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer border border-white/5 shrink-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="mt-4 overflow-y-auto pr-1 no-scrollbar flex-1">{children}</div>
      </div>
    </div>
  )
}

