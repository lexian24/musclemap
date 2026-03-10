import {
  applySetFatigue,
  decayFatigue,
  emptyFatigueState,
  fatigueToColor,
  formatFatigue,
  getIntensityZone,
  getSessionSfrMultiplier,
  recalculateFatigue,
} from './fatigue'

describe('emptyFatigueState', () => {
  it('returns 0 for all muscles', () => {
    const state = emptyFatigueState()
    for (const value of Object.values(state)) {
      expect(value).toBe(0)
    }
  })

  it('contains all expected muscle groups', () => {
    const state = emptyFatigueState()
    expect(state).toHaveProperty('chest')
    expect(state).toHaveProperty('quads')
    expect(state).toHaveProperty('calves')
  })
})

describe('applySetFatigue', () => {
  it('adds fatigue proportional to intensity and volume', () => {
    const state = emptyFatigueState()
    // 3 sets × 10 reps = 1.0 volume unit, intensity 0.8 → delta 0.8
    const next = applySetFatigue(state, [{ muscle: 'chest', intensity: 0.8 }], 3, 10)
    expect(next.chest).toBeCloseTo(0.8)
  })

  it('does not exceed 1.0', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(state, [{ muscle: 'chest', intensity: 1.0 }], 30, 10)
    expect(next.chest).toBe(1)
  })

  it('only affects targeted muscles', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(state, [{ muscle: 'biceps', intensity: 0.5 }], 3, 10)
    expect(next.chest).toBe(0)
    expect(next.biceps).toBeGreaterThan(0)
  })

  it('accumulates fatigue from multiple muscles', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(
      state,
      [
        { muscle: 'chest', intensity: 0.8 },
        { muscle: 'triceps', intensity: 0.4 },
      ],
      3,
      10,
    )
    expect(next.chest).toBeCloseTo(0.8)
    expect(next.triceps).toBeCloseTo(0.4)
  })
})

describe('decayFatigue', () => {
  it('reduces fatigue over time', () => {
    const state = { ...emptyFatigueState(), chest: 1.0 }
    // 10 hours elapsed
    const next = decayFatigue(state, 10 * 3_600_000)
    expect(next.chest).toBeLessThan(1.0)
  })

  it('does not go below 0', () => {
    const state = { ...emptyFatigueState(), chest: 0.01 }
    // 100 hours elapsed
    const next = decayFatigue(state, 100 * 3_600_000)
    expect(next.chest).toBe(0)
  })

  it('returns 0 fatigue for fresh muscles', () => {
    const state = emptyFatigueState()
    const next = decayFatigue(state, 5 * 3_600_000)
    for (const value of Object.values(next)) {
      expect(value).toBe(0)
    }
  })
})

describe('recalculateFatigue', () => {
  it('returns empty state when no sets logged', () => {
    const state = recalculateFatigue([])
    for (const value of Object.values(state)) {
      expect(value).toBe(0)
    }
  })

  it('accumulates fatigue correctly across multiple sets on the same muscle', () => {
    const now = new Date()
    // Two chest sets logged: first 3h ago, second 1h ago
    const firstSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.5 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 3 * 3_600_000),
    }
    const secondSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.5 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 1 * 3_600_000),
    }
    const state = recalculateFatigue([firstSet, secondSet], now)
    // The second set should add to (not replace) the first set's remaining fatigue.
    // With correct forward-simulation, chest should be higher than a single set 1h ago.
    const singleSetState = recalculateFatigue([secondSet], now)
    expect(state.chest).toBeGreaterThan(singleSetState.chest)
  })

  it('reflects recent sets with more fatigue than old sets', () => {
    const now = new Date()
    const recentSet = {
      muscles: [{ muscle: 'chest' as const, intensity: 0.8 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 1 * 3_600_000), // 1 hour ago
    }
    const oldSet = {
      muscles: [{ muscle: 'quads' as const, intensity: 0.8 }],
      sets: 3,
      reps: 10,
      loggedAt: new Date(now.getTime() - 20 * 3_600_000), // 20 hours ago
    }
    const state = recalculateFatigue([recentSet, oldSet], now)
    expect(state.chest).toBeGreaterThan(state.quads)
  })
})

