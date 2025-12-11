"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, Flame } from "lucide-react"

interface ExploreUser {
  id: string
  username: string
  avatar_url: string | null
  college: string
}

export function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<ExploreUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"trending" | "recent">("trending")

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("sb-access-token")
        if (!token) return

        const response = await fetch(`/api/explore?filter=${filter}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (err) {
        console.error("Failed to fetch explore users", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [filter])

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.college.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-black pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
        <h1 className="text-2xl font-black text-white mb-4">Explore</h1>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search users, college..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-white/40 focus:border-purple-500 focus:bg-white/15 transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["trending", "recent"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as "trending" | "recent")}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                filter === f
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {f === "trending" ? (
                <>
                  <Flame size={14} className="inline mr-1" />
                  Trending
                </>
              ) : (
                "Recent"
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      <div className="px-4 py-4">
        {isLoading ? (
          <div className="text-center py-8 text-white/60">Loading...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-white/60">No users found</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group rounded-lg overflow-hidden bg-white/5 border border-white/10 hover:border-purple-500 transition-colors cursor-pointer"
              >
                {/* Avatar */}
                <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 overflow-hidden flex items-center justify-center">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url || "/placeholder.svg"}
                      alt={user.username}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <p className="text-3xl font-black text-white">{user.username[0]?.toUpperCase()}</p>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-white text-sm truncate">{user.username}</h3>
                  <p className="text-white/50 text-xs truncate">{user.college}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
