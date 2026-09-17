"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronRight, ArrowUpRight } from "lucide-react"
import { BrandLogo } from "../ui/BrandLogo"
import { Button } from "../ui/Button"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/"

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
    { name: "Contests", href: "/contests" },
    { name: "Contestants", href: "/contestants" },
    { name: "Winners", href: "/winners" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "About", href: "/about" },
  ]

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-white/10 bg-[#090d16]/90 backdrop-blur-xl shadow-lg"
          : isHomePage
          ? "bg-transparent border-b border-white/5"
          : "border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#090d16]/90"
      )}
    >
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* JVican Vote Arena Brand Lockup */}
        <Link href="/" className="flex items-center group shrink-0">
          <BrandLogo
            size="md"
            showName
            showSubtitle={false}
            variant={isHomePage || scrolled ? "dark" : "auto"}
            priority
          />
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs lg:text-sm font-medium transition-colors duration-200",
                  active
                    ? isHomePage || scrolled
                      ? "text-amber-400 font-semibold"
                      : "text-amber-600 dark:text-amber-400 font-semibold"
                    : isHomePage || scrolled
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(
              "text-xs lg:text-sm font-medium px-3 py-2 transition-colors",
              isHomePage || scrolled
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            Login
          </Link>
          <Link href="/create-contest">
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 font-bold text-xs rounded-full px-4.5 py-2 shadow-sm shadow-amber-500/20"
            >
              <span>Create Contest</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors cursor-pointer",
              isHomePage || scrolled
                ? "border-white/15 bg-white/5 text-white hover:bg-white/10"
                : "border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            )}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Fullscreen Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#090d16] px-5 pt-4 pb-8 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1 pb-5 border-b border-slate-800/80">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-base font-semibold rounded-xl transition-all",
                    active
                      ? "text-amber-400 font-bold bg-white/5"
                      : "text-slate-200 hover:text-white hover:bg-white/5"
                  )}
                >
                  <span>{link.name}</span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              )
            })}
          </div>

          <div className="mt-5 space-y-3">
            <Link href="/create-contest" className="block">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center rounded-full font-bold text-sm gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>Create a Contest</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>

            <Link href="/login" className="block text-center">
              <Button
                variant="outline"
                size="md"
                className="w-full border-slate-700 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 justify-center text-xs font-semibold rounded-full"
              >
                Organizer Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
