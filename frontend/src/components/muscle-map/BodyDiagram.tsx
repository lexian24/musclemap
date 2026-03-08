'use client'

import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'

type MuscleDef = {
  muscleId: MuscleGroup
  d: string
}

// Front-view muscle paths (viewBox "0 0 100 248")
// Bilateral muscles use compound paths (two subpaths separated by space).
const FRONT_MUSCLES: MuscleDef[] = [
  {
    muscleId: 'chest',
    d: 'M 26 40 Q 50 34 74 40 L 72 76 Q 50 82 28 76 Z',
  },
  {
    muscleId: 'front_delts',
    d: 'M 11 37 L 24 36 L 23 57 L 9 55 Z M 76 36 L 89 37 L 91 55 L 77 57 Z',
  },
  {
    muscleId: 'side_delts',
    d: 'M 6 40 L 12 36 L 11 60 L 5 58 Z M 88 36 L 94 40 L 95 58 L 89 60 Z',
  },
  {
    muscleId: 'biceps',
    d: 'M 7 60 L 15 58 L 14 96 L 6 94 Z M 85 58 L 93 60 L 94 94 L 86 96 Z',
  },
  {
    muscleId: 'forearms',
    d: 'M 5 98 L 17 98 L 16 140 L 4 138 Z M 83 98 L 95 98 L 96 138 L 84 140 Z',
  },
  {
    muscleId: 'abs',
    d: 'M 33 78 L 67 78 L 66 113 L 34 113 Z',
  },
  {
    muscleId: 'obliques',
    d: 'M 26 78 L 34 78 L 33 112 L 24 108 Z M 66 78 L 74 78 L 76 108 L 67 112 Z',
  },
  {
    muscleId: 'quads',
    d: 'M 27 117 L 47 117 L 46 194 L 26 192 Z M 53 117 L 73 117 L 74 192 L 54 194 Z',
  },
  {
    muscleId: 'calves',
    d: 'M 27 196 L 46 196 L 45 246 L 26 244 Z M 54 196 L 73 196 L 74 244 L 55 246 Z',
  },
]

// Back-view muscle paths (viewBox "0 0 100 248")
const BACK_MUSCLES: MuscleDef[] = [
  {
    muscleId: 'upper_back',
    d: 'M 24 38 L 76 38 L 74 82 L 26 82 Z',
  },
  {
    muscleId: 'lats',
    d: 'M 9 52 L 25 48 L 27 108 L 7 114 Z M 75 48 L 91 52 L 93 114 L 73 108 Z',
  },
  {
    muscleId: 'lower_back',
    d: 'M 28 84 L 72 84 L 74 114 L 26 114 Z',
  },
  {
    muscleId: 'rear_delts',
    d: 'M 11 37 L 24 36 L 23 57 L 9 55 Z M 76 36 L 89 37 L 91 55 L 77 57 Z',
  },
  {
    muscleId: 'triceps',
    d: 'M 6 57 L 14 55 L 13 96 L 5 94 Z M 86 55 L 94 57 L 95 94 L 87 96 Z',
  },
  {
    muscleId: 'glutes',
    d: 'M 26 116 L 74 116 L 76 156 L 24 156 Z',
  },
  {
    muscleId: 'hamstrings',
    d: 'M 26 158 L 47 158 L 46 216 L 25 214 Z M 53 158 L 74 158 L 75 214 L 54 216 Z',
  },
  {
    muscleId: 'calves',
    d: 'M 26 218 L 46 218 L 45 246 L 25 244 Z M 54 218 L 74 218 L 75 244 L 55 246 Z',
  },
]

// Shared body silhouette background shapes (same for front and back)
function BodySilhouette() {
  const fill = '#E5E7EB'
  const stroke = '#9CA3AF'
  const sw = '0.5'

  return (
    <>
      {/* Head */}
      <ellipse cx="50" cy="14" rx="12" ry="14" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Neck */}
      <path d="M 44 27 L 56 27 L 57 37 L 43 37 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Torso */}
      <path d="M 22 36 L 78 36 L 74 115 L 26 115 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left upper arm */}
      <path d="M 7 36 L 22 36 L 20 100 L 5 98 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right upper arm */}
      <path d="M 78 36 L 93 36 L 95 98 L 80 100 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left forearm */}
      <path d="M 4 100 L 19 100 L 18 142 L 3 140 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right forearm */}
      <path d="M 81 100 L 96 98 L 97 140 L 82 142 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left leg */}
      <path d="M 26 115 L 49 115 L 48 248 L 25 246 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right leg */}
      <path d="M 51 115 L 74 115 L 75 246 L 52 248 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
    </>
  )
}

type BodyViewProps = {
  label: string
  muscles: MuscleDef[]
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

function BodyView({ label, muscles, fatigueState, onMuscleClick, onMuscleHover }: BodyViewProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <svg
        viewBox="0 0 100 248"
        className="h-auto w-40"
        aria-label={`${label} body view`}
      >
        <BodySilhouette />
        {muscles.map(({ muscleId, d }) => (
          <MuscleGroupPath
            key={muscleId}
            muscleId={muscleId}
            d={d}
            fatigueValue={fatigueState[muscleId]}
            onClick={onMuscleClick ? () => onMuscleClick(muscleId) : undefined}
            onMouseEnter={() => onMuscleHover?.(muscleId)}
            onMouseLeave={() => onMuscleHover?.(null)}
          />
        ))}
      </svg>
    </div>
  )
}

type BodyDiagramProps = {
  fatigueState: FatigueState
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

export function BodyDiagram({ fatigueState, onMuscleClick, onMuscleHover }: BodyDiagramProps) {
  return (
    <div className="flex gap-6">
      <BodyView
        label="Front"
        muscles={FRONT_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
      <BodyView
        label="Back"
        muscles={BACK_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
    </div>
  )
}
