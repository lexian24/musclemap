# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
MuscleMap v1.0 — a calisthenics workout tracker. Users log exercises and sets, and see an anatomical SVG body diagram where muscle groups glow from gray (fully recovered) to deep crimson (heavily fatigued), fading back over time as muscles recover. Fatigue intensity is science-based (Israetel SFR model, Schoenfeld meta-analyses).

## Architecture
- Single Next.js 14 app (App Router, TypeScript 5) — no separate backend
- Supabase for database, auth, and realtime (JS client v2)
- Tailwind CSS 3, shadcn/ui, TanStack Query v5, Zod
- Vercel for deployment, GitHub Actions for CI/CD
- Dark theme by default (no light mode) — charcoal `#0F1117`, crimson `#DC2626`

## Key Directories
- `frontend/` — the entire Next.js app
- `frontend/supabase/migrations/` — SQL schema migrations (run in Supabase dashboard)
- `frontend/supabase/seed.sql` — exercise catalogue seed (43 exercises)
- `.claude/commands/` — reusable slash command workflows
- `.github/workflows/` — CI/CD pipelines

Within `frontend/src/`:
- `app/` — App Router pages: `(auth)/` login/signup, `(dashboard)/` protected pages, `api/` routes
- `components/ui/` — shadcn components (never modify directly)
- `components/muscle-map/` — SVG body diagram: `BodyDiagram.tsx`, `MuscleGroupPath.tsx`, `FatigueMap.tsx`
- `components/dashboard/` — `DashboardClient.tsx`, `WeeklyVolumePanel.tsx`
- `components/exercises/` — `ExerciseGrid.tsx`, `ExerciseCard.tsx`, `SetLogger.tsx`, `LoggedSetsList.tsx`
- `components/feedback/` — `FeedbackForm.tsx`
- `lib/constants.ts` — ALL numeric constants: decay rates, intensity zones, color stops, weekly volume targets, `SET_FATIGUE_SCALE`, `FATIGUE_LOOKBACK_HOURS`
- `lib/fatigue.ts` — fatigue algorithm (pure functions, fully unit-tested, 36 tests)
- `lib/db/` — Supabase query functions: `exercises.ts`, `sessions.ts` (`getTodaySets`, `getRecentSets`), `fatigue.ts` (`getFatigueState` with decay-on-read), `userMaxes.ts`
- `lib/supabase/client.ts` — browser Supabase client (Client Components + realtime)
- `lib/supabase/server.ts` — server Supabase client (RSC + Server Actions)

## Essential Commands
```bash
cd frontend && npm run dev          # start dev server
cd frontend && npm run build        # production build
cd frontend && npm run typecheck    # tsc --noEmit
cd frontend && npm run lint         # eslint
cd frontend && npm test             # jest (36 tests)
cd frontend && npm run test:watch   # jest --watch
```

To run a single test file: `cd frontend && npm test -- path/to/file.test.ts`

## Environment Variables
Copy `.env.example` to `frontend/.env.local`. Required vars:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose to client
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

## Database Schema (v1.0)
Tables (all with RLS enabled):
- `exercises` — id, name, muscles (jsonb), category ('push'|'pull'|'core'|'legs'), unit ('reps'|'seconds')
- `workout_sessions` — id, user_id, logged_at
- `logged_sets` — id, session_id, exercise_id, sets, reps, logged_at
- `muscle_fatigue_cache` — user_id, muscle_group, fatigue_value, last_updated
- `user_exercise_maxes` — user_id, exercise_id, max_value, updated_at (PK: user_id+exercise_id)
- `feedback` — id, user_id, type ('bug'|'feature'|'general'), message, created_at

Migrations in `frontend/supabase/migrations/` — run in order in Supabase SQL editor.

## Core Domain Model

```typescript
type MuscleGroup =
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'upper_back' | 'lats' | 'lower_back'
  | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves'

type MuscleActivation = { muscle: MuscleGroup; intensity: number }  // intensity: 0.0–1.0
type FatigueState = Record<MuscleGroup, number>   // 0.0 (fresh) → 1.0 (destroyed)
type Exercise = { id; name; muscles: MuscleActivation[]; unit?: 'reps'|'seconds'; category? }
type UserExerciseMax = { exerciseId: string; maxValue: number }
type WeeklyVolume = Partial<Record<MuscleGroup, number>>
```

## Fatigue Model (Science-Based — v1.0)

### Volume calculation
When `userMax` is provided:
```
effortRatio = min(1, reps / userMax)                    // 0–1 proxy for % 1RM
zone = getIntensityZone(effortRatio)                    // one of 6 zones
sfrSum = Σ getSessionSfrMultiplier(startSet + i)        // summed per individual set
volume = (effortRatio × zone.fatigueMultiplier × sfrSum) / SET_FATIGUE_SCALE
delta = muscle_intensity × volume
```
Calibration: `SET_FATIGUE_SCALE = 8` → 15 moderate-effort sets of a primary muscle (intensity 0.8, effortRatio 0.67) = 1.0 fatigue. SFR is applied per individual set (not per entry) so sets 5, 6, 7+ each get their own increasing penalty.

