"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronRight, ArrowUpRight, LogOut, User } from "lucide-react"
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

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
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
      router.push("/create-event")
    } else {
      setIsAuthModalOpen(true)
    }
  }

  return (
    <>
      {/* Floating Pill Navbar — RareUI-inspired */}
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
            className="flex h-12 items-center gap-2.5 rounded-full border border-white/[0.06] bg-neutral-900 px-4 shadow-lg shadow-black/10 transition-colors hover:bg-neutral-800"
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
          <div className="hidden h-12 items-center rounded-full border border-white/[0.06] bg-neutral-900 px-2 shadow-lg shadow-black/10 md:flex">
            {navLinks.map((link, i) => {
              const active = isActive(link.href)
              return (
                <React.Fragment key={link.href}>
                  {i > 0 && (
                    <span className="h-4 w-px bg-white/[0.12]" />
                  )}
                  <Link
                    href={link.href}
                    className={cn(
                      "px-3.5 text-sm font-medium transition-colors duration-150 ease-out",
                      active
                        ? "text-[#ff5500] font-semibold"
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    {link.name}
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
                  className="flex h-12 items-center gap-1.5 rounded-full border border-white/[0.06] bg-neutral-900 px-4 text-xs font-semibold text-[#ff5500] shadow-lg shadow-black/10 hover:bg-neutral-800"
                >
                  <User className="h-3.5 w-3.5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-neutral-900 text-slate-400 hover:text-white shadow-lg shadow-black/10 hover:bg-neutral-800 cursor-pointer"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-12 items-center rounded-full border border-white/[0.06] bg-neutral-900 px-5 text-sm font-medium text-white/70 shadow-lg shadow-black/10 transition-colors duration-150 ease-out hover:bg-neutral-800 hover:text-white"
              >
                Login
              </Link>
            )}

            <button
              onClick={handleCreateEventClick}
              className="cursor-pointer"
            >
              <div className="flex h-12 items-center gap-1.5 rounded-full bg-[#ff5500] px-5 text-sm font-bold text-white shadow-lg shadow-[#ff5500]/25 transition-colors duration-150 ease-out hover:bg-[#ff661a]">
                <span>Create Event</span>
                <ArrowUpRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Mobile Hamburger Pill */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.06] bg-neutral-900 shadow-lg shadow-black/10 transition-colors hover:bg-neutral-800 md:hidden cursor-pointer"
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
        <div className="fixed inset-0 z-40 bg-neutral-900/98 backdrop-blur-xl md:hidden animate-in fade-in duration-200">
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
                        ? "text-amber-400 font-bold bg-white/[0.05]"
                        : "text-white/70 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="h-4 w-4 text-white/30" />
                  </Link>
                )
              })}
            </div>

            <div className="space-y-3 pt-6 border-t border-white/[0.08]">
              <button
                onClick={handleCreateEventClick}
                className="w-full cursor-pointer"
              >
                <div className="flex h-14 w-full items-center justify-center gap-2 rounded-full bg-amber-500 font-bold text-neutral-900 text-sm shadow-lg shadow-amber-500/20">
                  <span>Create Event</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>

              {isAuthenticated ? (
                <div className="flex gap-2">
                  <Link href="/dashboard" className="flex-1">
                    <div className="flex h-14 w-full items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-sm font-semibold text-amber-400">
                      Dashboard
                    </div>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="flex h-14 px-6 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-sm font-semibold text-red-400"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block">
                  <div className="flex h-14 w-full items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.05] text-sm font-semibold text-white/80">
                    Organizer Login
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal triggered when unauthenticated user clicks Create Event */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        redirectTo="/create-event"
      />
    </>
  )
}
