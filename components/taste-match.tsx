"use client"

import { useEffect, useState, useRef } from "react"
import { computeCosinePercent } from "../lib/match"
import { cn } from "../lib/utils"

type MatchState = "reading" | "revealing" | "locked"

interface TasteMatchProps {
  v1: number[]
  v2: number[]
  onLocked?: (pct: number) => void
  showProfiles?: {
    nameA?: string
    nameB?: string
    imgA?: string
    imgB?: string
  }
}

export function TasteMatch({
  v1,
  v2,
  onLocked,
  showProfiles,
}: TasteMatchProps) {
  const [state, setState] = useState<MatchState>("reading")
  const [displayPercent, setDisplayPercent] = useState(0)
  const finalPercent = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Compute final percentage
  useEffect(() => {
    finalPercent.current = computeCosinePercent(v1, v2)
  }, [v1, v2])

  // State machine: reading → revealing → locked
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setState("revealing")
    }, 500) // Brief reading state

    return () => clearTimeout(timer1)
  }, [])

  // Animate percentage with easing
  useEffect(() => {
    if (state !== "revealing") return

    const duration = 2000 // 2 seconds
    const startPercent = 20 // Start from low value
    const endPercent = finalPercent.current
    startTimeRef.current = null

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      const currentPercent = Math.round(
        startPercent + (endPercent - startPercent) * eased
      )
      setDisplayPercent(currentPercent)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        // Ensure final value is set
        setDisplayPercent(endPercent)
        // Animation complete, move to locked state
        setTimeout(() => {
          setState("locked")
          if (onLocked) {
            onLocked(endPercent)
          }
        }, 200)
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state, onLocked])

  const isLocked = state === "locked" && finalPercent.current >= 90
  const nameA = showProfiles?.nameA ?? "User A"
  const nameB = showProfiles?.nameB ?? "User B"
  const imgA = showProfiles?.imgA
  const imgB = showProfiles?.imgB

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Avatar Row */}
        <div className="flex items-center justify-center gap-8">
          {/* Avatar A */}
          <div className="flex flex-col items-center gap-2">
            {imgA ? (
              <img
                src={imgA}
                alt={nameA}
                className="w-20 h-20 rounded-full object-cover border-2 border-purple-500/50 motion-safe:transition-all motion-safe:duration-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl motion-safe:shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                {nameA[0].toUpperCase()}
              </div>
            )}
            <span className="text-white/80 text-sm font-medium">{nameA}</span>
          </div>

          {/* VS Indicator */}
          <div className="text-purple-400 text-lg font-semibold">vs</div>

          {/* Avatar B */}
          <div className="flex flex-col items-center gap-2">
            {imgB ? (
              <img
                src={imgB}
                alt={nameB}
                className="w-20 h-20 rounded-full object-cover border-2 border-pink-500/50 motion-safe:transition-all motion-safe:duration-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl motion-safe:shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                {nameB[0].toUpperCase()}
              </div>
            )}
            <span className="text-white/80 text-sm font-medium">{nameB}</span>
          </div>
        </div>

        {/* Center Percentage Display */}
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "text-8xl font-extrabold transition-all duration-700 ease-out",
              state === "revealing" && "motion-safe:scale-pop",
              isLocked
                ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 motion-safe:drop-shadow-[0_0_30px_rgba(139,92,246,0.6),0_0_60px_rgba(236,72,153,0.4)] motion-safe:glow-pulse"
                : "text-white"
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {displayPercent}%
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md h-3 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
            <div
              className={cn(
                "h-full rounded-full transition-colors duration-700 ease-out",
                isLocked
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 motion-safe:shadow-[0_0_20px_rgba(236,72,153,0.5),0_0_40px_rgba(236,72,153,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  : "bg-gradient-to-r from-purple-600 to-pink-600"
              )}
              style={{
                width: `${displayPercent}%`,
                transition: "width 0.1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>

          {/* Status Message */}
          <div className="h-12 flex items-center justify-center">
            {state === "reading" && (
              <p className="text-white/60 text-sm">Analyzing taste profiles...</p>
            )}
            {state === "revealing" && (
              <p className="text-white/60 text-sm animate-pulse">
                Calculating match...
              </p>
            )}
            {state === "locked" && (
              <p
                className={cn(
                  "text-lg font-semibold transition-all duration-700 ease-out",
                  isLocked
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 motion-safe:drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                    : "text-white/80"
                )}
              >
                {isLocked
                  ? "Vibe locked — Fashion Twin!"
                  : `Taste synced at ${finalPercent.current}%`}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

