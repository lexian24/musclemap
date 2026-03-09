Add a new exercise to the app end-to-end.

## Step 1 — Gather Information

Ask the user for:
- **Exercise name** (e.g. "Pike Push-up")
- **Muscle groups targeted** — list which `MuscleGroup` values from the domain model are activated

Valid muscle groups:
`chest`, `front_delts`, `side_delts`, `rear_delts`, `biceps`, `triceps`, `forearms`, `upper_back`, `lats`, `lower_back`, `abs`, `obliques`, `glutes`, `quads`, `hamstrings`, `calves`

Do not proceed until you have both pieces of information.

## Step 2 — Assign Intensity Values

Using real calisthenics knowledge, assign an `intensity` (0.0–1.0) to each targeted muscle group:
- Primary movers: 0.7–1.0
- Secondary movers / synergists: 0.3–0.6
- Stabilisers: 0.1–0.2

## Step 3 — Add to Seed SQL

Append an `INSERT` for the exercise to `frontend/supabase/seed.sql`. Follow the existing format in that file exactly. Include one row per muscle activation.

## Step 4 — Add to Static TypeScript List

Read `frontend/src/lib/exercises.ts`. Add an entry for the new exercise following the existing structure. The entry must include the exercise name and a `muscles` array of `MuscleActivation` objects with the intensity values from Step 2.

If `frontend/src/lib/exercises.ts` does not exist yet, create it with the appropriate types exported from the domain model.

## Step 5 — Write Unit Tests

Add tests to `frontend/src/lib/exercises.test.ts` for the new exercise. Each exercise entry must have tests that verify:
1. The exercise exists in the exported list (find by name, assert it is defined)
2. It has at least one muscle activation (`muscles.length >= 1`)
3. Every intensity value is between 0 and 1 inclusive

Follow the existing test style in the file. If the file does not exist yet, create it with the proper imports and a `describe` block.

## Step 6 — Quality Gate

Run `/project:check` to execute typecheck, lint, and tests. Fix any issues that arise, then re-run until all checks pass.

## Step 7 — Report

Print a completion summary:

```
Exercise added: <name>
Muscles mapped: <muscle: intensity, ...>
Test written: frontend/src/lib/exercises.test.ts
All checks: ✓ passed
```
