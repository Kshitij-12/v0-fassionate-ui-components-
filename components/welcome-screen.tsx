"use client"

import { useEffect, useRef } from "react"

export function WelcomeScreen({ onEnter, onSignup }: { onEnter: () => void; onSignup: () => void }) {
  const root = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return

    el.classList.add("float-up")
  }, [])

  return (
    <div
      ref={root}
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-black px-6"
    >
      {/* atmosphere layers with neon gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-[20%] h-[560px] w-[560px] rounded-full bg-gradient-to-r from-[rgba(139,92,246,0.85)] via-[rgba(255,59,134,0.75)] to-[rgba(255,59,134,0.55)] opacity-30 blur-[120px] soft-glow" />
        <div className="absolute -bottom-28 right-[12%] h-[420px] w-[420px] rounded-full bg-gradient-to-r from-[rgba(16,185,129,0.9)] to-[rgba(139,92,246,0.25)] opacity-18 blur-[160px]" />
      </div>

      {/* content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 w-full px-4">
        <h1
          className="text-[14vw] font-extrabold leading-none text-white"
          style={{ animation: "float-up 0.8s ease-out" }}
        >
          FASSIONATE
        </h1>

        <p
          className="text-purple-400 tracking-widest text-xs font-semibold"
          style={{ animation: "float-up 0.8s ease-out 0.15s both" }}
        >
          FASHION REDEFINED?
        </p>

        <div className="mt-10 w-full max-w-xs space-y-4">
          <button
            onClick={onEnter}
            className="w-full h-14 rounded-none text-black text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] transition-all glow-neon-pink"
            style={{ animation: "float-up 0.8s ease-out 0.45s both" }}
            aria-label="Enter the Drip"
          >
            Enter the Drip
          </button>

          <button
            onClick={onSignup}
            className="w-full h-12 border border-white/10 text-white/80 text-xs tracking-widest uppercase hover:border-white/40 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all"
            style={{ animation: "float-up 0.8s ease-out 0.6s both" }}
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}
