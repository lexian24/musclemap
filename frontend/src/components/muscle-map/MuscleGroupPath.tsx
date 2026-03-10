'use client'

import { useState } from 'react'
import { fatigueToColor, muscleLabel } from '@/lib/fatigue'
import type { MuscleGroup } from '@/types'

type MuscleGroupPathProps = {
  muscleId: MuscleGroup
  d: string
  fatigueValue: number
  clipPathId?: string
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export function MuscleGroupPath({
  muscleId,
  d,
  fatigueValue,
  clipPathId,
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

  // Resting: visible medium gray (#9CA3AF) at good opacity against the dark (#151C24) body.
  // #9CA3AF at 0.75 opacity over #151C24 ≈ #6B737F — clearly distinguishable gray.
  // Fatigued: full crimson color scale, opacity scales 0.80→1.0 with fatigue level.
  const restingFill = '#9CA3AF'
  const restingOpacity = 0.75
  const fatiguedOpacity = 0.82 + fatigueValue * 0.18  // 0.82 → 1.0

  const fillOpacity = hasSignificantFatigue ? fatiguedOpacity : restingOpacity

  // Glow filter for high-fatigue muscles
  let filter = 'none'
  if (hovered && hasHighFatigue) {
    filter = `drop-shadow(0 0 4px ${color}cc) brightness(1.15)`
  } else if (hovered) {
    filter = 'brightness(1.25)'
  } else if (hasHighFatigue) {
    filter = `drop-shadow(0 0 3px ${color}88)`
  }

  return (
    <path
      d={d}
      clipPath={clipPathId ? `url(#${clipPathId})` : undefined}
      stroke={hasSignificantFatigue ? color : '#6B7280'}
      strokeWidth="1"
      strokeOpacity={hasSignificantFatigue ? 0.5 : 0.6}
      style={{
        fill: hasSignificantFatigue ? color : restingFill,
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
