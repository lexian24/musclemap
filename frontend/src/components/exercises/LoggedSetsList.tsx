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
      <p className="text-sm text-[#555]">
        No sets logged today. Start your workout!
      </p>
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
    <ul className="space-y-2">
      {sorted.map((set) => (
        <li
          key={set.id}
          className="flex items-center justify-between rounded-md border border-[#222] bg-[#1a1a1a] px-3 py-2"
        >
          <div>
            <span className="text-sm font-medium text-white">{set.exerciseName}</span>
            <span className="ml-2 text-sm text-[#FF2020]">
              {set.sets}×{set.reps}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666]">{timeAgo(set.loggedAt)}</span>
            {onDelete && (
              <button
                onClick={() => void handleDelete(set.id)}
                disabled={deletingIds.has(set.id)}
                aria-label={`Delete ${set.exerciseName} set`}
                className="ml-1 text-muted-foreground/40 transition-colors hover:text-destructive disabled:opacity-40 disabled:cursor-not-allowed"
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
