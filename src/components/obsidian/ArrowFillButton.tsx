"use client"

import React from "react"
import { cn } from "@/lib/utils"
import "./arrow-fill-button.css"

interface ArrowFillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  className?: string
  bgColor?: string
  textColor?: string
  fillBgColor?: string
  fillTextColor?: string
  hoverFillBgColor?: string
  hoverFillTextColor?: string
  arrowColor?: string
  hoverArrowColor?: string
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
}

export function ArrowFillButton({
  children = "Explore Events",
  className = "",
  bgColor = "#ff5500",
  textColor = "#ffffff",
  fillBgColor = "#ffffff",
  fillTextColor = "#090d16",
  hoverFillBgColor = "#ff661a",
  hoverFillTextColor = "#ffffff",
  arrowColor,
  hoverArrowColor,
  style,
  ...props
}: ArrowFillButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn("obsidian-arrow-fill-btn", className)}
      style={{
        ["--btn-bg" as string]: bgColor,
        ["--btn-text" as string]: textColor,
        ["--btn-fill-bg" as string]: fillBgColor,
        ["--btn-fill-text" as string]: fillTextColor,
        ["--btn-fill-bg-hover" as string]: hoverFillBgColor,
        ["--btn-fill-text-hover" as string]: hoverFillTextColor,
        ["--btn-arrow" as string]: arrowColor || fillTextColor,
        ["--btn-arrow-hover" as string]: hoverArrowColor || hoverFillTextColor,
        ...style,
      }}
    >
      <span className="obsidian-arrow-fill-btn__text">{children}</span>
      <div aria-hidden="true" className="obsidian-arrow-fill-btn__circle">
        <span>{children}</span>
        <div className="obsidian-arrow-fill-btn__circle-text">
          <svg
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="obsidian-arrow-fill-btn__icon"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="obsidian-arrow-fill-btn__path"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.82475e-07 5.625L7.625 5.625L4.125 9.125L5 10L10 5L5 -4.37114e-07L4.125 0.874999L7.625 4.375L4.91753e-07 4.375L3.82475e-07 5.625Z"
              className="obsidian-arrow-fill-btn__path"
            />
          </svg>
        </div>
      </div>
    </button>
  )
}
