'use client'

import type { FatigueState, MuscleGroup } from '@/types'
import { MuscleGroupPath } from './MuscleGroupPath'

// ─── Coordinate system: viewBox "0 0 100 260" ───────────────────────────────
// The approach: each muscle gets a clipPath matching its body region so
// paths cannot escape the silhouette even if slightly imprecise.
//
// Body regions (approximate boundaries):
//   Torso:      x 18–82, y 36–118   (wide at shoulders, narrows at waist)
//   L upper arm: x 4–21, y 44–100
//   R upper arm: x 79–96, y 44–100
//   L forearm:  x 3–18,  y 100–142
//   R forearm:  x 82–97, y 100–142
//   L thigh:    x 24–49, y 116–196
//   R thigh:    x 51–76, y 116–196
//   L lower leg: x 25–48, y 196–256
//   R lower leg: x 52–75, y 196–256
// ─────────────────────────────────────────────────────────────────────────────

type MuscleDef = {
  muscleId: MuscleGroup
  d: string
  clipPathId: string
}

// ── Clip-path IDs used by both views (front and back share the same geometry)
const CP = {
  torso:       'cp-torso',
  lArm:        'cp-l-arm',
  rArm:        'cp-r-arm',
  lForearm:    'cp-l-forearm',
  rForearm:    'cp-r-forearm',
  lThigh:      'cp-l-thigh',
  rThigh:      'cp-r-thigh',
  lLowerLeg:   'cp-l-lower-leg',
  rLowerLeg:   'cp-r-lower-leg',
  lShoulder:   'cp-l-shoulder',  // torso + top of arm union (for delts)
  rShoulder:   'cp-r-shoulder',
} as const

// ── Silhouette paths (shared between front + back views) ─────────────────────
const TORSO_PATH   = 'M 19 36 Q 50 28 81 36 Q 77 60 75 82 Q 69 90 67 118 L 33 118 Q 31 90 25 82 Q 23 60 19 36 Z'
const L_ARM_PATH   = 'M 5 44 Q 12 40 21 44 Q 21 72 19 100 Q 12 103 5 100 Q 3 72 4 56 Z'
const R_ARM_PATH   = 'M 95 44 Q 88 40 79 44 Q 79 72 81 100 Q 88 103 95 100 Q 97 72 96 56 Z'
const L_FORE_PATH  = 'M 4 101 Q 12 99 19 101 Q 18 128 16 140 Q 9 143 4 140 Q 3 126 3 107 Z'
const R_FORE_PATH  = 'M 96 101 Q 88 99 81 101 Q 82 128 84 140 Q 91 143 97 140 Q 97 126 97 107 Z'
const L_THIGH_PATH = 'M 25 118 Q 37 115 49 118 Q 50 152 48 194 Q 39 198 30 196 Q 23 154 23 132 Z'
const R_THIGH_PATH = 'M 75 118 Q 63 115 51 118 Q 50 152 52 194 Q 61 198 70 196 Q 77 154 77 132 Z'
const L_LOWER_PATH = 'M 26 196 Q 38 193 48 196 Q 47 230 44 252 Q 37 257 30 255 Q 25 230 25 207 Z'
const R_LOWER_PATH = 'M 74 196 Q 62 193 52 196 Q 53 230 56 252 Q 63 257 70 255 Q 75 230 75 207 Z'
// Shoulder clip = union of torso + arm (for deltoids which bridge the joint)
const L_SHOULDER_PATH = 'M 5 38 Q 20 33 50 30 Q 80 33 95 38 L 21 44 Q 21 72 19 100 Q 12 103 5 100 Q 3 72 4 56 Z M 19 36 Q 50 28 81 36 L 67 118 L 33 118 Q 25 82 19 36 Z'

