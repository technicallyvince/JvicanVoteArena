import React from "react"
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/80",
        className
      )}
      {...props}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <Skeleton className="aspect-16/10 w-full rounded-2xl" />
      <div className="space-y-2 pt-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="pt-4 flex justify-between">
        <Skeleton className="h-9 w-24 rounded-xl" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  )
}
