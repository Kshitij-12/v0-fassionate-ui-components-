"use client"

import { useState } from "react"
import { Button } from "./ui/button"

const aesthetics = [
  "DRIPLORDS",
  "THRIFTGANG",
  "GYMBRO",
  "DELULUS",
  "SLEAZERS",
  "BOWBADDIES",
  "TECHNO",
  "Y2K",
  "NERDCORE",
  "AFTERGLOW",
  "OLDMONEY",
  "ANIMEDRIP",
]

export function AestheticSelectionScreen({ onComplete }: { onComplete: () => void }) {
  const [selected, setSelected] = useState<string[]>([])

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      setSelected(selected.filter((t) => t !== tag))
    } else if (selected.length < 2) {
      setSelected([...selected, tag])
    }
  }

  return (
    <div className="min-h-screen bg-black px-6 pt-16 pb-24 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/3 h-[400px] w-[400px] bg-purple-600/20 blur-[140px] soft-glow" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] bg-pink-500/20 blur-[120px] soft-glow" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <h2 className="text-4xl font-black text-white mb-2 float-up">Choose Your Code</h2>
        <p className="text-white/60 mb-10">Pick up to 2 identities that define how you move.</p>

        <div className="grid grid-cols-2 gap-5">
          {aesthetics.map((tag, idx) => {
            const active = selected.includes(tag)

            return (
              <button
                key={tag}
                onClick={() => toggle(tag)}
                className={`relative h-16 flex items-center justify-center text-sm font-bold tracking-widest uppercase transition-all scale-pop
                ${
                  active
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-black glow-neon-pink"
                    : "border border-white/20 text-white/60 hover:border-white/60 hover:text-white hover:glow-neon-purple"
                }`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {tag}
                {active && <span className="absolute right-3 top-2 text-xs font-black">✓</span>}
              </button>
            )
          })}
        </div>

        <p className="mt-10 text-center text-white/50 text-sm tracking-wide">{selected.length}/2 identities bound</p>

        <div className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-xl bg-black/60">
          <Button
            disabled={selected.length === 0}
            onClick={onComplete}
            className="w-full h-14 rounded-none tracking-widest uppercase font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 disabled:opacity-40 text-black hover:glow-neon-pink transition-all"
          >
            Lock My Taste
          </Button>
        </div>
      </div>
    </div>
  )
}
