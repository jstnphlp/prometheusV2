# Prometheus portfolio

Public portfolio for Prometheus, built with Next.js, React, TypeScript, Tailwind CSS, and Three.js.

This repository started from an internal business application template.
The portfolio baseline removes authentication, Supabase, RBAC, database, customer-management, and private-file runtime assumptions so the public site is the primary product.

## Current design scope

The active build is intentionally focused on two viewports before the rest of the portfolio is developed.

- Hero: translate and polish the existing working hero artifact against Figma page `117:113`.
- Project gallery: implement the Figma `2nd viewport` page `133:305` as a Three.js scene with classical pillars and three interactive project books.

The three books represent portfolio projects.
Selecting a book will eventually open the book and reveal the case study for that project.
The exact case-study surface remains a deliberate UX decision between an in-place reader and a dedicated project route.

See `docs/ARCHITECTURE.md` for the technical boundaries and GLB contract.
See `docs/IMPLEMENTATION_PLAN.md` for the build sequence.
See `docs/POSTHOG_ANALYTICS.md` for the portfolio analytics contract.
See `docs/POSTHOG_IMPLEMENTATION_PROMPT.md` for the implementation prompt used to add PostHog safely.

## Local development

Requirements:

- Node.js 24.
- Corepack.
- pnpm 11.

Run:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`.

No environment variables or local database are required for the current portfolio baseline.
PostHog must remain optional, so local development continues to work when its public environment variables are absent.

## Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the browser-level homepage check with:

```bash
pnpm test:e2e
```

## Structure

- `src/app/page.tsx` currently contains the public portfolio composition and will remain the server-rendered route owner.
- `src/app/globals.css` contains the current baseline visual system and responsive behavior.
- `src/config/app.ts` is the canonical source for portfolio name and description.
- `tests/e2e/home.spec.ts` covers the critical public homepage path.
- `docs/ARCHITECTURE.md` defines the planned Hero and Three.js boundaries.
- `docs/IMPLEMENTATION_PLAN.md` defines the implementation order.
- `docs/POSTHOG_ANALYTICS.md` defines the semantic event taxonomy, privacy boundary, and analytics testing policy.
- `docs/POSTHOG_IMPLEMENTATION_PROMPT.md` contains the implementation instructions for the PostHog vertical slice.

Three.js is intentionally isolated to the project-gallery client boundary when implementation begins.
The hero and case-study content should not depend on WebGL.
Analytics must remain outside low-level Three.js rendering and must never become required for portfolio behavior.

## Design source

The working design file is `Promotheus-Design-Improvements` in Figma.
The current implementation references are the `hero` page at node `117:113` and the `2nd viewport` page at node `133:305`.

Figma is the visual source of truth.
The repository documentation is the source of truth for runtime boundaries, asset contracts, accessibility, testing, performance behavior, and analytics behavior.
