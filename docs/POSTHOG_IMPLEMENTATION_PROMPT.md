# PostHog implementation prompt

Use this prompt with a coding agent when implementing PostHog in this repository.

## Prompt

Repository: `https://github.com/jstnphlp/prometheusV2`

Implement PostHog analytics for the Prometheus public portfolio.

Do not modify `main` directly.
Work only on the existing branch `feat/posthog-analytics`.
Preserve all existing visual behavior, animation behavior, Three.js behavior, navigation behavior, accessibility, and performance characteristics unless a change is strictly required for analytics instrumentation.

### Current stack

The repository currently uses Next.js 16.3.4, React 19, TypeScript, Tailwind CSS, Lenis, Motion, and Three.js.
The site uses the App Router.
`src/app/page.tsx` owns the public portfolio composition.
`src/app/layout.tsx` owns the root layout.
The homepage contains the Hero, Project Gallery, Approach, Capabilities, Contact, and Footer areas.
The project gallery has a narrow Three.js client boundary and must remain isolated from analytics concerns.

### Goal

Add lightweight, privacy-conscious PostHog product analytics and Session Replay support for the public portfolio.
The purpose is to understand how visitors progress through the portfolio and interact with projects without turning the application into an analytics-driven architecture.

PostHog must remain optional at runtime.
The application must continue to build and run when PostHog environment variables are absent.

### Source of truth

Follow the current official PostHog Next.js integration pattern.
Use `posthog-js`.
Use Next.js client instrumentation through `instrumentation-client.ts`.
Do not introduce `posthog-node` because this portfolio currently has no server-side analytics requirement.
Do not add a React provider unless a concrete feature requires it.

Reference:
https://posthog.com/docs/libraries/next-js

### Environment variables

Add these documented variables to `.env.example`:

```env
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
```

Do not commit real project tokens, personal API keys, or secrets.
The PostHog project token is intended for client-side initialization.
Never expose a PostHog personal API key in the browser bundle.

### Initialization

Create `instrumentation-client.ts` in the correct location for this Next.js repository.

Initialize PostHog only when both public environment variables are present.

Use:

```ts
defaults: "2026-05-30"
```

Keep anonymous-first person handling with `person_profiles: "identified_only"`.
Do not call `identify`, `alias`, `group`, or person-property APIs because this public portfolio has no account system and does not need identified visitors.

Do not manually duplicate pageview events if the configured PostHog SDK already captures them correctly.

### Analytics module

Create a small analytics module under:

```text
src/lib/analytics/
  events.ts
  capture.ts
```

Keep this module shallow and explicit.
Do not spread raw `posthog.capture()` calls through unrelated components.

Create typed semantic event names and typed event properties.
The wrapper must safely no-op when PostHog is not configured or when it is executed outside the browser.

Prefer semantic product events over DOM-level event spam.

### Event taxonomy

Implement only events that represent meaningful portfolio behavior.

#### Navigation

`navigation_menu_opened`

Properties:

```text
location: "hero"
```

`navigation_menu_closed`

Properties:

```text
location: "hero"
reason: "button" | "navigation" | "escape" | "outside"
```

`navigation_link_clicked`

Properties:

```text
target: string
location: "hero_menu"
```

#### Section progression

Use one event:

`portfolio_section_viewed`

Properties:

```text
section: "hero" | "projects" | "approach" | "capabilities" | "contact"
visibility_threshold: number
```

Capture each section at most once per page visit.
Use `IntersectionObserver`.
Do not attach high-frequency scroll listeners.
Use an intentional threshold such as `0.5` unless the existing layout requires a different threshold for reliable detection.

#### Project gallery

`project_gallery_ready`

Capture when the interactive project gallery has successfully become usable.

Properties:

```text
mode: "webgl" | "fallback"
```

`project_selected`

Properties:

```text
project_slug: string
input: "pointer" | "keyboard" | "dom_control"
source: "book" | "project_control"
```

Do not fire separate analytics events for every animation frame, hover frame, pointer move, raycast check, or render-loop update.

#### Case study

When the case-study experience exists or is already reachable, instrument:

`case_study_opened`

Properties:

```text
project_slug: string
source: string
```

`case_study_closed`

Properties:

```text
project_slug: string
```

If the case-study surface is not yet implemented, keep the typed event definitions ready but do not invent UI or behavior solely to fire analytics.

