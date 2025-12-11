"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ThumbsUp, ThumbsDown, X } from "lucide-react"

interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  college: string
  bio?: string
}

interface SwipeUserPost {
  id: string
  image_url: string
  caption: string
  tags: string[]
}

export function SwipeScreen() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [matches, setMatches] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("/api/discover", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to load users")

      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const currentUser = users[currentIndex]

  const handleSwipe = async (liked: boolean) => {
    if (!currentUser) return

    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) return

      if (liked) {
        // Calculate match percentage (simplified)
        const matchPercentage = Math.floor(Math.random() * 41) + 60 // 60-100%

        const response = await fetch("/api/taste-match", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matched_user_id: currentUser.id,
            match_percentage: matchPercentage,
          }),
        })

        if (response.ok) {
          setMatches((prev) => ({ ...prev, [currentUser.id]: matchPercentage }))
        }
      }

      setCurrentIndex((prev) => prev + 1)
    } catch (err) {
      console.error("Swipe error:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading profiles...</div>
      </div>
    )
  }

  if (currentIndex >= users.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-black text-white mb-4">You've Reached the End</h1>
        <p className="text-white/60 mb-8 text-center">Come back tomorrow for more fashion twins!</p>
        <button
          onClick={() => {
            setCurrentIndex(0)
            fetchUsers()
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-black font-bold rounded hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          Swipe Again
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 pb-8">
      {/* Header */}
      <div className="w-full max-w-sm mb-8 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Find Your Twin</h1>
        <p className="text-white/60 text-sm">Discover fashion soulmates</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
      )}

      {currentUser && (
        <div className="w-full max-w-sm">
          {/* Profile Card */}
          <div className="mb-6 rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-scaleIn">
            {/* Avatar/Header */}
            <div className="relative h-96 bg-gradient-to-br from-purple-600 to-pink-600">
              {currentUser.avatar_url ? (
                <Image
                  src={currentUser.avatar_url || "/placeholder.svg"}
                  alt={currentUser.username}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-6xl font-black">
                  {currentUser.username[0]?.toUpperCase()}
                </div>
              )}
              {matches[currentUser.id] && (
                <div className="absolute top-4 right-4 bg-green-500/90 px-4 py-2 rounded-full">
                  <p className="text-white font-bold text-lg">{matches[currentUser.id]}%</p>
                  <p className="text-white text-xs">Fashion Twin Match</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-6 bg-black">
              <h2 className="text-2xl font-black text-white mb-1">{currentUser.username}</h2>
              <p className="text-purple-300 text-sm mb-4">{currentUser.college}</p>
              {currentUser.bio && <p className="text-white/70 text-sm">{currentUser.bio}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleSwipe(false)}
              className="p-4 rounded-full bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 transition-all"
            >
              <ThumbsDown size={24} className="text-red-400" />
            </button>
            <button
              onClick={() => handleSwipe(true)}
              className="p-4 rounded-full bg-green-500/20 border border-green-500/50 hover:bg-green-500/30 transition-all"
            >
              <ThumbsUp size={24} className="text-green-400" />
            </button>
            <button
              onClick={() => setCurrentIndex((prev) => prev + 1)}
              className="p-4 rounded-full bg-gray-500/20 border border-gray-500/50 hover:bg-gray-500/30 transition-all"
            >
              <X size={24} className="text-gray-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-8 text-center text-white/50 text-sm">
            {currentIndex + 1} of {users.length}
          </div>
        </div>
      )}
    </div>
  )
}
