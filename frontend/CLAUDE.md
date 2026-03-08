# Frontend — MuscleMap

## Stack
Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3, shadcn/ui,
Supabase JS client v2, TanStack Query v5, Zod, Jest + Testing Library

## Directory Structure
```
src/
  app/                  # Next.js App Router pages
    (auth)/             # login, signup pages
    (dashboard)/        # protected pages
    api/                # API routes (webhooks, etc)
  components/
    ui/                 # shadcn components (never modify)
    muscle-map/         # SVG body diagram components
    exercises/          # exercise logging components
    layout/             # navbar, sidebar, etc
  lib/
    constants.ts        # muscle recovery times, color thresholds
    fatigue.ts          # fatigue decay algorithm (pure functions)
    db/                 # all Supabase query functions
      exercises.ts
      sessions.ts
      fatigue.ts
    supabase/
      client.ts         # browser client
      server.ts         # server client (RSC + Server Actions)
  hooks/                # custom React hooks
  types/                # shared TypeScript types
```

## Core Domain Types
```typescript
type MuscleGroup =
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'upper_back' | 'lats' | 'lower_back'
  | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves'

type MuscleActivation = {
  muscle: MuscleGroup
  intensity: number  // 0.0 to 1.0 — how hard this muscle worked
}

type Exercise = {
  id: string
  name: string
  muscles: MuscleActivation[]
}

type FatigueState = Record<MuscleGroup, number>  // 0.0 (fresh) to 1.0 (destroyed)
```

## Fatigue Color Scale
- 0.0 → white (#FFFFFF) — fully recovered
- 0.25 → light pink (#FFD6D6)
- 0.5 → medium red (#FF8080)
- 0.75 → dark red (#FF2020)
- 1.0 → deep red (#8B0000) — maximum fatigue

## Key Business Rules
- Fatigue decays over time: muscles recover at ~0.05 per hour (configurable in constants.ts)
- Logging a set adds fatigue: `newFatigue = min(1.0, currentFatigue + intensity * volume)`
- Volume = sets × reps, normalized (e.g. 3×10 = 1.0 volume unit)
- Fatigue is per-user, persisted in Supabase, calculated fresh on load
- Guest users get local state only (no persistence)

## Supabase Conventions
- Use server client in Server Components and Server Actions
- Use browser client only in Client Components that need realtime
- All DB functions in `src/lib/db/` — never query Supabase directly in components
- Row Level Security is ON for all tables — never disable it

## Testing
- Pure functions (fatigue.ts, constants.ts) get unit tests
- Components get integration tests with Testing Library
- Test files live next to source files: `fatigue.test.ts`
- Run tests before every commit