"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, X, Zap } from "lucide-react"

interface SwipePost {
  id: string
  image_url: string
  caption: string
  tags: string[]
  created_at: string
  profiles: {
    id: string
    username: string
    avatar_url: string | null
    college: string
    aesthetics: string[]
  }
}

export function SwipeScreen() {
  const [posts, setPosts] = useState<SwipePost[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [swipeDirection, setSwipeDirection] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("/api/swipe-queue", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to load posts")

      const data = await response.json()
      setPosts(data.posts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const currentPost = posts[currentIndex]

  const handleSwipe = async (value: number) => {
    if (!currentPost) return

    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) return

      await fetch("/api/swipe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: currentPost.id,
          value,
        }),
      })

      // Animate out
      if (value === 0) setSwipeDirection("left")
      else if (value === 1) setSwipeDirection("right")
      else if (value === 2) setSwipeDirection("up")

      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1)
        setSwipeDirection(null)
        setDragOffset({ x: 0, y: 0 })
      }, 300)
    } catch (err) {
      console.error("Swipe error:", err)
    }
  }

  const handleDragStart = (clientX: number, clientY: number) => {
    setDragStart({ x: clientX, y: clientY })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!dragStart) return
    setDragOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  const handleDragEnd = () => {
    if (!dragStart) return

    const threshold = 100
    if (Math.abs(dragOffset.x) > threshold) {
      // Swipe left or right
      handleSwipe(dragOffset.x < 0 ? 0 : 1)
    } else if (dragOffset.y < -threshold) {
      // Swipe up
      handleSwipe(2)
    } else {
      // Reset
      setDragOffset({ x: 0, y: 0 })
    }

    setDragStart(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading posts...</div>
      </div>
    )
  }

  if (currentIndex >= posts.length) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-black text-white mb-4">You've Rated Everything!</h1>
        <p className="text-white/60 mb-8 text-center">Come back later for more drip to rate</p>
        <button
          onClick={() => {
            setCurrentIndex(0)
            fetchPosts()
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-black font-bold rounded hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          Start Over
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 pb-24">
      {/* Header */}
      <div className="w-full max-w-sm mb-6 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Rate the Drip</h1>
        <p className="text-white/60 text-sm">Swipe to rate fashion</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
      )}

      {currentPost && (
        <div className="w-full max-w-sm relative">
          {/* Card Stack Effect - Show next card behind */}
          {posts[currentIndex + 1] && (
            <div className="absolute inset-0 rounded-2xl bg-white/5 border border-white/10 transform scale-95 -z-10" />
          )}

          {/* Main Card */}
          <div
            className={`relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-grab active:cursor-grabbing transition-transform ${
              swipeDirection === "left"
                ? "animate-swipeLeft"
                : swipeDirection === "right"
                  ? "animate-swipeRight"
                  : swipeDirection === "up"
                    ? "animate-swipeUp"
                    : ""
            }`}
            style={{
              transform: dragStart
                ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)`
                : "none",
            }}
            onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
            onMouseMove={(e) => dragStart && handleDragMove(e.clientX, e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchMove={(e) => dragStart && handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
          >
            {/* Post Image */}
            <div className="relative h-[500px] bg-gradient-to-br from-purple-600 to-pink-600">
              <Image
                src={currentPost.image_url || "/placeholder.svg"}
                alt={currentPost.caption}
                fill
                className="object-cover"
                draggable={false}
              />

              {/* Swipe Indicators */}
              {dragOffset.x < -50 && (
                <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center">
                    <X size={48} className="text-white" />
                  </div>
                </div>
              )}
              {dragOffset.x > 50 && (
                <div className="absolute inset-0 bg-green-500/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
                    <Heart size={48} className="text-white" />
                  </div>
                </div>
              )}
              {dragOffset.y < -50 && (
                <div className="absolute inset-0 bg-yellow-500/30 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center">
                    <Zap size={48} className="text-white" />
                  </div>
                </div>
              )}
            </div>

            {/* Post Info */}
            <div className="p-6 bg-black">
              <div className="flex items-center gap-3 mb-3">
                {currentPost.profiles.avatar_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={currentPost.profiles.avatar_url || "/placeholder.svg"}
                      alt={currentPost.profiles.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                    {currentPost.profiles.username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{currentPost.profiles.username}</p>
                  <p className="text-purple-300 text-xs">{currentPost.profiles.college || "Fashion Student"}</p>
                </div>
              </div>

              <p className="text-white/90 text-sm mb-3">{currentPost.caption}</p>

              {currentPost.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentPost.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs rounded bg-purple-600/30 text-purple-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-6">
            <button
              onClick={() => handleSwipe(0)}
              className="p-4 rounded-full bg-red-500/20 border-2 border-red-500/50 hover:bg-red-500/30 transition-all hover:scale-110"
              aria-label="Skip"
            >
              <X size={28} className="text-red-400" />
            </button>
            <button
              onClick={() => handleSwipe(2)}
              className="p-5 rounded-full bg-yellow-500/20 border-2 border-yellow-500/50 hover:bg-yellow-500/30 transition-all hover:scale-110"
              aria-label="Super Drip"
            >
              <Zap size={32} className="text-yellow-400" />
            </button>
            <button
              onClick={() => handleSwipe(1)}
              className="p-4 rounded-full bg-green-500/20 border-2 border-green-500/50 hover:bg-green-500/30 transition-all hover:scale-110"
              aria-label="Drip"
            >
              <Heart size={28} className="text-green-400" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-6 text-center text-white/50 text-sm">
            {currentIndex + 1} of {posts.length}
          </div>
        </div>
      )}
    </div>
  )
}