Without `userMax` (backward-compat fallback):
```
volume = (sets × reps) / VOLUME_NORMALISER    // VOLUME_NORMALISER = 30
```

### Intensity zones (effortRatio → fatigueMultiplier)
- Very Light (<50%): 0.7×
- Light (50–65%): 0.85×
- Moderate (65–75%): 1.0× (baseline)
- Heavy (75–85%): 1.4×
- Very Heavy (85–92%): 1.8×
- Max Effort (92%+): 2.2×

### Session SFR cap (diminishing returns)
- Sets 1–4 of a muscle per session: 1.0×
- Sets 5–6: 1.3×
- Sets 7+: 1.6×

### Fatigue decay
`decay = FATIGUE_DECAY_PER_HOUR × MUSCLE_RECOVERY_MULTIPLIERS[muscle] × elapsedHours`

Key multipliers: lower_back/hamstrings 0.25 (80h), quads/glutes 0.28 (72h),
chest/lats/upper_back 0.33 (60h), biceps/triceps 0.42 (48h), abs/obliques/forearms 0.83 (24h).

### recalculateFatigue
Forward-simulation: processes sets oldest-first, decays from set-to-set (not set-to-now).
Tracks session set counts per muscle per UTC day for SFR multipliers.
Fed from `getRecentSets` (past `FATIGUE_LOOKBACK_HOURS = 96h`) on every log/delete, so
previous-day fatigue carries forward correctly across multi-day sessions.

### computeFatigueFromHistory (page load)
Recomputes fatigue fresh from `getRecentSets` + `getUserMaxes` on every page load,
bypassing the cache entirely. This prevents stale cached values from old formula runs.
`getFatigueState` (cache + decay) exists as a lighter alternative but is not used on the dashboard.

## Fatigue Color Scale
- 0.0 → `#FFFFFF` (white — fully recovered)
- 0.25 → `#FFD6D6` (light pink)
- 0.5 → `#FF8080` (medium red)
- 0.75 → `#FF2020` (dark red)
- 1.0 → `#8B0000` (deep red — maximum fatigue)
- Resting muscle overlay: `#9CA3AF` at 75% opacity (visible gray anatomy)

## SVG Body Diagram
- ViewBox: `0 0 100 262`, two views (front/back), each `w-36`
- Each muscle has a `clipPathId` matching its body region — muscles cannot escape the silhouette
- Body silhouette fill: `#151C24` (near-black), stroke: `#2A3444`
- `MuscleGroupPath`: resting = `#9CA3AF` at 0.75 opacity; fatigued = color scale at 0.82–1.0 opacity + drop-shadow glow at >50% fatigue

## Weekly Volume Targets (WEEKLY_VOLUME_TARGETS in constants.ts)
MEV/MAV/MRV per muscle, based on RP framework. Displayed as progress bars in WeeklyVolumePanel.
Color zones: gray (<MEV) → green (MEV–MAV) → amber (MAV–MRV) → red (>MRV).

## Supabase Conventions
- Supabase many-to-one joins return objects, NOT arrays (e.g. `exercises` join in `getTodaySets`)
- Use server client (`lib/supabase/server.ts`) in Server Components and Server Actions
- Use browser client (`lib/supabase/client.ts`) only in Client Components that need realtime
- Row Level Security is ON for all tables — never disable it

## Testing Conventions
- Pure functions (`fatigue.ts`, `constants.ts`) get unit tests
- Test files live next to source: `fatigue.test.ts` alongside `fatigue.ts`
- Current test count: 36 tests in `src/lib/fatigue.test.ts`

## Git Workflow
- Branch naming: `feature/*`, `fix/*`, `chore/*`, `refactor/*`
- Never commit directly to main
- Always run typecheck + lint before committing
- PR title format: `feat: ...`, `fix: ...`, `chore: ...`
- Squash merge all PRs

## Hard Rules
- Never use `any` in TypeScript — always type properly
- Never hardcode recovery times, decay rates, or volume thresholds — use `lib/constants.ts`
- Never put Supabase queries directly in components — use `lib/db/` functions
- Never commit `.env.local` or any file containing real secrets
- Never modify `components/ui/` (shadcn) directly
- Never disable RLS on any Supabase table
- Always verify `fatigue.ts` changes are committed before merging — local-only edits won't deploy to Vercel
- Always run `git diff` before creating a PR to catch uncommitted changes in critical files

## v1.0 Feature Set
- Auth (email + Google OAuth)
- 43 calisthenics exercises in Push/Pull/Core/Legs categories
- Personal 1RM per exercise (auto-updates on personal records)
- Anatomical SVG body diagram with clip-path-bounded muscle groups
- Science-based fatigue model (SFR zones, session cap, per-muscle recovery)
- Weekly volume tracker vs MEV/MAV/MRV thresholds
- Workout history page (day-by-day)
- Delete logged sets with optimistic UI
- Feedback submission page
- Time-based exercises (seconds) and rep-based exercises
- Stepper input with direct typing support
