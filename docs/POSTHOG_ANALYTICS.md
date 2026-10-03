# PostHog analytics

## Purpose

Prometheus uses PostHog to understand how visitors move through the public portfolio and interact with portfolio projects.
Analytics must remain an observational layer rather than a dependency of navigation, animation, Three.js rendering, or case-study behavior.
The site must continue to function normally when PostHog is not configured.

## Current scope

The first implementation is client-side only.
Use `posthog-js`.
Do not add `posthog-node` until a concrete server-side analytics requirement exists.
The portfolio currently has no authenticated user model, so analytics should remain anonymous.

PostHog's current Next.js guidance supports client initialization through `instrumentation-client.ts`.
Reference: https://posthog.com/docs/libraries/next-js

## Runtime configuration

Use these public environment variables:

```env
NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NEXT_PUBLIC_POSTHOG_HOST=
```

Do not commit real environment values.
Do not expose a PostHog personal API key in the browser.

Initialize PostHog only when both public variables are present.
Use the current recommended defaults version from PostHog's Next.js documentation:

```ts
defaults: "2026-05-30"
```

Keep person profiles in `identified_only` mode.
Do not call `identify`, `alias`, `group`, or person-property APIs unless the portfolio later gains a real identity requirement.

## Architectural boundary

Create a small analytics module under `src/lib/analytics`.
Components should emit semantic portfolio events through that module instead of spreading raw `posthog.capture()` calls through unrelated code.

The Three.js layer must not own analytics.
Renderer lifecycle, raycasting, animation mixers, camera state, asset loading, and render loops should stay independent.
A React interaction boundary may report an event after a meaningful state transition has occurred.

Analytics failure must never block portfolio behavior.

## Event taxonomy

### `navigation_menu_opened`

Capture when the hero navigation drawer is intentionally opened.

Properties:

```text
location: "hero"
```

### `navigation_menu_closed`

Capture when the hero navigation drawer closes.

Properties:

```text
location: "hero"
reason: "button" | "navigation" | "escape" | "outside"
```

### `navigation_link_clicked`

Capture when a visitor chooses a destination from the hero navigation.

Properties:

```text
target: string
location: "hero_menu"
```

### `portfolio_section_viewed`

Capture once per section per page visit when a section crosses the agreed visibility threshold.

Properties:

```text
section: "hero" | "projects" | "approach" | "capabilities" | "contact"
visibility_threshold: number
```

Use `IntersectionObserver`.
Do not implement continuous scroll telemetry.

### `project_gallery_ready`

Capture when the projects area becomes usable.

Properties:

```text
mode: "webgl" | "fallback"
```

### `project_selected`

Capture after a semantic project selection is accepted.

Properties:

```text
project_slug: string
input: "pointer" | "keyboard" | "dom_control"
source: "book" | "project_control"
```

Do not capture raycast checks, pointer movement, render frames, or animation frames.

### `case_study_opened`

Capture when an implemented case-study surface is opened.

Properties:

```text
project_slug: string
source: string
```

Do not add UI only to create this event.

### `case_study_closed`

Capture when an open case study is closed.

Properties:

```text
project_slug: string
```

### `contact_cta_clicked`

Capture when a real contact destination is activated.

Properties:

```text
location: string
destination_type: "email" | "booking" | "social" | "other"
```

Do not report a contact conversion for placeholder copy.

### `back_to_top_clicked`

Capture from the current contact section's back-to-top link.

Properties:

```text
location: "contact"
```

## Pageviews and autocapture

Allow the PostHog SDK to own its standard automatic browser events unless testing shows a concrete need to change that behavior.
Do not emit duplicate custom pageview events.

Custom semantic events are the stable Prometheus analytics contract.
Prefer them over CSS selectors or DOM structure when building long-lived funnels and insights.

## Session replay

Session Replay is useful for this portfolio because project books, sticky sections, smooth scrolling, and Three.js interactions are difficult to evaluate from aggregate event counts alone.
PostHog supports recording rules and client-side masking controls, so replay settings must preserve privacy rather than collect everything by default.
Reference: https://posthog.com/docs/session-replay

Do not intentionally capture passwords, authentication data, message contents, private form values, API keys, tokens, sensitive URL parameters, or unnecessary personal information.

The current portfolio has no authentication or user profile flow.
Before introducing a contact form, review its fields and replay behavior explicitly.

Replay sampling and recording rules should be managed in PostHog rather than by coupling application architecture to replay settings.

## Data minimization

The initial portfolio analytics should remain anonymous.
Custom event properties should describe product behavior rather than visitor identity.

Do not add names, email addresses, inferred lead identity, or similar personal properties to events simply because PostHog supports them.

PostHog documents `person_profiles: "identified_only"` as its recommended anonymous-first mode.
Reference: https://posthog.com/docs/data/anonymous-vs-identified-events

## Development behavior

Local development does not require PostHog.
Leaving the public PostHog environment variables unset should disable initialization without errors.

Automated tests must not depend on live PostHog ingestion.

## Recommended initial insights

### Portfolio traffic

Track visitors, sessions, referrers, landing pages, device classes, and browsers.

### Section progression

Build a progression view around:

```text
hero
projects
approach
capabilities
contact
```

Use `portfolio_section_viewed` rather than scroll-percentage telemetry.

### Project engagement

Build a funnel around:

```text
projects section viewed
project selected
case study opened
contact CTA clicked
```

Only include stages that exist in the current product.

### Project popularity

Break down `project_selected` by `project_slug`.

### Session replay review

Create saved replay filters for sessions that selected a project, reached contact, encountered errors, or repeatedly interacted with project controls.

## Testing

Tests should verify the semantic analytics boundary rather than PostHog's SDK internals.

At minimum, verify that analytics safely no-ops when not configured.
Verify that expected semantic events are captured with expected properties when configured.
Verify that section-view events are deduplicated during a page visit.
Verify that project selection behavior does not depend on analytics success.

CI and E2E tests must not require access to PostHog.

## Adding a new event

Before adding an event, answer these questions.

1. What product question will this event answer?
2. Is an existing event plus a property sufficient?
3. Is the event tied to a semantic user action rather than an implementation detail?
4. Can the event be captured once at a stable React boundary?
5. Does it avoid unnecessary personal data?
6. Will its name and properties still make sense if the component markup changes?

If those conditions are satisfied, add the event to the centralized typed taxonomy and update this document in the same change.

## Privacy note

This document defines the engineering collection policy for Prometheus.
It is not legal advice.
Any production deployment should still review applicable privacy, disclosure, consent, and retention requirements for the audiences and jurisdictions the site serves.
