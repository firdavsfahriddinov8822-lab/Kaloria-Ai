# Kaloriya

AI-powered fitness & nutrition coach (Uzbek-first). Installable PWA + Node/TypeScript API.

## Layout

```
kaloriya/
  apps/
    web/          # Vite + React + TS + Tailwind + PWA
    api/          # Express + TS + Mongo + Redis + JWT
  packages/
    shared/       # shared types, calc, exercises, features
```

## Getting started

```bash
npm install
npm run typecheck
npm run build
```

Run web dev server:

```bash
npm run dev:web
```

Run API dev server (needs Mongo + Redis + `.env`):

```bash
cp apps/api/.env.example apps/api/.env   # edit values
npm run dev:api
```

## Phase status

- [x] Phase 1 — Monorepo + backend foundation + auth + AI proxy
- [ ] Phase 2 — Subscriptions & gating
- [ ] Phase 3 — Onboarding funnel
- [ ] Phase 4 — Nutrition depth
- [ ] Phase 5 — AI intelligence
- [ ] Phase 6 — Workouts expansion
- [ ] Phase 7 — Motivation & community
- [ ] Phase 8 — Lifestyle
- [ ] Phase 9 — Monetization polish

## Language rules

- Code / comments / identifiers: **English**.
- User-facing strings (UI copy, AI output, notifications): **Uzbek (latin script)**.

## Safety guardrails

Calorie floor 1500 kkal (M) / 1200 kkal (F), max 25% deficit, ≤1 kg/week loss cap. Enforced in `packages/shared/src/calc.ts` and mirrored server-side.
