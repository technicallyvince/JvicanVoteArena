"use client"

import React, { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

const SPACING = 28
const BASE_RADIUS = 5.5
const MOUSE_RADIUS = 300
const TRAIL_LENGTH = 350
const TRAIL_RADIUS = 200
const TRAIL_FADE_MS = 1200
const RANDOM_TIME = 0.6
const COLLECT_TIME = 1.1
const SHAPE_HOLD_TIME = 1.2
const GRAY_DISPERSE_TIME = 0.9
const TOTAL_CYCLE_TIME = RANDOM_TIME + COLLECT_TIME + SHAPE_HOLD_TIME + GRAY_DISPERSE_TIME
const TOTAL_SHAPES = 4

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const smoothstep = (e0: number, e1: number, v: number) => {
  const t = clamp01((v - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

const getStarStrength = (x: number, y: number, width: number, height: number) => {
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * 0.32
  const nx = (x - cx) / scale
  const ny = (y - cy) / scale
  const r = Math.sqrt(nx * nx + ny * ny)
  const angle = Math.atan2(ny, nx)
  const spikes = 5
  const star = Math.cos(spikes * angle)
  const radius = 0.55 + 0.25 * star
  return clamp01(1 - smoothstep(radius - 0.05, radius + 0.05, r))
}

const getCircleRingStrength = (x: number, y: number, width: number, height: number) => {
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * 0.32
  const r = Math.sqrt(((x - cx) / scale) ** 2 + ((y - cy) / scale) ** 2)
  return clamp01(1 - smoothstep(0.12, 0.18, Math.abs(r - 0.72)))
}

const getPlusStrength = (x: number, y: number, width: number, height: number) => {
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * 0.3
  const rx = (x - cx) / scale
  const ry = (y - cy) / scale
  const thickness = 0.2
  const length = 0.8
  const vertical = Math.abs(rx) < thickness && Math.abs(ry) < length
  const horizontal = Math.abs(ry) < thickness && Math.abs(rx) < length
  const d = Math.min(
    Math.max(Math.abs(rx) - thickness, Math.abs(ry) - length),
    Math.max(Math.abs(ry) - thickness, Math.abs(rx) - length)
  )
  return vertical || horizontal ? 1 : clamp01(1 - smoothstep(0, 0.06, d))
}

const getTriangleStrength = (x: number, y: number, time: number, width: number, height: number) => {
  const cx = width / 2
  const cy = height / 2
  const scale = Math.min(width, height) * 0.35
  const rotation = Math.sin(time * 0.3) * 0.12
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const rx = ((x - cx) * cos - (y - cy) * sin) / scale
  const ry = ((x - cx) * sin + (y - cy) * cos) / scale
  const a = Math.abs(rx) * 0.9 + ry * 0.52
  const b = -ry * 0.95
  return clamp01(1 - smoothstep(0.38, 0.48, Math.max(a, b)))
}

const getRawShapeStrength = (shapeIndex: number, x: number, y: number, time: number, width: number, height: number) => {
  const i = shapeIndex % TOTAL_SHAPES
  if (i === 0) return getStarStrength(x, y, width, height)
  if (i === 1) return getCircleRingStrength(x, y, width, height)
  if (i === 2) return getPlusStrength(x, y, width, height)
  return getTriangleStrength(x, y, time, width, height)
}

interface DottedGridProps {
  className?: string
  style?: React.CSSProperties
  paused?: boolean
}

export function DottedGrid({ className, style, paused = false }: DottedGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const patternRef = useRef({
    currentShapeIndex: 0,
    transitionStartTime: null as number | null,
  })
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    trail: [] as { x: number; y: number; t: number }[],
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const surface = canvas.parentElement
    if (!surface) return

    let isStatic = paused
    let width = 0
    let height = 0
    let dpr = 1
    let animationId = 0
    let dots: Array<{
      x: number
      y: number
      phase: number
      speed: number
      randomOffset: number
      currentShapeStrength: number
      currentRandomStrength: number
      currentMouseStrength: number
      currentTrailStrength: number
      currentGrayDisperseStrength: number
    }> = []

    const createDots = () => {
      dots = []
      // Use responsive spacing to keep dot count efficient and fluid on mobile & desktop
      const effectiveSpacing = Math.max(34, SPACING * (width < 768 ? 1.4 : 1.1))
      for (let y = effectiveSpacing / 2; y < height; y += effectiveSpacing) {
        for (let x = effectiveSpacing / 2; x < width; x += effectiveSpacing) {
          dots.push({
            x,
            y,
            phase: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 1.0,
            randomOffset: Math.random() * 10,
            currentShapeStrength: 0,
            currentRandomStrength: 1,
            currentMouseStrength: 0,
            currentTrailStrength: 0,
            currentGrayDisperseStrength: 0,
          })
        }
      }
    }

    const resize = () => {
      const rect = surface.getBoundingClientRect()
      width = Math.max(1, rect.width)
      height = Math.max(1, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      createDots()
    }

    const handlePointerMove = (e: MouseEvent) => {
      if (isStatic) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      mouseRef.current.targetX = x
      mouseRef.current.targetY = y
      mouseRef.current.active = true
      mouseRef.current.trail.push({ x, y, t: performance.now() })
      if (mouseRef.current.trail.length > TRAIL_LENGTH) {
        mouseRef.current.trail.shift()
      }
    }

    const handlePointerLeave = () => {
      mouseRef.current.active = false
    }

    const handleClick = () => {
      patternRef.current.currentShapeIndex = (patternRef.current.currentShapeIndex + 1) % TOTAL_SHAPES
      patternRef.current.transitionStartTime = isStatic ? null : performance.now() * 0.001
    }

    const getShapeData = (x: number, y: number, time: number) => {
      const { currentShapeIndex, transitionStartTime } = patternRef.current
      if (transitionStartTime === null) {
        return {
          shapeStrength: getRawShapeStrength(currentShapeIndex, x, y, time, width, height),
          randomStrength: 0,
          grayDisperseStrength: 0,
        }
      }

      const cyclePosition = time - transitionStartTime
      if (cyclePosition >= TOTAL_CYCLE_TIME) {
        patternRef.current.transitionStartTime = null
        return {
          shapeStrength: getRawShapeStrength(currentShapeIndex, x, y, time, width, height),
          randomStrength: 0,
          grayDisperseStrength: 0,
        }
      }

      const shapeStrength = getRawShapeStrength(currentShapeIndex, x, y, time, width, height)
      if (cyclePosition < RANDOM_TIME) {
        return { shapeStrength: 0, randomStrength: 1, grayDisperseStrength: 0.35 }
      }
      if (cyclePosition < RANDOM_TIME + COLLECT_TIME) {
        const eased = smoothstep(0, 1, (cyclePosition - RANDOM_TIME) / COLLECT_TIME)
        return {
          shapeStrength: shapeStrength * eased,
          randomStrength: 1 - eased,
          grayDisperseStrength: 0.35 * (1 - eased),
        }
      }
      if (cyclePosition < RANDOM_TIME + COLLECT_TIME + SHAPE_HOLD_TIME) {
        return { shapeStrength, randomStrength: 0, grayDisperseStrength: 0 }
      }
      const eased = smoothstep(
        0,
        1,
        (cyclePosition - RANDOM_TIME - COLLECT_TIME - SHAPE_HOLD_TIME) / GRAY_DISPERSE_TIME
      )
      return {
        shapeStrength: shapeStrength * (1 - eased),
        randomStrength: eased,
        grayDisperseStrength: eased,
      }
    }

    const drawDot = (
      x: number,
      y: number,
      radius: number,
      brightness: number,
      trailStrength: number,
      mouseStrength: number
    ) => {
      const alpha = clamp01(0.15 + brightness * 0.75 + trailStrength * 0.3 + mouseStrength * 0.2)
      const isAmber = brightness > 0.4 || trailStrength > 0.3
      ctx.beginPath()
      if (isAmber) {
        ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`
      } else {
        ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.4})`
      }
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const animate = (ms: number) => {
      const time = ms * 0.001
      const mouse = mouseRef.current
      const now = performance.now()
      mouse.trail = mouse.trail.filter((point) => now - point.t < TRAIL_FADE_MS)

      mouse.x = lerp(mouse.x, mouse.targetX, 0.12)
      mouse.y = lerp(mouse.y, mouse.targetY, 0.12)

      ctx.clearRect(0, 0, width, height)

      for (const dot of dots) {
        const { shapeStrength, randomStrength, grayDisperseStrength } = getShapeData(dot.x, dot.y, time)
        dot.currentShapeStrength = isStatic ? shapeStrength : lerp(dot.currentShapeStrength, shapeStrength, 0.12)
        dot.currentRandomStrength = isStatic ? 0 : lerp(dot.currentRandomStrength, randomStrength, 0.14)
        dot.currentGrayDisperseStrength = lerp(dot.currentGrayDisperseStrength, grayDisperseStrength, 0.14)

        let targetMouseStrength = 0
        if (mouse.active) {
          const dx = dot.x - mouse.x
          const dy = dot.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS) {
            const norm = dist / MOUSE_RADIUS
            targetMouseStrength = (1 - norm) * (1 - norm)
          }
        }
        dot.currentMouseStrength = isStatic ? 0 : lerp(dot.currentMouseStrength, targetMouseStrength, 0.12)

        let targetTrailStrength = 0
        for (let i = 0; i < mouse.trail.length; i++) {
          const pt = mouse.trail[i]
          const age = (now - pt.t) / TRAIL_FADE_MS
          if (age >= 1) continue
          const ageFade = (1 - age) * (1 - age)
          const positionFade = (i + 1) / mouse.trail.length
          const fade = ageFade * positionFade
          const dx = dot.x - pt.x
          const dy = dot.y - pt.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < TRAIL_RADIUS) {
            const proximity = 1 - smoothstep(0, 1, dist / TRAIL_RADIUS)
            targetTrailStrength = Math.max(targetTrailStrength, proximity * fade)
          }
        }
        dot.currentTrailStrength = isStatic ? 0 : lerp(dot.currentTrailStrength, targetTrailStrength, 0.08)

        const randomBlink = Math.sin(
          time * (1.2 + dot.speed * 1.2) + dot.phase + dot.randomOffset + dot.x * 0.02 + dot.y * 0.016
        ) ** 2
        const softPulse = Math.sin(time * 1.4 + dot.phase + dot.x * 0.015) ** 2
        const stableBrightness = clamp01(0.15 + dot.currentShapeStrength * 0.85 + softPulse * 0.05)
        const randomBrightness = clamp01(0.12 + randomBlink * 0.25)
        const brightness = lerp(stableBrightness, randomBrightness, dot.currentRandomStrength)

        const stableRadius = BASE_RADIUS + dot.currentShapeStrength * 1.5
        const randomRadius = BASE_RADIUS + randomBlink * 0.5
        const radius = lerp(stableRadius, randomRadius, dot.currentRandomStrength)

        drawDot(dot.x, dot.y, radius, brightness, dot.currentTrailStrength, dot.currentMouseStrength)
      }

      if (!isStatic) animationId = requestAnimationFrame(animate)
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(surface)

    window.addEventListener("pointermove", handlePointerMove)
    surface.addEventListener("pointerleave", handlePointerLeave)
    surface.addEventListener("click", handleClick)

    if (!isStatic) animationId = requestAnimationFrame(animate)

    return () => {
      observer.disconnect()
      window.removeEventListener("pointermove", handlePointerMove)
      surface.removeEventListener("pointerleave", handlePointerLeave)
      surface.removeEventListener("click", handleClick)
      cancelAnimationFrame(animationId)
    }
  }, [paused])

  return (
    <div
      aria-label="Interactive interactive dotted matrix"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={style}
    >
      <canvas ref={canvasRef} aria-hidden="true" className="block h-full w-full" />
    </div>
  )
}
