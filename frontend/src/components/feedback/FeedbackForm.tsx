'use client'

import { useState } from 'react'

type FeedbackType = 'bug' | 'feature' | 'general'

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General' },
]

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, message }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to submit feedback')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-10 flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Thank you for your feedback!
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            We read every submission and use it to improve MuscleMap.
          </p>
        </div>
        <button
          onClick={() => {
            setSuccess(false)
            setMessage('')
            setType('general')
          }}
          className="mt-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          Submit more feedback
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-5">
      <h2 className="section-title mb-5">
        Send Feedback
      </h2>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {/* Type selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2.5">Type</p>
          <div className="flex gap-2 flex-wrap">
            {FEEDBACK_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={[
                  'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer',
                  type === value
                    ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30'
                    : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="feedback-message" className="text-xs font-medium text-muted-foreground block mb-2">
            Message
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your feedback..."
            rows={5}
            minLength={10}
            maxLength={1000}
            required
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
          />
          <p className="text-right text-[11px] text-muted-foreground/40 mt-1.5 tabular-nums">
            {message.length}/1000
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5">
            <p className="text-sm text-red-400 flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || message.length < 10}
          className="w-full rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-red-500/25 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? 'Sending...' : 'Send Feedback'}
        </button>
      </form>
    </div>
  )
}
