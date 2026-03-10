'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5 text-center">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 mx-auto mb-2" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <p className="text-sm font-medium text-foreground">Check your email</p>
        <p className="text-xs text-muted-foreground mt-1">We sent a confirmation link.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-foreground tracking-tight">Create account</h1>
        <p className="text-sm text-muted-foreground mt-1">Start tracking your calisthenics progress</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-colors"
          />
          <p className="text-[11px] text-muted-foreground/50">Minimum 8 characters</p>
        </div>
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
