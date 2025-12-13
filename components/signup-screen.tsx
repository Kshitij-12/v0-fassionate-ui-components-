"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabaseClient } from "@/lib/supabaseClient"

interface SignupForm {
  email: string
  password: string
  username: string
  college: string
}

export function SignupScreen({
  onSignupComplete,
  onBack,
}: {
  onSignupComplete: () => void
  onBack: () => void
}) {
  const [form, setForm] = useState<SignupForm>({
    email: "",
    password: "",
    username: "",
    college: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Signup failed")
      }

      // Create profile
      const { error: profileError } = await supabaseClient.from("profiles").insert([
        {
          id: authData.user.id,
          username: form.username,
          college: form.college,
        },
      ])

      if (profileError) {
        throw new Error(profileError.message)
      }

      // Store token for later use
      if (authData.session?.access_token) {
        localStorage.setItem("sb-access-token", authData.session.access_token)
      }

      setTimeout(() => {
        setIsSubmitting(false)
        onSignupComplete()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSubmitting(false)
    }
  }

  const isFormValid = form.email && form.password && form.username && form.college

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 relative overflow-hidden py-8">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-80 h-80 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md float-up">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={onBack}
            className="text-white/50 hover:text-white/80 text-sm font-medium transition-colors mb-6"
          >
            ← Back
          </button>
          <h2 className="text-4xl font-black tracking-tight text-white mb-2">Create Account</h2>
          <p className="text-white/60 text-sm">Join the underground fashion scene</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-300 text-sm">{error}</div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">Email</label>
            <Input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm py-2.5 text-white placeholder:text-white/30 transition-colors"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">
              Username
            </label>
            <Input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="your_drip"
              className="bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm py-2.5 text-white placeholder:text-white/30 transition-colors"
            />
          </div>

          {/* College */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">
              College/City
            </label>
            <Input
              type="text"
              name="college"
              value={form.college}
              onChange={handleChange}
              placeholder="Delhi University"
              className="bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm py-2.5 text-white placeholder:text-white/30 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-xs uppercase tracking-wider text-purple-400 font-semibold mb-2 block">
              Password
            </label>
            <Input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="bg-white/5 border border-purple-600/30 focus:border-purple-500 rounded-sm py-2.5 text-white placeholder:text-white/30 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-black font-bold py-3 rounded-sm mt-6 transition-all duration-300"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </Button>
        </form>

        {/* Secondary CTA */}
        <div className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <button onClick={onBack} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
            Log in
          </button>
        </div>
      </div>
    </div>
  )
}
