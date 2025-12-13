"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, MapPin, UserPlus, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  college: string
  bio?: string
  created_at: string
}

interface UserPost {
  id: string
  image_url: string
  caption: string
  tags: string[]
  like_count: number
  user_has_liked: boolean
}

interface UserProfileScreenProps {
  userId: string
  onBack: () => void
}

export function UserProfileScreen({ userId, onBack }: UserProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<UserPost[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("sb-access-token")
        if (!token) {
          setError("Not authenticated")
          return
        }

        // Fetch profile
        const profileRes = await fetch(`/api/profile?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!profileRes.ok) throw new Error("Failed to load profile")

        const profileData = await profileRes.json()
        setProfile(profileData)

        // Fetch user's posts
        const postsRes = await fetch(`/api/user/${userId}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!postsRes.ok) throw new Error("Failed to load posts")

        const postsData = await postsRes.json()
        setPosts(postsData)

        // Check if following
        const followRes = await fetch(`/api/follow/check?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (followRes.ok) {
          const followData = await followRes.json()
          setIsFollowing(followData.isFollowing)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfileData()
  }, [userId])

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) return

      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          following_id: userId,
          action: isFollowing ? "unfollow" : "follow",
        }),
      })

      if (response.ok) {
        setIsFollowing(!isFollowing)
      }
    } catch (err) {
      console.error("Follow error:", err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/60">Loading profile...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">Profile not found</p>
        <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-500">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
        <button onClick={onBack} className="text-white hover:text-white/80 text-sm font-medium">
          ← Back
        </button>
        <h1 className="text-xl font-black text-white">{profile.username}</h1>
        <div className="w-10" />
      </div>

      {/* Profile Header */}
      <div className="p-4 space-y-4">
        {/* Avatar Section */}
        <div className="flex gap-4 items-end">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.username}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <p className="text-2xl font-black text-white">{profile.username[0]?.toUpperCase()}</p>
            )}
          </div>

          <div className="flex-1 mb-2">
            <h1 className="text-3xl font-black text-white">{profile.username}</h1>
            <div className="flex items-center gap-2 text-white/60 text-sm mt-1">
              <MapPin size={14} />
              <span>{profile.college}</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && <p className="text-white/70 text-sm">{profile.bio}</p>}

        {/* Follow Button */}
        <Button
          onClick={handleFollowToggle}
          className={`w-full ${
            isFollowing
              ? "bg-white/10 border border-white/20 text-white hover:bg-white/20"
              : "bg-gradient-to-r from-purple-600 to-pink-600 text-black hover:from-purple-500 hover:to-pink-500"
          } font-bold py-2`}
        >
          {isFollowing ? (
            <>
              <UserCheck size={16} className="inline mr-2" />
              Following
            </>
          ) : (
            <>
              <UserPlus size={16} className="inline mr-2" />
              Follow
            </>
          )}
        </Button>
      </div>

      {/* Posts Grid */}
      <div className="px-4">
        <h2 className="text-lg font-black text-white mb-4">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-white/60 text-center py-8">No posts yet</p>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {posts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square rounded-sm overflow-hidden bg-white/5 group cursor-pointer"
              >
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.caption}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <div className="text-center">
                    <Heart size={20} className="text-red-400 mx-auto mb-1" />
                    <p className="text-white text-sm">{post.like_count}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 m-4 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
      )}
    </div>
  )
}
