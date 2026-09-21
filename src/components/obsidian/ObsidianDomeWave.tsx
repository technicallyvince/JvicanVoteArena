"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface ObsidianDomeWaveProps {
  className?: string
  glowColor?: string
}

export function ObsidianDomeWave({
  className,
  glowColor = "#ff5500", // Warm Electric Ember / Orange
}: ObsidianDomeWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1))
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1))

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1)
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1)
    }

    window.addEventListener("resize", handleResize)

    let time = 0

    const render = () => {
      time += 0.015
      ctx.clearRect(0, 0, width, height)

      const cols = 52
      const rows = 22
      const spacingX = width / (cols + 2)
      const spacingY = (height * 0.7) / (rows + 1)
      const centerX = width / 2
      const centerY = height * 0.95

      const domeRadiusX = width * 0.48
      const domeRadiusY = height * 0.65

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = (c + 1.5) * spacingX
          const baseY = (r + 1.5) * spacingY + height * 0.28

          // Normalize distances relative to dome center
          const dx = (x - centerX) / domeRadiusX
          const dy = (baseY - centerY) / domeRadiusY
          const distSq = dx * dx + dy * dy

          if (distSq > 1.2) continue // Outside dome contour

          // Curvature elevation (dome hemisphere equation)
          const elevation = Math.sqrt(Math.max(0, 1 - Math.min(1, distSq)))
          
          // Wave pulse ripple
          const wave = Math.sin(time * 2.2 - Math.sqrt(distSq) * 6.5) * 0.5 + 0.5
          
          // Screen Y projection
          const y = baseY - elevation * (height * 0.26) + wave * 6

          // Perspective scaling & opacity
          const size = (4.5 + elevation * 6.5 + wave * 2.5) * (window.devicePixelRatio || 1) * 0.5
          const alpha = (0.08 + elevation * 0.75 + wave * 0.25) * Math.max(0, 1 - distSq * 0.8)

          if (alpha <= 0.01) continue

          ctx.save()
          ctx.beginPath()

          // Draw rounded pill dot
          const rx = size * 1.3
          const ry = size * 0.85

          // Color gradient for the illuminated dome matching the Ember Orange aesthetic
          if (elevation > 0.4) {
            // Bright illuminated crest: vibrant ember / fiery warm orange
            ctx.fillStyle = `rgba(255, 107, 0, ${alpha})`
            ctx.shadowColor = "rgba(255, 77, 0, 0.75)"
            ctx.shadowBlur = elevation * 18
          } else {
            // Deep subtle slate/charcoal transition
            ctx.fillStyle = `rgba(163, 163, 163, ${alpha * 0.35})`
            ctx.shadowBlur = 0
          }

          ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [glowColor])

  return (
    <div className={cn("pointer-events-none relative w-full overflow-hidden", className)}>
      <canvas ref={canvasRef} className="h-full w-full" />
      
      {/* Radial soft edge blending */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#080808] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#080808] to-transparent pointer-events-none" />
    </div>
  )
}
