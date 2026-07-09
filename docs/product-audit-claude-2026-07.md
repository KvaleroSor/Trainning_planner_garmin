# Product audit — Claude review, July 2026

## Verdict

The visual/product direction is promising, but the static PWA must not be called a production product.

## Release blockers

1. **Hardcoded calendar** — the vanilla PWA uses day integers and July 2026 assumptions (`new Date(2026, 6, day)`, fixed 1–31). This breaks as soon as the month changes and prevents real scheduling.
2. **Coach gate is not security** — `coachVerified` in localStorage is a UI-only demo. Real athlete data requires server-side auth and permissions.
3. **localStorage persistence** — no backup, no multi-device sync, data can disappear on browser cleanup.

## Important fixes

- Avoid full app `innerHTML` re-render on every small action.
- Add confirmation/undo to destructive actions.
- Remove unused functions such as legacy selected-day renderers in the static app.
- Centralize service-worker/cache versioning.
- Add PNG manifest icon fallbacks.
- Improve modal focus management and Escape close.
- Add numeric validation constraints.
- Split large vanilla JS file if static prototype continues growing.

## Product-safe direction

The correct response is to continue the Next.js backend branch, not to pretend the localStorage PWA is secure.

Immediate priorities:

1. `ARCHITECTURE.md` decision record.
2. Next calendar with real dates and month navigation.
3. Auth/session guard and server-side coach-athlete permission helper.
4. DB-backed workout CRUD.
5. Garmin OAuth/import after auth and roles exist.

## Static demo wording

Public demo links must be described as prototype/review only:

```text
No real user data, no real coach privacy, no production guarantees.
```