#### Contact and portfolio actions

Instrument the actual contact CTA once it exists:

`contact_cta_clicked`

Properties:

```text
location: string
destination_type: "email" | "booking" | "social" | "other"
```

Instrument the existing back-to-top link:

`back_to_top_clicked`

Properties:

```text
location: "contact"
```

Do not fabricate contact conversion events when the site only contains placeholder copy.

### Session Replay

Keep PostHog Session Replay available for the site.
Do not weaken PostHog's privacy defaults.

Do not intentionally capture passwords, form values, private user-entered content, tokens, authorization data, or sensitive URL parameters.

The current public site has no authentication flow.
If a contact form is introduced later, review its fields before replay or autocapture is allowed to observe them.

Document that Session Replay can be configured or sampled from PostHog project settings without changing application architecture.

Reference:
https://posthog.com/docs/session-replay

### Autocapture

Keep PostHog autocapture available unless it creates duplicate or noisy data during verification.
Custom semantic events are the canonical analytics contract for Prometheus.
Do not build critical dashboards that depend on fragile CSS selectors when a semantic event exists.

### Three.js boundary

Do not import PostHog into low-level renderer, loader, camera, animation-loop, or WebGL utility modules.

Analytics should be triggered from the React interaction boundary after meaningful state transitions.

Examples:

- Report that the gallery became usable from the gallery client boundary.
- Report `project_selected` after a semantic project selection is accepted.
- Never report raycast checks, hover frames, animation mixer frames, camera movement, or render calls.

This preserves the existing Three.js architecture.

### Lenis and sticky viewport behavior

Do not change smooth scrolling, sticky viewport behavior, or scroll animation timing merely to make analytics easier.

Section visibility tracking must work with the current scrolling architecture.
Use browser observation rather than coupling analytics to Lenis internals unless the browser observer is proven unreliable.

### Privacy

Keep visitors anonymous.
Do not send names, emails, message contents, or other intentionally identifying properties through custom events.

Only send properties necessary to understand portfolio behavior.

Document what is collected, what is intentionally not collected, where PostHog configuration lives, how to disable PostHog locally, and how to add a new event safely.

Do not present engineering documentation as legal advice.

### Development behavior

If the environment variables are missing, PostHog must remain disabled and the portfolio must behave normally.

Do not log analytics errors noisily in production.
Do not make analytics failures block navigation, project selection, WebGL initialization, or any user interaction.

### Testing

Add focused tests for the analytics contract.

At minimum verify:

- the capture helper is safe when PostHog is not configured
- semantic events call PostHog with the expected event name and properties when configured
- section-view events are deduplicated per page visit
- analytics does not change existing project selection behavior

Do not make unit or E2E tests depend on live PostHog network access.

If the test environment has no PostHog environment variables, no analytics network request should be required.

Run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Fix regressions caused by the implementation.

### Documentation

Keep `docs/POSTHOG_ANALYTICS.md` aligned with the actual implementation.

Update the event taxonomy if event names or properties change.
Update `.env.example` with the required public variables.
Keep README and architecture references accurate.

### Recommended initial PostHog views

Document these as recommended dashboards or insights.
Do not hardcode dashboard IDs into the application.

1. Portfolio traffic with visitors, sessions, referrers, landing pages, devices, and browsers.
2. Section progression from hero to projects to approach to capabilities to contact.
3. Project engagement from projects viewed to project selected to case study opened to contact CTA clicked.
4. Project popularity by breaking down `project_selected` by `project_slug`.
5. Session replay review for sessions containing project selections, contact-section visits, errors, or repeated interaction around project controls.

### Acceptance criteria

The work is complete only when PostHog initializes once when configured.
The application must work normally with no PostHog environment variables.
Visitors must remain anonymous.
The event taxonomy must be typed and centralized.
Meaningful navigation, section progression, project selection, and available CTA actions must be tracked.
Session Replay must remain privacy-conscious.
Three.js must remain isolated from analytics internals.
No high-frequency animation or scroll telemetry may be introduced.
Existing visual behavior must remain unchanged.
Lint, typecheck, unit tests, build, and E2E tests must pass.

Commit the completed implementation to `feat/posthog-analytics`.
Do not merge it into `main`.

At the end, report the files changed, events added, verification results, and any PostHog dashboard setup that must still be performed manually in the PostHog UI.
