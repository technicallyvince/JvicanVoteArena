"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ShieldAlert,
  LayoutDashboard,
  CalendarCheck2,
  Clock,
  ReceiptText,
  Wallet,
  ScrollText,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ArrowLeftRight,
  CheckCircle2,
  Mail,
  Inbox,
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { BrandLogo } from "@/components/ui/BrandLogo"
import { MenuDropdown } from "@/components/ui/MenuDropdown"
import { cn } from "@/lib/utils"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, isSuperAdmin, logout } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Pending Approval", href: "/admin/events/pending", icon: Clock, badge: "Queue" },
    { name: "All Events", href: "/admin/events", icon: CalendarCheck2 },
    { name: "Transactions Ledger", href: "/admin/transactions", icon: ReceiptText },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
    { name: "Newsletter & Audience", href: "/admin/newsletter", icon: Mail },
    { name: "Email Delivery Logs", href: "/admin/emails", icon: Inbox },
    { name: "Audit Log", href: "/admin/audit-log", icon: ScrollText },
    { name: "Platform Settings", href: "/admin/settings", icon: SlidersHorizontal },
  ]

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white flex flex-col md:flex-row selection:bg-[#C9A84C] selection:text-[#050608]">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#090a10]/95 backdrop-blur-md sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2">
          <BrandLogo size="sm" showName={false} variant="dark" />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest">
            <ShieldAlert className="h-3 w-3" />
            <span>Super Admin</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.1] active:scale-95 transition-all cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileNavOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs bg-[#08090e] border-r border-white/[0.08] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out",
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Drawer Header */}
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
            <Link href="/admin" onClick={() => setMobileNavOpen(false)} className="flex items-center gap-2">
              <BrandLogo size="sm" showName variant="dark" />
            </Link>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="p-1.5 rounded-lg bg-white/[0.05] text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 mb-3">
              <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  Command Center
                </span>
                <span className="text-[11px] font-semibold text-slate-300 truncate">
                  Super Admin Oversight
                </span>
              </div>
            </div>

            {/* Mobile Nav Links */}
            <div className="px-2 pb-1.5 text-[10px] font-black tracking-widest uppercase text-slate-500">
              Platform Management
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                      active
                        ? "bg-[#C9A84C] text-[#050608] shadow-md font-black"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4", active ? "text-[#050608]" : "text-slate-400")} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && !active && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="pt-4 px-2 pb-1.5 text-[10px] font-black tracking-widest uppercase text-slate-500">
              Quick Switches
            </div>
            <div className="space-y-1">
              <Link
                href="/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <ArrowLeftRight className="h-4 w-4 text-slate-400" />
                  <span>Organizer View</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Link>
              <Link
                href="/events"
                target="_blank"
                onClick={() => setMobileNavOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-[#C9A84C]" />
                  <span>Public Marketplace</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 opacity-50" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Drawer Footer */}
        <div className="p-4 border-t border-white/[0.08] bg-[#07080c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || "Chief Super Admin"}
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono truncate">
                {user?.email || "admin@jvican.com"}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 shrink-0" />
          </div>

          <button
            onClick={() => {
              setMobileNavOpen(false)
              logout()
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Super Admin Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 bg-[#08090e] border-r border-white/[0.08] flex-col justify-between sticky top-0 h-screen">
        {/* Sidebar Header */}
        <div className="p-5 border-b border-white/[0.08]">
          <Link href="/admin" className="flex items-center gap-2.5">
            <BrandLogo size="md" showName variant="dark" />
          </Link>
          <div className="mt-3.5 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                Command Center
              </span>
              <span className="text-[11px] font-semibold text-slate-300 truncate">
                Super Admin Oversight
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-black tracking-widest uppercase text-slate-500">
            Platform Management
          </div>
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all group",
                  active
                    ? "bg-[#C9A84C] text-[#050608] shadow-lg shadow-[#C9A84C]/20 font-black"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("h-4 w-4", active ? "text-[#050608]" : "text-slate-400 group-hover:text-white")} />
                  <span>{item.name}</span>
                </div>
                {item.badge && !active && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-black tracking-widest uppercase text-slate-500">
            Quick Switches
          </div>

          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <ArrowLeftRight className="h-4 w-4 text-slate-400" />
              <span>Organizer View</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </Link>

          <Link
            href="/events"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.04] transition-all"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-[#C9A84C]" />
              <span>Public Marketplace</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-50" />
          </Link>
        </nav>

        {/* Sidebar Footer & Role Switcher */}
        <div className="p-4 border-t border-white/[0.08] bg-[#07080c] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-white truncate">
                {user?.name || "Chief Super Admin"}
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono truncate">
                {user?.email || "admin@jvican.com"}
              </span>
            </div>
            <div className="h-2 w-2 rounded-full bg-emerald-400 ring-4 ring-emerald-400/20 shrink-0" />
          </div>

          {/* Current Role Badge */}
          <div className="bg-black/40 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">Current Session</span>
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {isSuperAdmin ? "Super Admin" : "Organizer"}
            </span>
          </div>

          <button
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-x-hidden min-h-screen bg-[#050608] p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
