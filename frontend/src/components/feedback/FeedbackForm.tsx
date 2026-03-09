'use client'

import { useState } from 'react'

type FeedbackType = 'bug' | 'feature' | 'general'

const FEEDBACK_TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'general', label: 'General' },
]

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

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
      <div className="rounded-xl border border-border bg-card p-8 shadow-lg shadow-black/20 flex flex-col items-center gap-3 text-center">
        <span className="text-green-500">
          <CheckIcon />
        </span>
        <p className="text-sm font-medium text-foreground">
          Thank you! Your feedback has been received.
        </p>
        <p className="text-xs text-muted-foreground">
          We read every submission and use it to improve MuscleMap.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setMessage('')
            setType('general')
          }}
          className="mt-2 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Submit more feedback
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-lg shadow-black/20">
      <div className="mb-4 pb-4 border-b border-border">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Send Feedback
        </h2>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5">
        {/* Type selector */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Type</p>
          <div className="flex gap-2 flex-wrap">
            {FEEDBACK_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={[
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors border',
                  type === value
                    ? 'bg-primary/15 text-primary border-primary/40'
                    : 'bg-secondary text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/80',
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
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <p className="text-right text-xs text-muted-foreground/60 mt-1">
            {message.length}/1000
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2">
            <p className="text-sm text-destructive flex-1">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors flex-shrink-0"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || message.length < 10}
          className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending…' : 'Send Feedback'}
        </button>
      </form>
    </div>
  )
}
