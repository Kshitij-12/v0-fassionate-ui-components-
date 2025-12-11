"use client"

import { Home, Heart, Compass, User } from "lucide-react"

interface BottomNavProps {
  activeTab: "feed" | "swipe" | "explore" | "profile"
  onTabChange: (tab: "feed" | "swipe" | "explore" | "profile") => void
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "feed", icon: Home, label: "Feed" },
    { id: "swipe", icon: Heart, label: "Twins" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "profile", icon: User, label: "Profile" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 z-30">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as typeof activeTab)}
              className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-purple-400" : "text-white/50 hover:text-white/80"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
