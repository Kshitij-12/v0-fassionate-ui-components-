"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { SignupScreen } from "@/components/signup-screen"
import { AestheticSelectionScreen } from "@/components/aesthetic-selection-screen"

type Screen = "welcome" | "signup" | "aesthetics"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")

  return (
    <main className="bg-black min-h-screen">
      {currentScreen === "welcome" && (
        <WelcomeScreen onEnter={() => setCurrentScreen("signup")} onSignup={() => setCurrentScreen("signup")} />
      )}
      {currentScreen === "signup" && (
        <SignupScreen
          onSignupComplete={() => setCurrentScreen("aesthetics")}
          onBack={() => setCurrentScreen("welcome")}
        />
      )}
      {currentScreen === "aesthetics" && (
        <AestheticSelectionScreen
          onComplete={() => {
            console.log("Onboarding complete!")
          }}
        />
      )}
    </main>
  )
}
