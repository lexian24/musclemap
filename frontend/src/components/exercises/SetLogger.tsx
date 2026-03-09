'use client'

import { useState } from 'react'
import type { Exercise } from '@/types'

type SetLoggerProps = {
  exercise: Exercise | null
  userMax?: number
  disabled?: boolean
  onLogSet: (sets: number, reps: number) => void
}

// A stepper input: – [text field] + that supports both direct typing and button clicks.
function NumericField({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const [raw, setRaw] = useState(String(value))

  // Sync display when parent resets
  function handleBlur() {
    const n = parseInt(raw, 10)
    if (!isNaN(n)) {
      const clamped = Math.min(max, Math.max(min, n))
      onChange(clamped)
      setRaw(String(clamped))
    } else {
      setRaw(String(value))
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(e.target.value)
    const n = parseInt(e.target.value, 10)
    if (!isNaN(n) && n >= min && n <= max) {
      onChange(n)
    }
  }

  function step(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta))
    onChange(next)
    setRaw(String(next))
  }

  // Keep raw in sync when value changes from outside (e.g. form reset)
  if (raw !== String(value) && document.activeElement?.id !== id) {
    setRaw(String(value))
  }

  return (
    <div className="flex-1 space-y-1">
      <label htmlFor={id} className="block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center rounded-md border border-border bg-secondary overflow-hidden">
        <button
          type="button"
          onClick={() => step(-1)}
          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors select-none text-base leading-none"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={raw}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full bg-transparent text-center text-sm font-semibold text-foreground focus:outline-none py-2 min-w-0"
          aria-label={label}
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors select-none text-base leading-none"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function SetLogger({ exercise, userMax, disabled = false, onLogSet }: SetLoggerProps) {
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [success, setSuccess] = useState(false)

  const isTimeBased = exercise?.unit === 'seconds'
  const repLabel = isTimeBased ? 'Seconds' : 'Reps'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!exercise || disabled) return
    onLogSet(sets, reps)
    setSuccess(true)
    setSets(3)
    setReps(10)
    setTimeout(() => setSuccess(false), 2000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground">Selected exercise</p>
        <p className={`mt-0.5 text-sm font-semibold ${exercise ? 'text-foreground' : 'text-muted-foreground/50'}`}>
          {exercise ? exercise.name : 'Select an exercise above'}
        </p>
        {userMax !== undefined && userMax > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            Your max: <span className="font-medium text-primary">{userMax} {repLabel.toLowerCase()}</span>
            {reps > 0 && (
              <span className="ml-2 text-muted-foreground/60">
                ({Math.min(100, Math.round((reps / userMax) * 100))}% effort)
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <NumericField
          id="sl-sets"
          label="Sets"
          value={sets}
          min={1}
          max={20}
          onChange={setSets}
        />
        <NumericField
          id="sl-reps"
          label={repLabel}
          value={reps}
          min={1}
          max={isTimeBased ? 3600 : 200}
          onChange={setReps}
        />
      </div>

      {success && (
        <p className="text-sm text-green-400 flex items-center gap-1.5">
          <span>✓</span> Set logged!
        </p>
      )}

      <button
        type="submit"
        disabled={!exercise || disabled}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {disabled ? 'Set your max first' : 'Log Set'}
      </button>
    </form>
  )
}