describe('fatigueToColor', () => {
  it('returns white for 0 fatigue', () => {
    expect(fatigueToColor(0)).toBe('#ffffff')
  })

  it('returns deep red for 1.0 fatigue', () => {
    expect(fatigueToColor(1)).toBe('#8b0000')
  })

  it('returns a value between white and deep red for mid fatigue', () => {
    const color = fatigueToColor(0.5)
    expect(color).toMatch(/^#[0-9a-f]{6}$/)
    expect(color).not.toBe('#ffffff')
    expect(color).not.toBe('#8b0000')
  })

  it('clamps values above 1.0', () => {
    expect(fatigueToColor(1.5)).toBe(fatigueToColor(1.0))
  })

  it('clamps values below 0', () => {
    expect(fatigueToColor(-0.5)).toBe(fatigueToColor(0))
  })
})

describe('formatFatigue', () => {
  it('rounds to 2 decimal places', () => {
    expect(formatFatigue(0.12345)).toBe(0.12)
    expect(formatFatigue(0.999)).toBe(1)
    expect(formatFatigue(0.005)).toBe(0.01)
  })
})

describe('getIntensityZone', () => {
  it('returns Very Light zone for effort ratio 0.3', () => {
    expect(getIntensityZone(0.3).label).toBe('Very Light')
  })

  it('returns Light zone for effort ratio 0.5', () => {
    // 0.5 is the minEffort of Light (and maxEffort of Very Light, exclusive)
    expect(getIntensityZone(0.5).label).toBe('Light')
  })

  it('returns Moderate zone for effort ratio 0.7', () => {
    expect(getIntensityZone(0.7).label).toBe('Moderate')
  })

  it('returns Heavy zone for effort ratio 0.8', () => {
    expect(getIntensityZone(0.8).label).toBe('Heavy')
  })

  it('returns Very Heavy zone for effort ratio 0.9', () => {
    expect(getIntensityZone(0.9).label).toBe('Very Heavy')
  })

  it('returns Max Effort zone for effort ratio 1.0', () => {
    expect(getIntensityZone(1.0).label).toBe('Max Effort')
  })
})

describe('getSessionSfrMultiplier', () => {
  it('returns 1.0 for sets 1 through 4', () => {
    expect(getSessionSfrMultiplier(1)).toBe(1.0)
    expect(getSessionSfrMultiplier(2)).toBe(1.0)
    expect(getSessionSfrMultiplier(3)).toBe(1.0)
    expect(getSessionSfrMultiplier(4)).toBe(1.0)
  })

  it('returns 1.3 for sets 5 and 6', () => {
    expect(getSessionSfrMultiplier(5)).toBe(1.3)
    expect(getSessionSfrMultiplier(6)).toBe(1.3)
  })

  it('returns 1.6 for 7 or more sets', () => {
    expect(getSessionSfrMultiplier(7)).toBe(1.6)
    expect(getSessionSfrMultiplier(10)).toBe(1.6)
    expect(getSessionSfrMultiplier(20)).toBe(1.6)
  })
})

describe('applySetFatigue — intensity zone path', () => {
  it('generates more fatigue at high effort (0.9) than at low effort (0.5) for same sets', () => {
    const state = emptyFatigueState()
    // Use low intensity (0.1) so neither result caps at 1.0, allowing clear comparison
    const muscles = [{ muscle: 'chest' as const, intensity: 0.1 }]
    // userMax = 20 activates the new intensity-zone path
    const highEffort = applySetFatigue(state, muscles, 1, 18, 20) // effortRatio = 0.9 → Very Heavy, multiplier 1.8
    const lowEffort  = applySetFatigue(state, muscles, 1, 10, 20) // effortRatio = 0.5 → Light, multiplier 0.85
    expect(highEffort.chest).toBeGreaterThan(lowEffort.chest)
  })

  it('5th set of same muscle generates more fatigue than 1st set (SFR diminishing returns)', () => {
    const state = emptyFatigueState()
    const muscles = [{ muscle: 'chest' as const, intensity: 1.0 }]
    const userMax = 20
    const reps = 14 // effortRatio = 0.7 (Moderate zone)

    // First set: sessionSetCounts = {} → setNumber 1 → SFR 1.0
    const firstSet = applySetFatigue(state, muscles, 1, reps, userMax, {})

    // Fifth set: sessionSetCounts = { chest: 4 } → setNumber 5 → SFR 1.3
    const fifthSet = applySetFatigue(state, muscles, 1, reps, userMax, { chest: 4 })

    expect(fifthSet.chest).toBeGreaterThan(firstSet.chest)
  })

  it('existing tests without userMax still use old VOLUME_NORMALISER path', () => {
    const state = emptyFatigueState()
    // 3 sets × 10 reps / 30 (VOLUME_NORMALISER) = 1.0 volume; intensity 0.8 → 0.8
    const next = applySetFatigue(state, [{ muscle: 'chest', intensity: 0.8 }], 3, 10)
    expect(next.chest).toBeCloseTo(0.8)
  })

  it('calibration: 15 moderate-effort sets of a primary muscle should reach ~100% fatigue', () => {
    // Design target: effortRatio ≈ 0.67 (40/60 reps), Moderate zone (1.0×),
    // chest intensity 0.8 (push-ups primary), no prior sets today.
    // Expected: chest ≈ 1.0 (fully destroyed) after a full 15-set chest session.
    const state = emptyFatigueState()
    const userMax = 60
    const reps = 40 // effortRatio = 0.667 → Moderate zone
    const next = applySetFatigue(
      state,
      [{ muscle: 'chest' as const, intensity: 0.8 }],
      15,
      reps,
      userMax,
      {},
    )
    expect(next.chest).toBeCloseTo(1.0, 1)
  })

  it('calibration: 3 moderate-effort sets should produce ~20% chest fatigue, not max', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(
      state,
      [{ muscle: 'chest' as const, intensity: 0.8 }],
      3,
      40,
      60, // userMax
      {},
    )
    expect(next.chest).toBeGreaterThan(0.1)
    expect(next.chest).toBeLessThan(0.4)
  })

  it('calf raises: max=30, 3×15 should produce ~14% calves fatigue, NOT 100%', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(
      state,
      [{ muscle: 'calves' as const, intensity: 0.9 }],
      3,
      15,
      30, // userMax
      {},
    )
    // effortRatio = 15/30 = 0.5 → Light zone (0.85×)
    // sfrSum = 1.0 + 1.0 + 1.0 = 3.0
    // volume = (0.5 × 0.85 × 3.0) / 8 = 0.159
    // delta = 0.9 × 0.159 = 0.143
    expect(next.calves).toBeCloseTo(0.143, 2)
    expect(next.calves).toBeLessThan(0.2)
  })

  it('without userMax, old formula produces 100% for 3×15 calves (the bug)', () => {
    const state = emptyFatigueState()
    const next = applySetFatigue(
      state,
      [{ muscle: 'calves' as const, intensity: 0.9 }],
      3,
      15,
      undefined, // NO userMax → old VOLUME_NORMALISER path
      {},
    )
    // volume = (3×15)/30 = 1.5, delta = 0.9 × 1.5 = 1.35, capped at 1.0
    expect(next.calves).toBe(1.0)
  })
})

describe('recalculateFatigue — end-to-end', () => {
  it('calf raises scenario: max=30, 3×15 via recalculateFatigue returns ~14%', () => {
    const now = new Date('2026-03-10T12:00:00Z')
    const setTime = new Date('2026-03-10T11:59:59Z') // 1 second ago
    const result = recalculateFatigue(
      [
        {
          muscles: [{ muscle: 'calves' as const, intensity: 0.9 }],
          sets: 3,
          reps: 15,
          loggedAt: setTime,
          userMax: 30,
        },
      ],
      now,
    )
    expect(result.calves).toBeCloseTo(0.143, 2)
    expect(result.calves).toBeLessThan(0.2)
  })

  it('calf raises scenario WITHOUT userMax via recalculateFatigue hits 100%', () => {
    const now = new Date('2026-03-10T12:00:00Z')
    const setTime = new Date('2026-03-10T11:59:59Z')
    const result = recalculateFatigue(
      [
        {
          muscles: [{ muscle: 'calves' as const, intensity: 0.9 }],
          sets: 3,
          reps: 15,
          loggedAt: setTime,
          userMax: undefined, // Missing userMax triggers the old path
        },
      ],
      now,
    )
    expect(result.calves).toBeCloseTo(1.0, 1)
  })
})
