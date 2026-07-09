# Training Planner — architecture decision record

Status: accepted for the `feat/next-backend-foundation` branch.

## Why this exists

The public static PWA validated product direction, but it is not a production architecture. External audit identified three release blockers:

1. Static calendar is hardcoded to July 2026 and day integers.
2. Coach verification is a localStorage/UI placebo.
3. Persistence is localStorage-only.

Therefore, the product path is **not** to keep expanding the static PWA. The static app remains a review/demo artifact only while the real product moves to the Next.js backend branch.

## Stack decision

| Layer | Decision | Reason |
|---|---|---|
| App | Next.js App Router + TypeScript | One repo for UI + server routes/actions, good velocity for a small team. |
| Styling | Tailwind CSS | Preserve validated pastel premium aesthetic with component-level ergonomics. |
| Database | PostgreSQL in production, SQLite only for local seed/dev | Real persistence, backups, multi-device, server-side permissions. |
| ORM | Prisma | Typed schema, migrations, fast iteration, clear relation modeling. |
| Auth | Auth.js / NextAuth with httpOnly sessions | Removes role trust from localStorage; server can gate routes/actions. |
| Password hashing | bcrypt now; argon2 acceptable later | Practical starting point; never store plaintext. |
| Garmin | Official Garmin OAuth/API only | No Garmin credentials in app; tokens encrypted server-side. |
| Billing | Stripe subscriptions + server-side feature flags | Avoid frontend-only paywalls. |

## Security/product gates before external users

No real athlete data may be entered until all are true:

- Real auth sessions are enforced server-side.
- `COACH_VERIFIED` and `CoachAthleteRelation.status = ACTIVE` are checked before every coach read/write.
- Workouts use real `date` fields, not day-of-month integers.
- Data is stored in server DB with backup strategy.
- Destructive actions require confirmation/undo.
- Privacy/export/delete path is designed for EU health-adjacent data.

## Data model direction

The Prisma branch already uses real dates and server entities:

```text
User
CoachProfile
AthleteProfile
CoachAthleteRelation
SportProfile
Workout.date          # real DateTime, not day: 1..31
GarminActivity
WorkoutAnalysis
WeeklyReview
AuditLog
```

Next additions:

```text
Feedback
Competition
RaceStrategy
Subscription / BillingCustomer
FeatureFlag / Plan limits
```

## Roadmap order

1. **Phase 0 — Architecture lock**: this document + audit capture.
2. **Phase 1 — Product-safe foundation**: real dates/calendar navigation, real auth/session guard, DB-backed CRUD for workouts.
3. **Phase 2 — Roles/multi-tenancy**: invitations and server-side coach-athlete permissions.
4. **Phase 3 — Garmin**: OAuth, token storage, activity import, plan-vs-actual matching.
5. **Phase 4 — Monetization**: Stripe, server-side feature gates.
6. **Phase 5 — Product polish**: confirmations, accessibility, offline/PWA build hashing, tests.

## Static PWA policy

The static `app.html`/`app.js` version must be labelled and treated as:

```text
Demo only — no real users, no real health data, no coach privacy guarantee.
```

Further product work should happen in Next.js unless the change is a quick visual/demo patch.
