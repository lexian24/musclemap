'use client'

import type { LoggedSet } from '@/types'

type LoggedSetsListProps = {
  sets: LoggedSet[]
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

export function LoggedSetsList({ sets }: LoggedSetsListProps) {
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
          <span className="text-xs text-[#666]">{timeAgo(set.loggedAt)}</span>
        </li>
      ))}
    </ul>
  )
}
