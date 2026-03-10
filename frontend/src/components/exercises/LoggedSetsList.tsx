'use client'

import { useState } from 'react'
import type { LoggedSet } from '@/types'

type LoggedSetsListProps = {
  sets: LoggedSet[]
  onDelete?: (id: string) => void
}

function timeAgo(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return `${Math.floor(diffHours / 24)}d ago`
}

function TrashIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

export function LoggedSetsList({ sets, onDelete }: LoggedSetsListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground/60">
          No sets logged today. Start your workout!
        </p>
      </div>
    )
  }

  const sorted = [...sets].sort(
    (a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime(),
  )

  async function handleDelete(id: string) {
    if (!onDelete) return
    setDeletingIds((prev) => new Set(prev).add(id))
    onDelete(id)
  }

  return (
    <ul className="space-y-1.5">
      {sorted.map((set) => (
        <li
          key={set.id}
          className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-3.5 py-2.5 transition-colors hover:bg-white/[0.04]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">{set.exerciseName}</span>
            <span className="text-sm font-semibold text-red-400 shrink-0">
              {set.sets}&times;{set.reps}
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs text-muted-foreground/50">{timeAgo(set.loggedAt)}</span>
            {onDelete && (
              <button
                onClick={() => void handleDelete(set.id)}
                disabled={deletingIds.has(set.id)}
                aria-label={`Delete ${set.exerciseName} set`}
                className="text-muted-foreground/30 transition-colors hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer p-0.5"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
