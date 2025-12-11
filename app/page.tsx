"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { SignupScreen } from "@/components/signup-screen"
import { AestheticSelectionScreen } from "@/components/aesthetic-selection-screen"
import { FeedScreen } from "@/components/feed-screen"
import { SwipeScreen } from "@/components/swipe-screen"
import { ExploreScreen } from "@/components/explore-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { BottomNav } from "@/components/bottom-nav"

type Screen = "welcome" | "signup" | "aesthetics" | "app"
type AppTab = "feed" | "swipe" | "explore" | "profile"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [activeTab, setActiveTab] = useState<AppTab>("feed")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
    // Check if user is logged in
    const token = localStorage.getItem("sb-access-token")
    if (token) {
      setCurrentScreen("app")
    }
  }, [])

  if (!isHydrated) {
    return <div className="bg-black min-h-screen" />
  }

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

      {currentScreen === "aesthetics" && <AestheticSelectionScreen onComplete={() => setCurrentScreen("app")} />}

      {currentScreen === "app" && (
        <>
          {activeTab === "feed" && <FeedScreen />}
          {activeTab === "swipe" && <SwipeScreen />}
          {activeTab === "explore" && <ExploreScreen />}
          {activeTab === "profile" && <ProfileScreen onLogout={() => setCurrentScreen("welcome")} />}

          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        </>
      )}
    </main>
  )
}