// Front-view muscle paths
const FRONT_MUSCLES: MuscleDef[] = [
  {
    muscleId: 'chest',
    clipPathId: CP.torso,
    d: [
      // Left pec — curved lower border, fills upper-left chest
      'M 26 43 Q 37 40 49 42 L 48 70 Q 40 76 27 70 Q 24 62 25 52 Z',
      // Right pec — mirror
      'M 74 43 Q 63 40 51 42 L 52 70 Q 60 76 73 70 Q 76 62 75 52 Z',
    ].join(' '),
  },
  {
    muscleId: 'front_delts',
    clipPathId: CP.torso,
    d: [
      // Left front delt — rounded cap bridging neck/torso to arm
      'M 20 38 Q 28 34 34 39 Q 31 52 24 58 Q 17 56 16 48 Q 17 42 20 38 Z',
      // Right front delt
      'M 80 38 Q 72 34 66 39 Q 69 52 76 58 Q 83 56 84 48 Q 83 42 80 38 Z',
    ].join(' '),
  },
  {
    muscleId: 'side_delts',
    clipPathId: CP.lArm,  // clipped to arm, straddles the shoulder
    d: [
      // Left side delt — outer cap of shoulder
      'M 6 47 Q 10 43 16 46 Q 15 60 11 64 Q 5 62 5 54 Z',
    ].join(' '),
  },
  {
    // We render side_delts twice (L and R each need different clip)
    muscleId: 'side_delts',
    clipPathId: CP.rArm,
    d: 'M 94 47 Q 90 43 84 46 Q 85 60 89 64 Q 95 62 95 54 Z',
  },
  {
    muscleId: 'biceps',
    clipPathId: CP.lArm,
    d: [
      'M 7 58 Q 14 55 19 59 Q 19 78 17 97 Q 11 100 7 97 Q 5 80 6 67 Z',
    ].join(' '),
  },
  {
    muscleId: 'biceps',
    clipPathId: CP.rArm,
    d: 'M 93 58 Q 86 55 81 59 Q 81 78 83 97 Q 89 100 93 97 Q 95 80 94 67 Z',
  },
  {
    muscleId: 'forearms',
    clipPathId: CP.lForearm,
    d: 'M 5 103 Q 13 101 18 103 Q 17 127 15 138 Q 9 141 5 138 Q 4 125 4 109 Z',
  },
  {
    muscleId: 'forearms',
    clipPathId: CP.rForearm,
    d: 'M 95 103 Q 87 101 82 103 Q 83 127 85 138 Q 91 141 96 138 Q 97 125 96 109 Z',
  },
  {
    muscleId: 'abs',
    clipPathId: CP.torso,
    d: [
      // 6 blocks (3 rows × 2 columns) with subtle rounding
      // Row 1
      'M 37 74 Q 47 73 47 74 L 47 86 Q 47 87 36 87 L 36 75 Q 36 74 37 74 Z',
      'M 53 74 Q 53 73 63 74 L 64 75 L 64 87 Q 53 87 53 87 L 53 74 Z',
      // Row 2
      'M 36 89 Q 47 88 47 89 L 47 101 Q 47 102 35 102 L 35 90 Q 35 89 36 89 Z',
      'M 53 89 Q 53 88 65 89 L 65 90 L 65 102 Q 53 102 53 101 L 53 89 Z',
      // Row 3
      'M 35 104 Q 46 103 46 104 L 46 116 Q 46 117 34 117 L 34 105 Q 34 104 35 104 Z',
      'M 54 104 Q 54 103 66 104 L 66 105 L 66 117 Q 54 117 54 116 L 54 104 Z',
    ].join(' '),
  },
  {
    muscleId: 'obliques',
    clipPathId: CP.torso,
    d: [
      // Left oblique — diagonal slant down side of torso
      'M 22 76 Q 28 72 36 75 Q 35 102 33 116 Q 26 118 22 114 Q 20 98 21 84 Z',
      // Right oblique
      'M 78 76 Q 72 72 64 75 Q 65 102 67 116 Q 74 118 78 114 Q 80 98 79 84 Z',
    ].join(' '),
  },
  {
    muscleId: 'quads',
    clipPathId: CP.lThigh,
    d: 'M 27 120 Q 37 117 48 120 Q 49 152 47 193 Q 38 197 29 194 Q 24 155 25 134 Z',
  },
  {
    muscleId: 'quads',
    clipPathId: CP.rThigh,
    d: 'M 73 120 Q 63 117 52 120 Q 51 152 53 193 Q 62 197 71 194 Q 76 155 75 134 Z',
  },
  {
    muscleId: 'calves',
    clipPathId: CP.lLowerLeg,
    d: 'M 27 198 Q 37 195 47 198 Q 46 226 43 250 Q 37 255 30 253 Q 26 228 26 209 Z',
  },
  {
    muscleId: 'calves',
    clipPathId: CP.rLowerLeg,
    d: 'M 73 198 Q 63 195 53 198 Q 54 226 57 250 Q 63 255 70 253 Q 74 228 74 209 Z',
  },
]

