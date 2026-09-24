"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface GooeyNavItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface GooeyNavProps {
  items: (GooeyNavItem | string)[];
  onChange?: (value: string | number) => void;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function GooeyNav({
  items,
  onChange,
  size = "md",
  className,
}: GooeyNavProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  const normalizedItems: GooeyNavItem[] = items.map((item) =>
    typeof item === "string" ? { label: item } : item
  );

  const getActiveIndex = () => {
    return normalizedItems.findIndex((item) => {
      if (!item.href) return false;
      if (item.href === "/" && pathname === "/") return true;
      if (item.href !== "/" && pathname.startsWith(item.href)) return true;
      return false;
    });
  };

  const [activeIndex, setActiveIndex] = useState(getActiveIndex);

  useEffect(() => {
    const idx = getActiveIndex();
    if (idx !== -1) {
      setActiveIndex(idx);
    }
  }, [pathname, items]);

  // Update sliding pill position
  useEffect(() => {
    if (!navRef.current) return;
    const activeEl = navRef.current.children[activeIndex] as HTMLElement;
    if (activeEl) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [activeIndex, items]);

  const sizeClasses = {
    xs: "h-9 text-xs px-2.5 py-1 gap-1",
    sm: "h-10 text-xs px-3 py-1.5 gap-1.5",
    md: "h-11 text-xs sm:text-sm px-4 py-2 gap-2",
    lg: "h-12 text-sm sm:text-base px-5 py-2.5 gap-2.5",
  }[size];

  return (
    <div
      className={cn(
        "relative flex items-center rounded-full border border-white/[0.08] bg-[#080808]/95 p-1 shadow-2xl shadow-black/60 backdrop-blur-xl",
        className
      )}
    >
      {/* Sliding indicator with smooth cubic bezier */}
      <span
        className="absolute top-1 bottom-1 rounded-full bg-gradient-to-r from-[#C9A84C]/25 to-[#C9A84C]/15 border border-[#C9A84C]/40 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none"
        style={{
          transform: `translateX(${indicatorStyle.left}px)`,
          width: `${indicatorStyle.width}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {/* Nav Items */}
      <div ref={navRef} className="flex items-center gap-1 w-full">
        {normalizedItems.map((item, index) => {
          const isActive = index === activeIndex;

          const content = (
            <>
              {item.icon && (
                <span
                  className={cn(
                    "transition-colors shrink-0",
                    isActive ? "text-[#C9A84C]" : "text-white/50 group-hover:text-white/80"
                  )}
                >
                  {item.icon}
                </span>
              )}
              <span className="whitespace-nowrap font-medium tracking-normal select-none">
                {item.label}
              </span>
            </>
          );

          if (item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  setActiveIndex(index);
                  if (onChange) onChange(item.href || item.label);
                }}
                className={cn(
                  "group relative z-10 flex items-center justify-center rounded-full transition-colors whitespace-nowrap",
                  sizeClasses,
                  isActive
                    ? "font-bold text-[#C9A84C]"
                    : "text-white/60 hover:text-white/90"
                )}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                if (onChange) onChange(item.label);
              }}
              className={cn(
                "group relative z-10 flex items-center justify-center rounded-full transition-colors whitespace-nowrap cursor-pointer",
                sizeClasses,
                isActive
                  ? "font-bold text-[#C9A84C]"
                  : "text-white/60 hover:text-white/90"
              )}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
