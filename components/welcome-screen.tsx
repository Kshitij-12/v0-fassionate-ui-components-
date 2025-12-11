"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  onEnter: () => void
  onSignup: () => void
}

export function WelcomeScreen({ onEnter, onSignup }: Props) {
  const root = useRef<HTMLDivElement | null>(null)
  const [orbStyle, setOrbStyle] = useState<React.CSSProperties>({
    position: "fixed",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "60vmax",
    height: "60vmax",
    borderRadius: "50%",
    filter: "blur(120px)",
    zIndex: 0,
    pointerEvents: "none",
    opacity: 0.92,
    mixBlendMode: "screen",
    background:
      "radial-gradient(circle at 30% 30%, rgba(139,92,246,0.95) 0%, rgba(255,59,134,0.85) 40%, rgba(0,0,0,0) 75%)",
  })

  useEffect(() => {
    const el = root.current
    if (!el) return
    el.classList.add("float-up")

    function computeOrbStyle() {
      const w = window.innerWidth
      const h = window.innerHeight

      let width = Math.max(w * 0.9, Math.min(Math.max(w, h) * 0.6, 2000))
      let topPct = 0.5

      if (w <= 480) {
        width = Math.max(w * 1.2, 600)
        topPct = 0.42
      } else if (w <= 768) {
        width = Math.max(w * 1.0, 700)
        topPct = 0.44
      } else if (w <= 1024) {
        width = Math.max(Math.min(h, w) * 0.7, 800)
        topPct = 0.46
      } else {
        width = Math.min(Math.max(w, h) * 0.55, 1600)
        topPct = 0.5
      }

      const px = Math.round(width)

      setOrbStyle((prev) => ({
        ...prev,
        width: `${px}px`,
        height: `${px}px`,
        left: "50%",
        top: `${topPct * 100}%`,
        transform: "translate(-50%, -50%)",
      }))
    }

    computeOrbStyle()
    window.addEventListener("resize", computeOrbStyle)
    return () => window.removeEventListener("resize", computeOrbStyle)
  }, [])

  return (
    <div
      ref={root}
      className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-black px-6"
    >
      {/* Programmatic orb: inline styles guarantee specificity and consistency */}
      <div aria-hidden style={{ pointerEvents: "none" }}>
        <div
          data-orb="fassionate-orb"
          style={orbStyle}
        />
        {/* secondary green accent */}
        <div
          data-orb-accent="fassionate-orb-accent"
          style={{
            position: "fixed",
            right: "6%",
            bottom: "-10%",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            filter: "blur(160px)",
            opacity: 0.2,
            pointerEvents: "none",
            zIndex: 0,
            background:
              "radial-gradient(circle at center, rgba(16,185,129,0.9) 0%, rgba(139,92,246,0.25) 70%)",
          }}
        />
      </div>

      {/* CONTENT */}
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
