# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is
A calisthenics workout tracker. Users log exercises and sets, and see a human body SVG diagram where muscle groups glow from white (fully recovered) to dark red (heavily fatigued), fading back to white over time as muscles recover.

## Architecture
- Single Next.js 14 app (App Router, TypeScript 5) — no separate backend
- Supabase for database, auth, and realtime (JS client v2)
- Tailwind CSS 3, shadcn/ui, TanStack Query v5, Zod
- Vercel for deployment, GitHub Actions for CI/CD

## Key Directories
- `frontend/` — the entire Next.js app
- `.claude/commands/` — reusable slash command workflows
- `.github/workflows/` — CI/CD pipelines

Within `frontend/src/`:
- `app/` — App Router pages: `(auth)/` for login/signup, `(dashboard)/` for protected pages, `api/` for webhooks
- `components/ui/` — shadcn components (never modify directly)
- `components/muscle-map/` — SVG body diagram components
- `lib/constants.ts` — muscle recovery times and color thresholds
- `lib/fatigue.ts` — fatigue decay algorithm (pure functions, fully unit-tested)
- `lib/db/` — all Supabase query functions (`exercises.ts`, `sessions.ts`, `fatigue.ts`)
- `lib/supabase/client.ts` — browser Supabase client (for Client Components + realtime)
- `lib/supabase/server.ts` — server Supabase client (for RSC + Server Actions)

## Essential Commands
```bash
cd frontend && npm run dev          # start dev server
cd frontend && npm run build        # production build
cd frontend && npm run typecheck    # tsc --noEmit
cd frontend && npm run lint         # eslint
cd frontend && npm test             # jest
cd frontend && npm run test:watch   # jest --watch
```

To run a single test file: `cd frontend && npm test -- path/to/file.test.ts`

## Environment Variables
Copy `.env.example` to `frontend/.env.local`. Required vars:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose to client
- `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

## Core Domain Model

```typescript
type MuscleGroup =
  | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
  | 'biceps' | 'triceps' | 'forearms'
  | 'upper_back' | 'lats' | 'lower_back'
  | 'abs' | 'obliques'
  | 'glutes' | 'quads' | 'hamstrings' | 'calves'

type MuscleActivation = { muscle: MuscleGroup; intensity: number }  // intensity: 0.0–1.0
type FatigueState = Record<MuscleGroup, number>  // 0.0 (fresh) → 1.0 (destroyed)
```

## Key Business Rules
- Fatigue decays at ~0.05 per hour (configurable in `lib/constants.ts` — never hardcode)
- Logging a set: `newFatigue = min(1.0, currentFatigue + intensity * volume)`
- Volume = sets × reps, normalized (3×10 = 1.0 volume unit)
- Fatigue is per-user, persisted in Supabase, recalculated fresh on each load
- Guest users get local state only — no persistence

## Fatigue Color Scale
- 0.0 → `#FFFFFF` (white — fully recovered)
- 0.25 → `#FFD6D6` (light pink)
- 0.5 → `#FF8080` (medium red)
- 0.75 → `#FF2020` (dark red)
- 1.0 → `#8B0000` (deep red — maximum fatigue)

## Supabase Conventions
- Use server client (`lib/supabase/server.ts`) in Server Components and Server Actions
- Use browser client (`lib/supabase/client.ts`) only in Client Components that need realtime
- Row Level Security is ON for all tables — never disable it

## Testing Conventions
- Pure functions (`fatigue.ts`, `constants.ts`) get unit tests
- Components get integration tests with Testing Library
- Test files live next to source: `fatigue.test.ts` alongside `fatigue.ts`

## Git Workflow
- Branch naming: `feature/*`, `fix/*`, `chore/*`, `refactor/*`
- Never commit directly to main
- Always run typecheck + lint before committing
- PR title format: `feat: ...`, `fix: ...`, `chore: ...`

## Hard Rules
- Never use `any` in TypeScript — always type properly
- Never store fatigue values as floats for display — round to 2dp max
- Never hardcode muscle recovery times — use `lib/constants.ts`
- Never put Supabase queries directly in components — use `lib/db/` functions
- Never commit `.env.local` or any file containing real secrets
- Never use `dangerously-skip-permissions` in Claude Code

## What NOT to Build Yet
- No Stripe integration until auth + core tracker is working
- No realtime subscriptions until basic persistence works
- No mobile optimization until desktop layout is finalized