// Back-view muscle paths
const BACK_MUSCLES: MuscleDef[] = [
  {
    // Trapezius — diamond/kite covering entire upper back
    muscleId: 'upper_back',
    clipPathId: CP.torso,
    d: 'M 50 37 Q 68 40 75 50 Q 71 64 67 79 Q 58 83 50 82 Q 42 83 33 79 Q 29 64 25 50 Q 32 40 50 37 Z',
  },
  {
    // Lats — large wing-like sweep from armpit to lower back, left side
    muscleId: 'lats',
    clipPathId: CP.torso,
    d: [
      'M 20 50 Q 27 46 33 50 Q 35 76 34 106 Q 29 114 23 112 Q 19 106 19 90 Q 18 72 19 58 Z',
      'M 80 50 Q 73 46 67 50 Q 65 76 66 106 Q 71 114 77 112 Q 81 106 81 90 Q 82 72 81 58 Z',
    ].join(' '),
  },
  {
    // Erector spinae (lower back) — two vertical strips flanking spine
    muscleId: 'lower_back',
    clipPathId: CP.torso,
    d: [
      'M 36 84 Q 43 82 48 84 L 47 117 Q 43 119 36 117 Z',
      'M 64 84 Q 57 82 52 84 L 53 117 Q 57 119 64 117 Z',
    ].join(' '),
  },
  {
    // Rear deltoids — back of shoulder
    muscleId: 'rear_delts',
    clipPathId: CP.torso,
    d: [
      'M 20 39 Q 28 34 34 40 Q 31 54 24 59 Q 17 57 17 48 Z',
      'M 80 39 Q 72 34 66 40 Q 69 54 76 59 Q 83 57 83 48 Z',
    ].join(' '),
  },
  {
    // Triceps — back of upper arm, left
    muscleId: 'triceps',
    clipPathId: CP.lArm,
    d: 'M 7 58 Q 14 55 19 59 Q 19 79 17 97 Q 11 100 7 97 Q 5 80 6 67 Z',
  },
  {
    muscleId: 'triceps',
    clipPathId: CP.rArm,
    d: 'M 93 58 Q 86 55 81 59 Q 81 79 83 97 Q 89 100 93 97 Q 95 80 94 67 Z',
  },
  {
    // Glutes — two rounded shapes, left
    muscleId: 'glutes',
    clipPathId: CP.lThigh,
    d: 'M 26 120 Q 36 116 49 119 Q 51 134 48 155 Q 42 162 35 160 Q 25 156 24 142 Q 23 130 25 123 Z',
  },
  {
    muscleId: 'glutes',
    clipPathId: CP.rThigh,
    d: 'M 74 120 Q 64 116 51 119 Q 49 134 52 155 Q 58 162 65 160 Q 75 156 76 142 Q 77 130 75 123 Z',
  },
  {
    // Hamstrings — back of thigh, left
    muscleId: 'hamstrings',
    clipPathId: CP.lThigh,
    d: 'M 26 162 Q 36 158 48 162 Q 49 186 47 212 Q 39 216 31 214 Q 24 190 25 172 Z',
  },
  {
    muscleId: 'hamstrings',
    clipPathId: CP.rThigh,
    d: 'M 74 162 Q 64 158 52 162 Q 51 186 53 212 Q 61 216 69 214 Q 76 190 75 172 Z',
  },
  {
    // Calves (back) — gastrocnemius diamond shape, left
    muscleId: 'calves',
    clipPathId: CP.lLowerLeg,
    d: 'M 28 220 Q 37 216 47 220 Q 46 236 43 250 Q 37 254 31 252 Q 27 236 27 226 Z',
  },
  {
    muscleId: 'calves',
    clipPathId: CP.rLowerLeg,
    d: 'M 72 220 Q 63 216 53 220 Q 54 236 57 250 Q 63 254 69 252 Q 73 236 73 226 Z',
  },
]

