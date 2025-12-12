"use client"

import { useState } from "react"
import { Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CollegeSelectionProps {
  onSelect: (college: string) => void
  onSkip?: () => void
}

const INDIAN_COLLEGES = [
  "IIT Delhi",
  "IIT Bombay",
  "IIT Madras",
  "IIT Kanpur",
  "IIT Kharagpur",
  "BITS Pilani",
  "Delhi University",
  "Mumbai University",
  "St. Xavier's College Mumbai",
  "Symbiosis Pune",
  "Christ University Bangalore",
  "NIFT Delhi",
  "NIFT Mumbai",
  "Pearl Academy",
  "Amity University",
  "Manipal University",
  "VIT Vellore",
  "SRM University",
  "Jadavpur University",
  "NID Ahmedabad",
]

export function CollegeSelectionScreen({ onSelect, onSkip }: CollegeSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollege, setSelectedCollege] = useState<string | null>(null)

  const filteredColleges = INDIAN_COLLEGES.filter((college) =>
    college.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleConfirm = () => {
    if (selectedCollege) {
      onSelect(selectedCollege)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-4xl font-black text-white tracking-tight mb-3">Your Campus</h1>
        <p className="text-white/60 text-sm">
          Connect with fashionistas from your college. We'll show you the best drip from your campus first.
        </p>
      </div>

      {/* Search */}
      <div className="w-full max-w-md mb-6">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your college..."
            className="w-full bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm pl-10 pr-4 py-3 text-white placeholder:text-white/30 transition-colors outline-none"
          />
        </div>
      </div>

      {/* College List */}
      <div className="w-full max-w-md mb-6 max-h-96 overflow-y-auto space-y-2 px-1">
        {filteredColleges.length === 0 ? (
          <div className="text-center py-8 text-white/40">No colleges found. Try a different search.</div>
        ) : (
          filteredColleges.map((college) => (
            <button
              key={college}
              onClick={() => setSelectedCollege(college)}
              className={`w-full text-left px-4 py-3 rounded-sm transition-all ${
                selectedCollege === college
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-black font-bold"
                  : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{college}</span>
                {selectedCollege === college && <ChevronRight size={20} />}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="w-full max-w-md space-y-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedCollege}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-black font-bold py-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </Button>
        {onSkip && (
          <button onClick={onSkip} className="w-full text-white/60 text-sm hover:text-white/80 transition-colors">
            Skip for now
          </button>
        )}
      </div>
    </div>
  )
}
