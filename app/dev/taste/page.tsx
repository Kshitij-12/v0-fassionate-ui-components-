"use client"

import { TasteMatch } from "../../../components/taste-match"

export default function TasteMatchPage() {
  // SCENARIO 1 — High Match (≥90%)
  // Two vectors with strong overlap
  const highMatchV1 = [0.9, 0.8, 0.7, 0.85, 0.9, 0.75, 0.8]
  const highMatchV2 = [0.85, 0.75, 0.8, 0.9, 0.85, 0.7, 0.75]

  // SCENARIO 2 — Low Match (≤70%)
  // Two vectors with poor overlap
  const lowMatchV1 = [0.9, 0.2, 0.1, 0.8, 0.3, 0.1, 0.2]
  const lowMatchV2 = [0.1, 0.8, 0.9, 0.2, 0.1, 0.7, 0.8]

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto py-12 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Taste Match Reveal — Dev Preview
          </h1>
          <p className="text-white/60">
            Testing the taste matching system with two scenarios
          </p>
        </div>

        {/* SCENARIO 1 — High Match */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-purple-400 mb-2">
              Scenario 1: High Match (Expected ≥90%)
            </h2>
            <p className="text-white/60 text-sm">
              Riya & Karan — Strong taste overlap
            </p>
          </div>
          <div className="border border-purple-500/30 rounded-lg overflow-hidden">
            <TasteMatch
              v1={highMatchV1}
              v2={highMatchV2}
              showProfiles={{
                nameA: "Riya",
                nameB: "Karan",
              }}
              onLocked={(pct) => {
                console.log("High match locked at:", pct, "%")
              }}
            />
          </div>
        </section>

        {/* SCENARIO 2 — Low Match */}
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-pink-400 mb-2">
              Scenario 2: Low Match (Expected ≤70%)
            </h2>
            <p className="text-white/60 text-sm">
              Riya & Nikhil — Poor taste overlap
            </p>
          </div>
          <div className="border border-pink-500/30 rounded-lg overflow-hidden">
            <TasteMatch
              v1={lowMatchV1}
              v2={lowMatchV2}
              showProfiles={{
                nameA: "Riya",
                nameB: "Nikhil",
              }}
              onLocked={(pct) => {
                console.log("Low match locked at:", pct, "%")
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

