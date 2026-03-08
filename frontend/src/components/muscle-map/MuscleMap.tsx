import { fatigueToColor, formatFatigue, muscleLabel } from '@/lib/fatigue'
import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'

type MuscleMapProps = {
  fatigueState: FatigueState
}

// SVG path data for a simplified front/back body outline.
// Each entry maps a MuscleGroup to its SVG path and which view it belongs to.
type MusclePath = {
  muscle: MuscleGroup
  view: 'front' | 'back'
  // Simplified polygon points for the body diagram (placeholder shapes)
  d: string
}

const MUSCLE_PATHS: MusclePath[] = [
  // Front view
  { muscle: 'chest', view: 'front', d: 'M 55 60 L 95 60 L 100 90 L 50 90 Z' },
  { muscle: 'front_delts', view: 'front', d: 'M 40 55 L 55 55 L 55 75 L 38 70 Z' },
  { muscle: 'side_delts', view: 'front', d: 'M 30 65 L 42 60 L 42 80 L 30 78 Z' },
  { muscle: 'biceps', view: 'front', d: 'M 28 82 L 38 80 L 36 110 L 26 108 Z' },
  { muscle: 'forearms', view: 'front', d: 'M 24 112 L 34 110 L 32 135 L 22 133 Z' },
  { muscle: 'abs', view: 'front', d: 'M 58 92 L 92 92 L 90 130 L 60 130 Z' },
  { muscle: 'obliques', view: 'front', d: 'M 50 92 L 60 92 L 60 130 L 48 122 Z' },
  { muscle: 'quads', view: 'front', d: 'M 60 135 L 75 135 L 74 185 L 59 183 Z' },
  { muscle: 'calves', view: 'front', d: 'M 60 190 L 73 190 L 72 220 L 59 218 Z' },
  // Back view
  { muscle: 'upper_back', view: 'back', d: 'M 55 60 L 95 60 L 100 85 L 50 85 Z' },
  { muscle: 'lats', view: 'back', d: 'M 42 70 L 58 65 L 62 100 L 40 108 Z' },
  { muscle: 'lower_back', view: 'back', d: 'M 56 88 L 94 88 L 92 115 L 58 115 Z' },
  { muscle: 'rear_delts', view: 'back', d: 'M 95 55 L 110 55 L 112 75 L 94 72 Z' },
  { muscle: 'triceps', view: 'back', d: 'M 112 78 L 122 76 L 120 106 L 110 104 Z' },
  { muscle: 'glutes', view: 'back', d: 'M 56 118 L 94 118 L 96 145 L 54 145 Z' },
  { muscle: 'hamstrings', view: 'back', d: 'M 58 148 L 75 148 L 76 193 L 57 191 Z' },
]

export function MuscleMap({ fatigueState }: MuscleMapProps) {
  const frontMuscles = MUSCLE_PATHS.filter((m) => m.view === 'front')
  const backMuscles = MUSCLE_PATHS.filter((m) => m.view === 'back')

  return (
    <div className="flex flex-col gap-8 sm:flex-row">
      <BodyView label="Front" muscles={frontMuscles} fatigueState={fatigueState} />
      <BodyView label="Back" muscles={backMuscles} fatigueState={fatigueState} />
      <FatigueKey fatigueState={fatigueState} />
    </div>
  )
}

function BodyView({
  label,
  muscles,
  fatigueState,
}: {
  label: string
  muscles: MusclePath[]
  fatigueState: FatigueState
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <svg
        viewBox="0 0 150 240"
        className="w-36 h-auto"
        aria-label={`${label} body view`}
      >
        {/* Body outline */}
        <ellipse cx="75" cy="35" rx="18" ry="22" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="50" y="55" width="50" height="80" rx="6" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="25" y="58" width="26" height="75" rx="5" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="99" y="58" width="26" height="75" rx="5" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="57" y="133" width="18" height="65" rx="5" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <rect x="75" y="133" width="18" height="65" rx="5" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        {/* Muscle overlays */}
        {muscles.map(({ muscle, d }) => (
          <MuscleGroupPath
            key={muscle}
            muscleId={muscle}
            d={d}
            fatigueValue={fatigueState[muscle]}
          />
        ))}
      </svg>
    </div>
  )
}

function FatigueKey({ fatigueState }: { fatigueState: FatigueState }) {
  const sorted = (Object.entries(fatigueState) as Array<[MuscleGroup, number]>)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground self-center">
        All muscles fully recovered
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-1 self-start mt-6">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
        Fatigue
      </span>
      {sorted.map(([muscle, fatigue]) => (
        <div key={muscle} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: fatigueToColor(fatigue) }}
          />
          <span className="text-sm">{muscleLabel(muscle)}</span>
          <span className="text-xs text-muted-foreground ml-auto pl-3">
            {formatFatigue(fatigue)}
          </span>
        </div>
      ))}
    </div>
  )
}
