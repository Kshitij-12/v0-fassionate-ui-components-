"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabaseClient } from "@/lib/supabaseClient"

interface MyProfile {
  id: string
  username: string
  avatar_url: string | null
  college: string
  bio?: string
}

interface ProfileScreenProps {
  onLogout: () => void
}

export function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("sb-access-token")
        if (!token) {
          setError("Not authenticated")
          return
        }

        const response = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to load profile")

        const data = await response.json()
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    localStorage.removeItem("sb-access-token")
    onLogout()
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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/60">Failed to load profile</p>
        <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-500">
          Sign Out
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <button className="p-2 hover:bg-white/10 rounded transition-colors">
          <Settings size={24} className="text-white" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-6 text-center border-b border-white/10">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden flex items-center justify-center">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url || "/placeholder.svg"}
              alt={profile.username}
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-4xl font-black text-white">{profile.username[0]?.toUpperCase()}</p>
          )}
        </div>

        <h2 className="text-3xl font-black text-white mb-1">{profile.username}</h2>
        <p className="text-purple-300 text-sm mb-2">{profile.college}</p>
        {profile.bio && <p className="text-white/70 text-sm">{profile.bio}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/10">
        <div className="text-center">
          <p className="text-2xl font-black text-white">0</p>
          <p className="text-white/60 text-xs">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-white">0</p>
          <p className="text-white/60 text-xs">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-white">0</p>
          <p className="text-white/60 text-xs">Following</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        <Button className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20">Edit Profile</Button>
        <Button className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20">My Matches</Button>
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500/20 border border-red-500/50 text-red-300 hover:bg-red-500/30"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
