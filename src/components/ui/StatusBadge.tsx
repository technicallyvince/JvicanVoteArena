import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, AlertCircle, ShieldCheck, XCircle } from "lucide-react"

export type StatusType =
  | "LIVE"
  | "UPCOMING"
  | "CLOSED"
  | "DRAFT"
  | "PUBLISHED"
  | "PENDING"
  | "CONFIRMED"
  | "FAILED"

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType | string
  size?: "sm" | "md" | "lg"
  showDot?: boolean
}

export function StatusBadge({
  status,
  size = "sm",
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const normStatus = (status || "").toUpperCase() as StatusType

  const config: Record<
    StatusType,
    { label: string; styles: string; dot: string; icon?: React.ReactNode }
  > = {
    LIVE: {
      label: "LIVE VOTING",
      styles: "bg-emerald-500 text-white border-emerald-400/40 shadow-xs",
      dot: "bg-white animate-pulse",
    },
    PUBLISHED: {
      label: "LIVE",
      styles: "bg-emerald-500 text-white border-emerald-400/40 shadow-xs",
      dot: "bg-white animate-pulse",
    },
    UPCOMING: {
      label: "UPCOMING",
      styles: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
      dot: "bg-sky-500",
      icon: <Clock className="h-3 w-3" />,
    },
    CLOSED: {
      label: "CONCLUDED",
      styles: "bg-slate-800 text-slate-200 border-slate-700",
      dot: "bg-amber-400",
      icon: <CheckCircle2 className="h-3 w-3 text-amber-400" />,
    },
    DRAFT: {
      label: "DRAFT",
      styles: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      dot: "bg-slate-400",
    },
    CONFIRMED: {
      label: "CONFIRMED & VERIFIED",
      styles: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-500",
      icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />,
    },
    PENDING: {
      label: "PENDING GATEWAY",
      styles: "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30",
      dot: "bg-amber-500 animate-ping",
      icon: <Clock className="h-3 w-3" />,
    },
    FAILED: {
      label: "PAYMENT FAILED",
      styles: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
      dot: "bg-rose-500",
      icon: <XCircle className="h-3.5 w-3.5" />,
    },
  }

  const current = config[normStatus] || {
    label: normStatus || "STATUS",
    styles: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
  }

  const sizes = {
    sm: "text-[10px] px-2.5 py-0.5 font-extrabold tracking-wider",
    md: "text-xs px-3 py-1 font-extrabold tracking-wider",
    lg: "text-xs sm:text-sm px-3.5 py-1.5 font-black tracking-widest",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border uppercase select-none transition-colors",
        current.styles,
        sizes[size],
        className
      )}
      {...props}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", current.dot)} />
      )}
      {current.icon}
      <span>{current.label}</span>
    </span>
  )
}
