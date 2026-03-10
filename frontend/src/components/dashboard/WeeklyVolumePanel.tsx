'use client'

import { WEEKLY_VOLUME_TARGETS } from '@/lib/constants'
import { muscleLabel } from '@/lib/fatigue'
import type { MuscleGroup, WeeklyVolume } from '@/types'

type WeeklyVolumePanelProps = {
  weeklyVolume: WeeklyVolume
}

type MuscleRow = {
  muscle: MuscleGroup
  sets: number
}

export function WeeklyVolumePanel({ weeklyVolume }: WeeklyVolumePanelProps) {
  const entries = Object.entries(weeklyVolume) as [MuscleGroup, number][]

  // Sort by volume descending (most trained first)
  const rows: MuscleRow[] = entries
    .filter(([, sets]) => sets > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([muscle, sets]) => ({ muscle, sets }))

  if (rows.length === 0) {
    return (
      <p className="text-xs text-muted-foreground/50 py-2">No sets logged this week yet.</p>
    )
  }

  return (
    <div className="space-y-3">
      {rows.map(({ muscle, sets }) => {
        const target = WEEKLY_VOLUME_TARGETS[muscle]
        const { minSets: mev, optimalSets: mav, maxSets: mrv } = target

        const isOverMrv = sets > mrv
        // Clamp progress bar at MRV for display
        const progress = Math.min(sets / mrv, 1)

        // Color zone based on current sets vs targets
        let barColor: string
        let zoneLabel: string
        if (sets < mev) {
          barColor = 'bg-zinc-600'
          zoneLabel = 'Below MEV'
        } else if (sets < mav) {
          barColor = 'bg-emerald-500'
          zoneLabel = 'In MEV-MAV range'
        } else if (sets <= mrv) {
          barColor = 'bg-amber-400'
          zoneLabel = 'Near MRV'
        } else {
          barColor = 'bg-red-500'
          zoneLabel = 'Over MRV'
        }

        return (
          <div key={muscle} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-foreground/80 truncate">
                {muscleLabel(muscle)}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                {isOverMrv && (
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md leading-none">
                    Over MRV
                  </span>
                )}
                <span className="text-xs text-muted-foreground/60 tabular-nums">
                  {sets}/{mav}
                </span>
              </div>
            </div>
            <div
              className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden"
              role="progressbar"
              aria-label={`${muscleLabel(muscle)}: ${sets} sets this week. ${zoneLabel}`}
              aria-valuenow={sets}
              aria-valuemin={0}
              aria-valuemax={mrv}
            >
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