// ── Body silhouette + clip path definitions ───────────────────────────────────
function BodySilhouette({ view }: { view: 'front' | 'back' }) {
  const fill = '#151C24'
  const stroke = '#2A3444'
  const sw = '0.5'

  return (
    <g>
      <defs>
        {/* Clip paths — each one matches the corresponding silhouette shape */}
        <clipPath id={CP.torso}>
          <path d={TORSO_PATH} />
        </clipPath>
        <clipPath id={CP.lArm}>
          <path d={L_ARM_PATH} />
        </clipPath>
        <clipPath id={CP.rArm}>
          <path d={R_ARM_PATH} />
        </clipPath>
        <clipPath id={CP.lForearm}>
          <path d={L_FORE_PATH} />
        </clipPath>
        <clipPath id={CP.rForearm}>
          <path d={R_FORE_PATH} />
        </clipPath>
        <clipPath id={CP.lThigh}>
          <path d={L_THIGH_PATH} />
        </clipPath>
        <clipPath id={CP.rThigh}>
          <path d={R_THIGH_PATH} />
        </clipPath>
        <clipPath id={CP.lLowerLeg}>
          <path d={L_LOWER_PATH} />
        </clipPath>
        <clipPath id={CP.rLowerLeg}>
          <path d={R_LOWER_PATH} />
        </clipPath>
        <clipPath id={CP.lShoulder}>
          <path d={L_SHOULDER_PATH} />
        </clipPath>
      </defs>

      {/* Head */}
      <ellipse cx="50" cy="13" rx="10" ry="12" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Neck */}
      <path d="M 46 24 L 54 24 L 55 37 L 45 37 Z" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Torso */}
      <path d={TORSO_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left upper arm */}
      <path d={L_ARM_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right upper arm */}
      <path d={R_ARM_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left forearm */}
      <path d={L_FORE_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right forearm */}
      <path d={R_FORE_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left hand (simplified) */}
      <ellipse cx="11" cy="146" rx="6" ry="8" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right hand */}
      <ellipse cx="89" cy="146" rx="6" ry="8" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left thigh */}
      <path d={L_THIGH_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right thigh */}
      <path d={R_THIGH_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left lower leg */}
      <path d={L_LOWER_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right lower leg */}
      <path d={R_LOWER_PATH} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Left foot */}
      <ellipse cx="34" cy="256" rx="9" ry="4" fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Right foot */}
      <ellipse cx="66" cy="256" rx="9" ry="4" fill={fill} stroke={stroke} strokeWidth={sw} />

      {/* Collarbone line (front only) */}
      {view === 'front' && (
        <path d="M 25 38 Q 50 33 75 38" fill="none" stroke="#3A4555" strokeWidth="0.4" opacity="0.6" />
      )}
      {/* Spine line (back only) */}
      {view === 'back' && (
        <path d="M 50 38 L 50 116" fill="none" stroke="#3A4555" strokeWidth="0.4" opacity="0.4" />
      )}
    </g>
  )
}

type BodyViewProps = {
  label: string
  muscles: MuscleDef[]
  fatigueState: FatigueState
  view: 'front' | 'back'
  onMuscleClick?: (muscle: MuscleGroup) => void
  onMuscleHover?: (muscle: MuscleGroup | null) => void
}

function BodyView({ label, muscles, fatigueState, view, onMuscleClick, onMuscleHover }: BodyViewProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/50">
        {label}
      </span>
      <svg
        viewBox="0 0 100 262"
        className="h-auto w-36"
        aria-label={`${label} body view`}
      >
        <BodySilhouette view={view} />
        {muscles.map(({ muscleId, d, clipPathId }, i) => (
          <MuscleGroupPath
            key={`${muscleId}-${i}`}
            muscleId={muscleId}
            d={d}
            clipPathId={clipPathId}
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
    <div className="flex gap-4 justify-center">
      <BodyView
        label="Front"
        view="front"
        muscles={FRONT_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
      <BodyView
        label="Back"
        view="back"
        muscles={BACK_MUSCLES}
        fatigueState={fatigueState}
        onMuscleClick={onMuscleClick}
        onMuscleHover={onMuscleHover}
      />
    </div>
  )
}
