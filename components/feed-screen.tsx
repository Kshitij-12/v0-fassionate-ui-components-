"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Share2, RefreshCw } from "lucide-react"

interface FeedPost {
  id: string
  caption: string
  image_url: string
  tags: string[]
  created_at: string
  author_username: string
  author_avatar_url: string
  like_count: number
  user_has_liked: boolean
}

export function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchFeed = async (showLoader = true) => {
    if (showLoader) setIsLoading(true)
    else setIsRefreshing(true)

    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setError("Not authenticated")
        return
      }

      const response = await fetch("/api/feed?limit=20", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to load feed")
      }

      const data = await response.json()
      setPosts(data)
      setError("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [])

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem("sb-access-token")
    if (!token) return

    try {
      await fetch("/api/posts/like", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId }),
      })

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                user_has_liked: !post.user_has_liked,
                like_count: post.user_has_liked ? post.like_count - 1 : post.like_count + 1,
              }
            : post,
        ),
      )
    } catch (err) {
      console.error("Failed to like post", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading feed...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white tracking-tight">Feed</h1>
        <button
          onClick={() => fetchFeed(false)}
          disabled={isRefreshing}
          className="p-2 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          aria-label="Refresh feed"
        >
          <RefreshCw size={20} className={`text-white ${isRefreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Posts Feed */}
      <div className="max-w-2xl mx-auto">
        {error && <div className="p-4 m-4 bg-red-500/20 border border-red-500/50 rounded text-red-300">{error}</div>}

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/60 gap-4">
            <p>No posts yet. Be the first!</p>
            <p className="text-sm text-white/40">Tap the + button to share your drip</p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="border-b border-white/10 p-4 hover:bg-white/5 transition-colors">
              {/* Author */}
              <div className="flex items-center gap-3 mb-4">
                {post.author_avatar_url ? (
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={post.author_avatar_url || "/placeholder.svg"}
                      alt={post.author_username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                    {post.author_username[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-white font-semibold text-sm">{post.author_username}</p>
                  <p className="text-white/50 text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Image */}
              <div className="mb-4 rounded-sm overflow-hidden bg-white/5 aspect-square">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.caption}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Caption */}
              <p className="text-white/90 text-sm mb-3">{post.caption}</p>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 text-xs rounded bg-purple-600/30 text-purple-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 text-white/60">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 hover:text-pink-500 transition-colors"
                >
                  <Heart
                    size={18}
                    fill={post.user_has_liked ? "currentColor" : "none"}
                    className={post.user_has_liked ? "text-pink-500" : ""}
                  />
                  <span className="text-xs">{post.like_count}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-purple-500 transition-colors">
                  <MessageCircle size={18} />
                  <span className="text-xs">0</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
