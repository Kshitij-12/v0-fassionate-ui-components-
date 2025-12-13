"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { X, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CreatePostProps {
  onClose: () => void
  onSuccess: () => void
}

const AESTHETIC_TAGS = [
  "DRIPLORDS",
  "THRIFTGANG",
  "MINIMALIST",
  "MAXIMAL",
  "STREETWEAR",
  "GRUNGE",
  "Y2K",
  "COTTAGECORE",
  "CYBERPUNK",
  "VINTAGE",
  "ETHNIC",
  "EXPERIMENTAL",
]

export function CreatePostScreen({ onClose, onSuccess }: CreatePostProps) {
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [caption, setCaption] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const preview = URL.createObjectURL(file)
      setImagePreview(preview)
      setError("")
    }
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSubmit = async () => {
    if (!image || !caption) {
      setError("Please add an image and caption")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const token = localStorage.getItem("sb-access-token")
      if (!token) {
        setError("Not authenticated")
        return
      }

      // Create FormData for file upload
      const formData = new FormData()
      formData.append("file", image)
      formData.append("caption", caption)
      formData.append("tags", JSON.stringify(selectedTags))

      const response = await fetch("/api/posts/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to create post")
      }

      setIsSubmitting(false)
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-gradient-to-t from-black to-black/95 rounded-t-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-black/95 backdrop-blur-md border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Share Your Drip</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X size={24} className="text-white" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3 block">
              Your Fit
            </label>
            {imagePreview ? (
              <div className="relative rounded-sm overflow-hidden bg-white/5">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    setImage(null)
                    setImagePreview("")
                  }}
                  className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded transition-colors"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-purple-600/50 rounded-sm p-8 flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-600/5 transition-colors cursor-pointer"
              >
                <Upload size={24} className="text-purple-400" />
                <p className="text-white font-medium">Upload Image</p>
                <p className="text-white/50 text-sm">Click to select or drag and drop</p>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </div>

          {/* Caption */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's your vibe?"
              className="w-full bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm p-3 text-white placeholder:text-white/30 resize-none h-24 transition-colors"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-3 block">
              Tags (Select 1-3)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AESTHETIC_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-2 text-xs rounded-sm font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-black"
                      : "bg-white/5 border border-white/20 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 text-white border-white/20 hover:bg-white/10 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !image || !caption}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-black font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
