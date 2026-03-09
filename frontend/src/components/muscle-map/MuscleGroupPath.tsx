'use client'

import { useState } from 'react'
import { fatigueToColor, muscleLabel } from '@/lib/fatigue'
import type { MuscleGroup } from '@/types'

type MuscleGroupPathProps = {
  muscleId: MuscleGroup
  d: string
  fatigueValue: number
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function MuscleGroupPath({
  muscleId,
  d,
  fatigueValue,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MuscleGroupPathProps) {
  const [hovered, setHovered] = useState(false)
  const color = fatigueToColor(fatigueValue)
  const label = muscleLabel(muscleId)

  const hasSignificantFatigue = fatigueValue > 0.05
  const hasHighFatigue = fatigueValue > 0.5

  function handleMouseEnter() {
    setHovered(true)
    onMouseEnter?.()
  }

  function handleMouseLeave() {
    setHovered(false)
    onMouseLeave?.()
  }

  // When at rest: subtle dark overlay to delineate muscle boundaries
  // When fatigued: progressively brighter crimson tones
  const fillOpacity = hasSignificantFatigue
    ? 0.78 + fatigueValue * 0.2   // 0.79 → 1.0 as fatigue climbs
    : 0.45                         // subtle resting overlay

  // Build drop-shadow glow filter for high fatigue muscles
  let filter = 'none'
  if (hovered && hasHighFatigue) {
    filter = `drop-shadow(0 0 4px ${color}cc) brightness(1.2)`
  } else if (hovered) {
    filter = 'brightness(1.3)'
  } else if (hasHighFatigue) {
    filter = `drop-shadow(0 0 3px ${color}88)`
  }

  return (
    <path
      d={d}
      stroke={hasSignificantFatigue ? color : '#4B5563'}
      strokeWidth={hasSignificantFatigue ? '0.5' : '0.4'}
      strokeOpacity={hasSignificantFatigue ? 0.6 : 0.7}
      style={{
        fill: hasSignificantFatigue ? color : '#374151',
        fillOpacity,
        transition: 'fill 0.5s ease, fill-opacity 0.5s ease, filter 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        filter,
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={`${label}: ${Math.round(fatigueValue * 100)}% fatigued`}
    />
  )
}
