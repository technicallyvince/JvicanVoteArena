"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronRight, ArrowUpRight, LogOut, User, Sparkles } from "lucide-react"
import { BrandLogo } from "../ui/BrandLogo"
import { Button } from "../ui/Button"
import { AuthModal } from "../auth/AuthModal"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { name: "Events", href: "/events" },
    { name: "Winners", href: "/winners" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About", href: "/about" },
  ]

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const handleCreateEventClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isAuthenticated) {
      router.push("/dashboard/events/new")
    } else {
      setIsAuthModalOpen(true)
    }
  }

  return (
    <>
      {/* Floating Pill Navbar */}
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:px-6 md:top-6 transition-all duration-300",
          scrolled && "top-3 md:top-4"
        )}
      >
        <nav className="pointer-events-auto relative z-10 flex w-full max-w-4xl items-center justify-between">
          {/* Brand Pill */}
          <Link
            href="/"
            className="flex h-12 items-center gap-2.5 rounded-full border border-white/[0.06] bg-[#07090f]/95 px-4 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 hover:border-[#C9A84C]/20 hover:bg-[#0a0c14]"
          >
            <BrandLogo
              size="sm"
              showName
              showSubtitle={false}
              variant="dark"
              priority
            />
          </Link>

          {/* Desktop Navigation Links Pill */}
          <div className="hidden h-12 items-center rounded-full border border-white/[0.06] bg-[#07090f]/95 px-2 shadow-2xl shadow-black/60 backdrop-blur-xl md:flex">
            {navLinks.map((link, i) => {
              const active = isActive(link.href)
              return (
                <React.Fragment key={link.href}>
                  {i > 0 && (
                    <span className="h-3.5 w-px bg-white/[0.08]" />
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      "relative px-3.5 text-sm font-medium transition-all duration-150 ease-out rounded-full py-1.5",
                      active
                        ? "text-[#C9A84C] font-bold"
                        : "text-white/60 hover:text-white/90"
                    )}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute inset-x-2 bottom-0.5 h-px rounded-full bg-[#C9A84C]/60" />
                    )}
                  </Link>
                </React.Fragment>
              )
            })}
          </div>

          {/* Desktop Action Pills */}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex h-12 items-center gap-1.5 rounded-full border border-white/[0.06] bg-[#07090f]/95 px-4 text-xs font-bold text-[#C9A84C] shadow-2xl shadow-black/60 backdrop-blur-xl hover:border-[#C9A84C]/20 hover:bg-[#0a0c14] transition-all"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/dashboard/events"
                  className="flex h-12 items-center rounded-full border border-white/[0.06] bg-[#07090f]/95 px-3.5 text-xs font-bold text-slate-300 shadow-2xl shadow-black/60 backdrop-blur-xl hover:border-[#C9A84C]/20 hover:bg-[#0a0c14] hover:text-white transition-all"
                >
                  <span>Events</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-[#07090f]/95 text-slate-400 hover:text-rose-400 shadow-2xl shadow-black/60 backdrop-blur-xl hover:bg-[#0a0c14] cursor-pointer transition-all"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-12 items-center rounded-full border border-white/[0.06] bg-[#07090f]/95 px-5 text-sm font-medium text-white/60 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-[#0a0c14] hover:text-white"
              >
                Login
              </Link>
            )}

            {/* Gold CTA */}
            <button
              onClick={handleCreateEventClick}
              className="cursor-pointer"
            >
              <div className="relative flex h-12 items-center gap-1.5 overflow-hidden rounded-full bg-[#C9A84C] px-5 text-sm font-extrabold text-[#0a0c14] shadow-lg shadow-[#C9A84C]/25 transition-all duration-200 hover:bg-[#D4B86A] hover:shadow-xl hover:shadow-[#C9A84C]/35 hover:-translate-y-0.5 btn-shimmer">
                <span>Create an Event</span>
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </button>
          </div>

          {/* Mobile Hamburger Pill */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-[#07090f]/95 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all hover:border-[#C9A84C]/20 hover:bg-[#0a0c14] md:hidden cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-white" />
            ) : (
              <Menu className="h-5 w-5 text-white" />
            )}
          </button>
        </nav>
      </header>

      {/* Mobile Fullscreen Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#050608]/98 backdrop-blur-2xl md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col pt-24 px-6 pb-8 h-full">
            <div className="space-y-1 flex-1">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-4 text-lg font-semibold rounded-2xl transition-all",
                      active
                        ? "text-[#C9A84C] font-bold bg-[#C9A84C]/[0.06] border border-[#C9A84C]/10"
                        : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className={cn("h-4 w-4", active ? "text-[#C9A84C]/50" : "text-white/20")} />
                  </Link>
                )
              })}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/[0.06]">
              <button
                onClick={handleCreateEventClick}
                className="w-full cursor-pointer"
              >
                <div className="relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[#C9A84C] font-extrabold text-[#0a0c14] text-sm shadow-lg shadow-[#C9A84C]/25 btn-shimmer">
                  <span>Create an Event</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>

              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Link href="/dashboard" className="flex-1">
                    <div className="flex h-14 w-full items-center justify-center rounded-full border border-[#C9A84C]/15 bg-[#C9A84C]/[0.06] text-sm font-semibold text-[#C9A84C]">
                      Dashboard
                    </div>
                  </Link>
                  <Link href="/dashboard/events" className="flex-1">
                    <div className="flex h-14 w-full items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-slate-200">
                      Events
                    </div>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex h-14 px-5 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-rose-400"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block">
                  <div className="flex h-14 w-full items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-white/70">
                    Organizer Login
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal triggered when unauthenticated user clicks Create an Event */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo="/dashboard/events/new"
      />
    </>
  )
}
