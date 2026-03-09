Run the full quality gate before committing. Execute each step in order and do not skip ahead.

## Step 1 — Type Check

```
cd frontend && npm run typecheck
```

If there are type errors, fix every one of them. After fixing, re-run `npm run typecheck` and confirm the output is clean (zero errors) before continuing.

## Step 2 — Lint

```
cd frontend && npm run lint
```

If there are lint errors:
1. Run `cd frontend && npm run lint -- --fix` to auto-fix what ESLint can fix automatically.
2. For any remaining errors that cannot be auto-fixed, fix them manually in the source files.
3. Re-run `cd frontend && npm run lint` and confirm it exits clean before continuing.

## Step 3 — Tests

```
cd frontend && npm test
```

If any tests fail, fix the failing tests or the broken code that caused them to fail. Re-run `cd frontend && npm test` and confirm all tests pass before continuing.

## Done

Only report the command as complete when **all three steps pass with zero errors or failures**.

Print a final summary in this format:

```
✓ Typecheck — clean
✓ Lint — clean
✓ Tests — X passed

Summary: <either "All checks passed with no issues" or a brief list of what was fixed>
```
