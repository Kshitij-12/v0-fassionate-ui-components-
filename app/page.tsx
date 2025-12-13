"use client"

import { useState, useEffect } from "react"
import { WelcomeScreen } from "@/components/welcome-screen"
import { SignupScreen } from "@/components/signup-screen"
import { AestheticSelectionScreen } from "@/components/aesthetic-selection-screen"
import { FeedScreen } from "@/components/feed-screen"
import { SwipeScreen } from "@/components/swipe-screen"
import { ExploreScreen } from "@/components/explore-screen"
import { ProfileScreen } from "@/components/profile-screen"
import { CreatePostScreen } from "@/components/create-post-screen"
import { BottomNav } from "@/components/bottom-nav"
import { Plus } from "lucide-react"

type Screen = "welcome" | "signup" | "aesthetics" | "app"
type AppTab = "feed" | "swipe" | "explore" | "profile"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome")
  const [activeTab, setActiveTab] = useState<AppTab>("feed")
  const [isHydrated, setIsHydrated] = useState(false)
  const [showCreatePost, setShowCreatePost] = useState(false)

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

          <button
            onClick={() => setShowCreatePost(true)}
            className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg hover:shadow-xl hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center glow-neon-pink"
            aria-label="Create post"
          >
            <Plus size={28} className="text-black" />
          </button>

          {showCreatePost && (
            <CreatePostScreen
              onClose={() => setShowCreatePost(false)}
              onSuccess={() => {
                setShowCreatePost(false)
                setActiveTab("feed")
              }}
            />
          )}
        </>
      )}
    </main>
  )
}
